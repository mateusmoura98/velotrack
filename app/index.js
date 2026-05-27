import { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  View, Text, Animated, TouchableOpacity, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { colors, typography, radii, spacing } from '../src/theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };

  const handleLogin = async () => {
    if (!email.trim()) { showError('Digite seu e-mail.'); return; }
    if (!password) { showError('Digite sua senha.'); return; }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      const m = err?.message || '';
      if (m.includes('Invalid login')) showError('E-mail ou senha incorretos.');
      else if (m.includes('Email not confirmed')) showError('Confirme seu e-mail antes de entrar.');
      else if (m.includes('desativada')) showError('Conta desativada. Procure o administrador.');
      else showError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.logoBox, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <Text style={styles.logoText}>
              <Text style={{ color: colors.text }}>VELO</Text>
              <Text style={{ color: colors.primary }}>TRACK</Text>
            </Text>
            <Text style={styles.logoSub}>GESTÃO TÉCNICA</Text>
          </Animated.View>

          {error ? (
            <Animated.View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <Animated.View style={[styles.card, { opacity: fade }]}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>E-MAIL</Text>
              <View style={[styles.inputWrap, email ? styles.inputActive : null]}>
                <Ionicons name="mail-outline" size={16} color={email ? colors.primary : colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>SENHA</Text>
              <View style={[styles.inputWrap, password ? styles.inputActive : null]}>
                <Ionicons name="lock-closed-outline" size={16} color={password ? colors.primary : colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  secureTextEntry={!show}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShow(!show)} style={styles.eye}>
                  <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>ENTRAR</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footer}>
            <View style={styles.footerBar} />
            <Text style={styles.footerText}>VELOTRACK © 2026</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: spacing['2xl'],
    justifyContent: 'center',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  logoBox: { alignItems: 'center', marginBottom: 32 },
  logoText: {
    fontSize: 28, fontWeight: '900', letterSpacing: 6,
  },
  logoSub: {
    fontSize: 10, color: colors.primary, letterSpacing: 4,
    marginTop: 8, fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.errorSoft, borderWidth: 1, borderColor: colors.errorBorder,
    borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.xl,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '500', flex: 1 },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    padding: spacing['2xl'], borderWidth: 1, borderColor: colors.border,
  },
  field: { marginBottom: spacing.xl },
  fieldLabel: {
    color: colors.textMuted, fontSize: 10, fontWeight: '700',
    marginBottom: spacing.sm, letterSpacing: 1,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceElevated, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radii.md, paddingHorizontal: spacing.md, height: 50,
  },
  inputActive: { borderColor: colors.primary },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, color: colors.text, fontSize: 15, height: '100%', outlineStyle: 'none',
  },
  eye: { padding: 5, marginLeft: 6 },
  loginBtn: {
    backgroundColor: colors.primary, borderRadius: radii.md, height: 50,
    justifyContent: 'center', alignItems: 'center', marginTop: spacing.xs,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  footer: { alignItems: 'center', paddingTop: 50, paddingBottom: 20 },
  footerBar: {
    width: 28, height: 3, backgroundColor: colors.primary,
    borderRadius: 2, marginBottom: 12, opacity: 0.3,
  },
  footerText: { color: colors.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
});
