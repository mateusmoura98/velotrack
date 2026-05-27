import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function RankingCard({ position, nome, total, isCurrentUser = false }) {
  const renderPosition = () => {
    switch (position) {
      case 1: return <Text style={styles.medal}>🥇</Text>;
      case 2: return <Text style={styles.medal}>🥈</Text>;
      case 3: return <Text style={styles.medal}>🥉</Text>;
      default:
        return (
          <View style={styles.positionCircle}>
            <Text style={styles.positionText}>{position}</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUser]}>
      <View style={styles.positionContainer}>
        {renderPosition()}
      </View>
      <Text style={styles.name} numberOfLines={1}>{nome}</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{total}</Text>
        <Text style={styles.scoreLabel}>serviços</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentUser: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  positionContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  medal: {
    fontSize: 24,
  },
  positionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  name: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: -2,
  },
});
