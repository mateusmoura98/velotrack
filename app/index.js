import { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  View, Text, Animated, TouchableOpacity, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { colors, radii, spacing } from '../src/theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, useNativeDriver: true }),
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Logo Brand / Subtle cyber ambient */}
          <Animated.View style={[styles.logoBox, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <View style={[styles.glowDot, { backgroundColor: 'rgba(230,0,80,0.06)' }]} />
            <Text style={styles.logoText}>
              <Text style={{ color: colors.text }}>VELO</Text>
              <Text style={{ color: colors.primary }}>TRACK</Text>
            </Text>
            <Text style={styles.logoSub}>SISTEMA DE GESTÃO TÉCNICA</Text>
          </Animated.View>

          {error ? (
            <Animated.View style={[styles.errorBox, { backgroundColor: colors.errorSoft, borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Premium Card Surface */}
          <Animated.View style={[styles.card, { opacity: fade, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.cardHeaderTitle}>Acessar Conta</Text>
            <Text style={styles.cardHeaderSub}>Bem-vindo! Forneça suas credenciais abaixo</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>E-mail corporativo</Text>
              <View style={[
                styles.inputWrap, 
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                email ? { borderColor: colors.primary, backgroundColor: 'rgba(230,0,80,0.02)' } : null
              ]}>
                <Ionicons name="mail-outline" size={16} color={email ? colors.primary : colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="name@company.com"
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
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Senha de acesso</Text>
              </View>
              <View style={[
                styles.inputWrap, 
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                password ? { borderColor: colors.primary, backgroundColor: 'rgba(230,0,80,0.02)' } : null
              ]}>
                <Ionicons name="lock-closed-outline" size={16} color={password ? colors.primary : colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text, flex: 1 }]}
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
                  <Text style={styles.loginText}>CONECTAR SISTEMA</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Minimal footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>VELOTRACK PLATFORM © 2026</Text>
            <Text style={styles.footerSubText}>SaaS Enterprise Technology</Text>
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
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  logoBox: { alignItems: 'center', marginBottom: 38, position: 'relative' },
  glowDot: {
    position: 'absolute',
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(99,91,255,0.06)',
    blurRadius: 40,
    zIndex: -1,
  },
  logoText: {
    fontSize: 26, fontWeight: '950', letterSpacing: 5,
  },
  logoSub: {
    fontSize: 9, color: colors.primary, letterSpacing: 4,
    marginTop: 10, fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.errorSoft, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.xl,
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '600', flex: 1 },
  card: {
    backgroundColor: colors.card, borderRadius: radii.lg,
    padding: spacing['2xl'], borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
  },
  cardHeaderTitle: {
    fontSize: 18, fontWeight: '800', color: colors.text,
    letterSpacing: -0.3, marginBottom: 4,
  },
  cardHeaderSub: {
    fontSize: 13, color: colors.textMuted,
    marginBottom: spacing['2xl'], fontWeight: '500',
  },
  field: { marginBottom: spacing.xl },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: {
    color: colors.textMuted, fontSize: 10, fontWeight: '800',
    marginBottom: spacing.sm, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.md, paddingHorizontal: spacing.md, height: 48,
  },
  inputActive: { borderColor: colors.primary, backgroundColor: 'rgba(99,91,255,0.02)' },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, color: colors.text, fontSize: 14, height: '100%', outlineStyle: 'none',
  },
  eye: { padding: 5, marginLeft: 6 },
  loginBtn: {
    backgroundColor: colors.primary, borderRadius: radii.md, height: 48,
    justifyContent: 'center', alignItems: 'center', marginTop: spacing.xs,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  loginText: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  footer: { alignItems: 'center', paddingTop: 40, paddingBottom: 10 },
  footerText: { color: colors.text, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  footerSubText: { color: colors.textMuted, fontSize: 9, fontWeight: '500', letterSpacing: 1, marginTop: 3 },
});
