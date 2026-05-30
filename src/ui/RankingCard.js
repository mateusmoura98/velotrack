import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radii, spacing } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';

const MEDAL_COLORS = ['#F59E0B', '#94A3B8', '#CD7F32'];

export default function RankingCard({ position, nome, total, isCurrentUser = false }) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUser]}>
      <View style={[styles.positionBadge, position <= 3 && { backgroundColor: MEDAL_COLORS[position - 1] + '20' }]}>
        <Text style={[styles.positionText, position <= 3 && { color: MEDAL_COLORS[position - 1] }]}>
          {position}
        </Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{nome}</Text>
      <View style={styles.score}>
        <Text style={styles.scoreValue}>{total}</Text>
        <Text style={styles.scoreLabel}>serviços</Text>
      </View>
      {position <= 3 && (
        <Ionicons
          name="trophy-outline"
          size={14}
          color={MEDAL_COLORS[position - 1]}
          style={{ marginLeft: 6 }}
        />
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentUser: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  positionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  positionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  score: {
    alignItems: 'flex-end',
    marginRight: 2,
  },
  scoreValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: -1,
  },
});

