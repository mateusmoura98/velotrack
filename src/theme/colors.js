let currentTheme = 'dark';
if (typeof window !== 'undefined') {
  try {
    currentTheme = window.localStorage.getItem('velotrack_theme') || 'dark';
  } catch (e) {}
}

export function setTheme(mode) {
  currentTheme = mode;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('velotrack_theme', mode);
    } catch (e) {}
  }
}

export function getTheme() {
  return currentTheme;
}

export const colors = {
  get bg() { return currentTheme === 'dark' ? '#090A0F' : '#F8FAFC'; },
  get surface() { return currentTheme === 'dark' ? '#12131C' : '#FFFFFF'; },
  get card() { return currentTheme === 'dark' ? '#171926' : '#F1F5F9'; },
  get surfaceElevated() { return currentTheme === 'dark' ? '#1E2133' : '#CBD5E1'; },
  get primary() { return '#E60050'; },
  get primaryHover() { return '#C20043'; },
  get primarySoft() { return currentTheme === 'dark' ? 'rgba(230,0,80,0.08)' : 'rgba(230,0,80,0.15)'; },
  get text() { return currentTheme === 'dark' ? '#F8FAFC' : '#090A0F'; },
  get textSecondary() { return currentTheme === 'dark' ? '#E2E8F0' : '#334155'; },
  get textMuted() { return currentTheme === 'dark' ? '#94A3B8' : '#64748B'; },
  get success() { return '#10B981'; },
  get successSoft() { return currentTheme === 'dark' ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)'; },
  get warning() { return '#F59E0B'; },
  get warningSoft() { return currentTheme === 'dark' ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.1)'; },
  get error() { return '#EF4444'; },
  get errorSoft() { return currentTheme === 'dark' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.1)'; },
  get border() { return currentTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'; },
  get borderLight() { return currentTheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'; },
  get overlay() { return currentTheme === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.4)'; },
  get skeleton() { return currentTheme === 'dark' ? '#1F2235' : '#E2E8F0'; },
  get skeletonHighlight() { return currentTheme === 'dark' ? '#2A2E4B' : '#CBD5E1'; },
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
