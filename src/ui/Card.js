import { View, Text, StyleSheet } from 'react-native';
import { radii, spacing } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';

export function Card({ children, style, padded = true }) {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  return (
    <View style={[
      styles.card, 
      padded && styles.padded, 
      style
    ]}>
      {children}
    </View>
  );
}

export function CardSection({ label, children, style }) {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  return (
    <View style={[styles.section, style]}>
      {label && <Text style={styles.sectionLabel}>{label}</Text>}
      {children}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    alignSelf: 'stretch',
    shadowColor: colors.shadowColor,
    shadowOffset: colors.shadowOffsetDesktop || { width: 0, height: 4 },
    shadowOpacity: colors.shadowOpacityDesktop || 0.05,
    shadowRadius: colors.shadowRadiusDesktop || 12,
  },
  padded: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
});

