export const colors = {
  bg: '#090A0F',             // Premium charcoal black (Stripe/Linear look)
  surface: '#12131C',        // Clean dashboard container background
  card: '#171926',           // Beautiful card surface
  surfaceElevated: '#1E2133',// Elevated context surface

  primary: '#635BFF',        // Stripe premium Indigo/Purple
  primaryHover: '#4F46E5',   // Focused/Hover states
  primarySoft: 'rgba(99,91,255,0.08)',

  text: '#F8FAFC',           // Pure high-contrast off-white
  textSecondary: '#E2E8F0',  // Muted body text
  textMuted: '#94A3B8',      // Subdued metadata text

  success: '#10B981',        // Emerald success
  successSoft: 'rgba(16,185,129,0.08)',
  warning: '#F59E0B',        // Tangerine warning
  warningSoft: 'rgba(245,158,11,0.08)',
  error: '#EF4444',          // Crimson error
  errorSoft: 'rgba(239,68,68,0.08)',

  border: 'rgba(255,255,255,0.06)',      // Ultra-thin crisp borders
  borderLight: 'rgba(255,255,255,0.12)', // Subtle highlight border

  overlay: 'rgba(0,0,0,0.85)',
  skeleton: '#1F2235',
  skeletonHighlight: '#2A2E4B',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  md: 8,
  lg: 12,
  xl: 16,
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
