import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';

export default function Button({
  title, onPress, loading = false, variant = 'primary',
  style, disabled = false, icon, size = 'lg',
}) {
  const config = {
    primary:     { bg: colors.primary,     text: '#FFF',    border: null },
    outline:     { bg: 'transparent',       text: colors.primary, border: colors.primary },
    success:     { bg: colors.success,      text: '#FFF',    border: null },
    danger:      { bg: colors.error,        text: '#FFF',    border: null },
    ghost:       { bg: 'transparent',       text: colors.textSecondary, border: null },
  };

  const c = config[variant] || config.primary;
  const isSmall = size === 'sm';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: c.bg },
        c.border && { borderWidth: 1.5, borderColor: c.border },
        isSmall && styles.small,
        (disabled || loading) && styles.disabled,
        variant === 'primary' && !disabled && styles.primaryGlow,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={c.text} size="small" />
      ) : (
        <View style={[styles.row, isSmall && styles.rowSmall]}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.label, { color: c.text }, isSmall && styles.labelSmall]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  small: { height: 40, borderRadius: 10 },
  disabled: { opacity: 0.5 },
  primaryGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowSmall: { gap: 4 },
  iconWrap: { marginRight: 8 },
  label: { fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  labelSmall: { fontSize: 13, fontWeight: '700' },
});
