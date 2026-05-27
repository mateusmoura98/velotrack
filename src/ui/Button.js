import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, radii, shadows } from '../theme/colors';

const VARIANTS = {
  primary: { bg: colors.primary, text: '#FFF', border: null, glow: true },
  secondary: { bg: colors.surfaceLight, text: colors.text, border: colors.border, glow: false },
  outline: { bg: 'transparent', text: colors.primary, border: colors.primaryBorder, glow: false },
  success: { bg: colors.success, text: colors.textInverse, border: null, glow: false },
  danger: { bg: colors.error, text: '#FFF', border: null, glow: false },
  ghost: { bg: 'transparent', text: colors.textSecondary, border: null, glow: false },
};

const SIZES = {
  sm: { height: 38, paddingHorizontal: 16, fontSize: 13, borderRadius: radii.md },
  md: { height: 46, paddingHorizontal: 20, fontSize: 14, borderRadius: radii.lg },
  lg: { height: 54, paddingHorizontal: 24, fontSize: 15, borderRadius: radii.lg },
};

export default function Button({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'lg',
  style,
  disabled = false,
  icon,
  fullWidth = false,
  haptic,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.lg;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
        },
        v.border && { borderWidth: 1, borderColor: v.border },
        v.glow && !disabled && styles.glow,
        (disabled || loading) && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.label, { color: v.text, fontSize: s.fontSize }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  glow: {
    ...shadows.glow,
  },
  iconWrap: {},
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
