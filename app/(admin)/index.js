import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width > 768;

  const { data: statsData, loading, refetch } = useQuery(
    ['dashboard-stats'],
    () => dashboardService.getStats(),
    { cacheTime: 10000 }
  );

  const { data: meta } = useQuery(
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
    { icon: 'calendar-outline', value: stats.total, label: 'TOTAL DE ORDEM', color: '#635BFF' },
    { icon: 'alert-circle-outline', value: stats.pendentes, label: 'PENDENTES', color: colors.warning },
    { icon: 'play-outline', value: stats.emAndamento, label: 'EM EXECUÇÃO', color: colors.primary },
    { icon: 'checkmark-done-circle-outline', value: stats.finalizados, label: 'CONCLUÍDAS', color: colors.success },
  ] : [];

  const renderMetaAndChart = () => (
    <View style={isDesktop ? styles.leftCol : null}>
      <Card>
        <CardSection label="Faturamento & Metas">
          <View style={styles.metaHead}>
            <View>
              <Text style={styles.metaPct}>{pct}%</Text>
              <Text style={styles.metaPeriod}>PROGRESSO MENSAL</Text>
            </View>
            <View style={styles.metaCountContainer}>
              <Text style={styles.metaCount}>{realizadoMes} <Text style={{ color: colors.textMuted }}>/ {metaMensal} OS</Text></Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </CardSection>
      </Card>

      <BarChart 
        data={chartData || []} 
        title="Produtividade Mensal (Serviços Finalizados)" 
        height={180} 
      />
    </View>
  );

  const renderRanking = () => (
    <View style={isDesktop ? styles.rightCol : null}>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.title}>Overview</Text>
          <Text style={styles.sub}>Visão geral operacional e técnica</Text>
        </View>
        
        {!isDesktop && (
          <Pressable
            onPress={async () => { await signOut(); }}
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
          >
            <Ionicons name="log-out-outline" size={14} color={colors.error} />
            <Text style={styles.logoutLabel}>Sair</Text>
          </Pressable>
        )}
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
                <View key={i} style={[styles.statCard, isDesktop && { width: '23%' }]}>
                  <Skeleton width={28} height={28} borderRadius={radii.sm} />
                  <Skeleton width={40} height={28} style={{ marginTop: 8 }} />
                  <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
                </View>
              ))}
            </View>
            <SkeletonCard lines={4} />
            <SkeletonCard lines={3} />
          </>
        ) : (
          <>
            {/* Stat Cards Row */}
            <View style={styles.grid}>
              {statCards.map((s, i) => (
                <View key={i} style={[styles.statCard, isDesktop && { width: '23%' }]}>
                  <View style={styles.statTop}>
                    <Text style={styles.statLabel}>{s.label}</Text>
                    <View style={styles.statIconDot}>
                      <Ionicons name={s.icon} size={15} color={s.color} />
                    </View>
                  </View>
                  <Text style={styles.statValue}>{s.value}</Text>
                </View>
              ))}
            </View>

            {/* Main content viewport block - columns on desktop, rows on mobile */}
            {isDesktop ? (
              <View style={styles.desktopSplit}>
                {renderMetaAndChart()}
                {renderRanking()}
              </View>
            ) : (
              <>
                {renderMetaAndChart()}
                {renderRanking()}
              </>
            )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  headerTitleBox: {},
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.md,
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutLabel: { fontSize: 11, fontWeight: '700', color: colors.error },
  scroll: {
    padding: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statIconDot: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '850',
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: spacing.md,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  metaHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  metaPct: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1,
  },
  metaPeriod: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  metaCountContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaCount: { fontSize: 13, color: colors.text, fontWeight: '700' },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  emptyText: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic' },
  desktopSplit: {
    flexDirection: 'row',
    gap: spacing.xl,
    width: '100%',
  },
  leftCol: {
    flex: 3,
    gap: spacing.xl,
  },
  rightCol: {
    flex: 2,
  },
  bottom: { height: 40 },
});
