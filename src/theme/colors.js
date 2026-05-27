export const colors = {
  // Background
  bg: '#06060C',
  bgSecondary: '#0A0A12',
  surface: '#0F0F1A',
  surfaceElevated: '#16161F',
  surfaceLight: '#1C1C28',

  // Primary
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryGlow: 'rgba(99, 102, 241, 0.35)',
  primarySoft: 'rgba(99, 102, 241, 0.12)',
  primaryBorder: 'rgba(99, 102, 241, 0.25)',

  // Accent
  accent: '#06D6A0',
  accentSoft: 'rgba(6, 214, 160, 0.12)',
  accentBorder: 'rgba(6, 214, 160, 0.25)',

  // Text
  text: '#F1F1F6',
  textSecondary: '#9494A6',
  textMuted: '#5C5C72',
  textInverse: '#06060C',

  // Status
  success: '#06D6A0',
  successSoft: 'rgba(6, 214, 160, 0.12)',
  successBorder: 'rgba(6, 214, 160, 0.25)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.12)',
  warningBorder: 'rgba(245, 158, 11, 0.25)',
  error: '#EF4444',
  errorSoft: 'rgba(239, 68, 68, 0.12)',
  errorBorder: 'rgba(239, 68, 68, 0.25)',

  // Border
  border: '#1A1A28',
  borderLight: '#22222F',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.75)',
  skeleton: '#1A1A28',
  skeletonHighlight: '#22222F',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2, lineHeight: 24 },
  subtitle: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  overline: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, lineHeight: 14 },
};
