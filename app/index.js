import { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  View, Text, Animated, TouchableOpacity, TextInput, ActivityIndicator,
  ImageBackground, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { spacing, radii } from '../src/theme/colors';
import { useThemeColors } from '../src/theme';


export default function LoginScreen() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width > 768;

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

  if (isDesktop) {
    return (
      <View style={[styles.desktopContainer, { backgroundColor: colors.bg }]}>
        {/* Left Side: Premium Connected Fleet Telemetry & Smart Tracking Cockpit Visual */}
        <ImageBackground
          source={require('../src/assets/images/velotrack_bg_1780347223899.png')}
          style={styles.desktopLeft}
          resizeMode="cover"
        >
          {/* Subtle overlay to preserve high image quality and neon colors */}
          <View style={styles.desktopLeftOverlay} />
          
          {/* Centered Logo Brand */}
          <View style={styles.centerBrandContainer}>
            <Text style={styles.centerBrandText}>
              <Text style={{ color: '#FFFFFF' }}>VELO</Text>
              <Text style={{ color: '#E60050' }}>TRACK</Text>
            </Text>
            <Text style={styles.centerBrandTagline}>ENTERPRISE OPERATIONS</Text>
          </View>
        </ImageBackground>

        {/* Right Side: Clean login form */}
        <View style={[styles.desktopRight, { backgroundColor: colors.surface }]}>
          <KeyboardAvoidingView behavior="padding" style={styles.flex}>
            <ScrollView
              contentContainerStyle={styles.desktopRightScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.desktopFormCol}>
                <Text style={[styles.desktopSecureTitle, { color: colors.text }]}>Secure Access</Text>
                <Text style={[styles.desktopSecureSub, { color: colors.textSecondary }]}>
                  Enter your credentials to access the operational dashboard.
                </Text>

                {error ? (
                  <Animated.View style={[styles.errorBox, { backgroundColor: colors.errorSoft, borderColor: 'rgba(239, 68, 68, 0.2)', width: '100%', marginBottom: 24 }]}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                ) : null}

                {/* Email Field */}
                <View style={[styles.field, { width: '100%' }]}>
                  <Text style={styles.fieldLabel}>SYSTEM EMAIL</Text>
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

                {/* Password Field */}
                <View style={[styles.field, { width: '100%' }]}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>PASSWORD</Text>
                    <TouchableOpacity onPress={() => alert('Info', 'Entre em contato com o administrador de sistemas para redefinir sua senha.')}>
                      <Text style={styles.forgotPasswordLink}>FORGOT PASSWORD?</Text>
                    </TouchableOpacity>
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

                {/* Remember Me Option */}
                <View style={styles.rememberRow}>
                  <Ionicons name="checkbox-outline" size={16} color={colors.textMuted} />
                  <Text style={[styles.rememberText, { color: colors.textMuted }]}>Remember this device for 30 days</Text>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginBtn, loading && styles.loginBtnDisabled, { width: '100%', marginTop: 8 }]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.loginText}>Sign In to Workspace</Text>
                  )}
                </TouchableOpacity>

                {/* Footer text */}
                <Text style={[styles.desktopRightFooter, { color: colors.textMuted, marginTop: 24 }]}>
                  New to Velotrack? <Text style={{ color: colors.primary, fontWeight: '700' }}>Contact your system admin</Text>
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    );
  }

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

const getStyles = (colors) => StyleSheet.create({
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

  // Desktop Split Layout Styles
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    height: Platform.OS === 'web' ? '100vh' : '100%',
    width: Platform.OS === 'web' ? '100vw' : '100%',
  },
  desktopLeft: {
    flex: 1.15,
    padding: 64,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  desktopLeftOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 10, 24, 0.25)', // Extremely elegant & subtle shadow overlay
  },
  desktopBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalIconInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  desktopBrandText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  centerBrandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerBrandText: {
    fontSize: 58,
    fontWeight: '950',
    letterSpacing: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  centerBrandTagline: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  desktopSloganContainer: {
    marginTop: 'auto',
    marginBottom: 'auto',
    gap: 4,
  },
  desktopSloganMain: {
    fontSize: 52,
    fontWeight: '950',
    color: '#FFF',
    lineHeight: 60,
    letterSpacing: -1,
  },
  desktopLeftFooterText: {
    fontSize: 10,
    color: '#707E94',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  desktopRight: {
    flex: 0.85,
    backgroundColor: '#07080D', // Matches the exact deep black tone of mockup
    justifyContent: 'center',
  },
  desktopRightScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  desktopFormCol: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  desktopSecureTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  desktopSecureSub: {
    fontSize: 14,
    color: '#707E94',
    lineHeight: 20,
    marginBottom: 32,
  },
  forgotPasswordLink: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 1.2,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    marginTop: 4,
  },
  rememberText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.15,
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.015)',
    gap: 10,
    marginBottom: 24,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  desktopRightFooter: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  }
});
