export const colors = {
  bg: '#050816',
  surface: '#0C1124',
  card: '#101826',
  surfaceElevated: '#181E35',

  primary: '#EC167F',
  primaryHover: '#D41472',
  primarySoft: 'rgba(236,22,127,0.10)',
  tabActiveBg: 'rgba(236,22,127,0.12)',

  text: '#FFFFFF',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',

  success: '#10B981',
  successSoft: 'rgba(16,185,129,0.10)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245,158,11,0.10)',
  error: '#EF4444',
  errorSoft: 'rgba(239,68,68,0.10)',

  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',

  overlay: 'rgba(0,0,0,0.75)',
  skeleton: '#181E35',
  skeletonHighlight: '#1E2440',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
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
