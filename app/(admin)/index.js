import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, typography, radii, spacing } from '../../src/theme/colors';
import { dashboardService } from '../../src/services/dashboard';
import { useQuery } from '../../src/hooks/useQuery';
import { Card, CardSection } from '../../src/ui/Card';
import { Skeleton, SkeletonCard } from '../../src/ui/Skeleton';
import BarChart from '../../src/ui/BarChart';
import RankingCard from '../../src/ui/RankingCard';

export default function AdminDashboard() {
  const { signOut } = useAuth();

  const { data: statsData, loading, refetch } = useQuery(
    ['dashboard-stats'],
    () => dashboardService.getStats(),
    { cacheTime: 10000 }
  );

  const { data: meta, loading: metaLoading } = useQuery(
    ['dashboard-meta'],
    () => dashboardService.getMeta(),
    { cacheTime: 30000 }
  );

  const { data: ranking, loading: rankingLoading } = useQuery(
    ['dashboard-ranking'],
    () => dashboardService.getRanking(5),
    { cacheTime: 15000 }
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const stats = statsData?.stats;
  const chartData = statsData?.chartData;
  const realizadoMes = statsData?.monthCompleted || 0;
  const metaMensal = meta || 100;
  const pct = metaMensal > 0 ? Math.min(100, Math.round((realizadoMes / metaMensal) * 100)) : 0;

  const statCards = stats ? [
    { icon: 'documents-outline', value: stats.total, label: 'TOTAL', color: colors.primary },
    { icon: 'time-outline', value: stats.pendentes, label: 'PENDENTES', color: colors.warning },
    { icon: 'play-circle-outline', value: stats.emAndamento, label: 'EM ANDAMENTO', color: colors.primary },
    { icon: 'checkmark-circle-outline', value: stats.finalizados, label: 'FINALIZADOS', color: colors.success },
  ] : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.sub}>Visão geral dos serviços</Text>
        </View>
        <Pressable
          onPress={async () => { await signOut(); }}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="log-out-outline" size={14} color={colors.error} />
          <Text style={styles.logoutLabel}>Sair</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loading ? (
          <>
            <View style={styles.grid}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={styles.statCard}>
                  <Skeleton width={28} height={28} borderRadius={radii.sm} />
                  <Skeleton width={36} height={24} style={{ marginTop: 6 }} />
                  <Skeleton width={52} height={10} />
                </View>
              ))}
            </View>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={2} />
          </>
        ) : (
          <>
            <View style={styles.grid}>
              {statCards.map((s, i) => (
                <View key={i} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.card }]}>
                    <Ionicons name={s.icon} size={16} color={s.color} />
                  </View>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Card>
              <CardSection label="Meta Mensal">
                <View style={styles.metaHead}>
                  <Text style={styles.metaPct}>{pct}%</Text>
                  <Text style={styles.metaCount}>{realizadoMes} / {metaMensal}</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
              </CardSection>
            </Card>

            <BarChart data={chartData || []} title="Finalizados (6 meses)" height={160} />

            <Card>
              <CardSection label="Ranking de Técnicos">
                {rankingLoading ? (
                  [1, 2, 3].map(i => <Skeleton key={i} width="100%" height={46} style={{ marginBottom: 8, borderRadius: radii.md }} />)
                ) : ranking && ranking.length > 0 ? (
                  ranking.map((item, index) => (
                    <RankingCard key={index} position={index + 1} nome={item.nome} total={item.total} />
                  ))
                ) : (
                  <Text style={styles.emptyText}>Nenhum serviço finalizado ainda.</Text>
                )}
              </CardSection>
            </Card>

            <View style={styles.bottom} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pressed: { opacity: 0.7 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { ...typography.h2, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.md,
    backgroundColor: colors.errorSoft, borderWidth: 1, borderColor: colors.error,
  },
  logoutLabel: { fontSize: 11, fontWeight: '700', color: colors.error },
  scroll: { padding: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.lg },
  statCard: {
    width: '48%', flexGrow: 1,
    backgroundColor: colors.card, borderRadius: radii.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    gap: spacing.sm,
  },
  statIcon: {
    width: 32, height: 32, borderRadius: radii.md,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.8 },
  metaHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  metaPct: { fontSize: 28, fontWeight: '900', color: colors.primary },
  metaCount: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  progressBg: {
    height: 6, backgroundColor: colors.surfaceElevated,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  emptyText: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic' },
  bottom: { height: 20 },
});
