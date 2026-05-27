import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme/colors';

export function Card({ children, style, variant = 'default', padded = true }) {
  const variantStyles = {
    default: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    elevated: {
      backgroundColor: colors.surface,
      borderColor: colors.borderLight,
      ...shadows.md,
    },
    primary: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primaryBorder,
    },
    success: {
      backgroundColor: colors.successSoft,
      borderColor: colors.successBorder,
    },
    warning: {
      backgroundColor: colors.warningSoft,
      borderColor: colors.warningBorder,
    },
    error: {
      backgroundColor: colors.errorSoft,
      borderColor: colors.errorBorder,
    },
  };

  const v = variantStyles[variant] || variantStyles.default;

  return (
    <View style={[styles.card, v, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

export function CardSection({ label, children, style }) {
  return (
    <View style={[styles.section, style]}>
      {label && <Text style={styles.sectionLabel}>{label}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  padded: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
});
