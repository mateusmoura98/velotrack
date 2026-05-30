import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';

export function Card({ children, style, padded = true }) {
  return (
    <View style={[
      styles.card, 
      { backgroundColor: colors.card, borderColor: colors.border },
      padded && styles.padded, 
      style
    ]}>
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
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    alignSelf: 'stretch',
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
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
});
