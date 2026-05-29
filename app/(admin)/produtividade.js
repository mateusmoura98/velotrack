import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, typography, radii, spacing } from '../../src/theme/colors';
import { productivityService } from '../../src/services/productivity';
import { Card } from '../../src/ui/Card';
import { Skeleton } from '../../src/ui/Skeleton';
import BarChart from '../../src/ui/BarChart';

const PERIODOS = [
  { key: 7, label: '7d' },
  { key: 14, label: '14d' },
  { key: 30, label: '30d' },
];

function formatDuration(segundos) {
  if (!segundos || segundos <= 0) return '—';
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ''}`;
  return `${m}min`;
}

function timeAgo(date) {
  if (!date) return null;
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return `há ${Math.floor(diff / 86400)}d`;
}

export default function AdminProdutividade() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState(7);
  const [overview, setOverview] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [trend, setTrend] = useState([]);
  const [lastActivity, setLastActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [ov, rk, tr, last] = await Promise.all([
        productivityService.getOverview(periodo),
        productivityService.getTecnicoRanking(periodo),
        productivityService.getDailyTrend(periodo),
        productivityService.getLastActivity(),
      ]);
      setOverview(ov);
      setRanking(rk || []);
      setTrend(tr || []);
      setLastActivity(last);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodo]);

  useEffect(() => { fetchAll(); }, [periodo]);

  const kpiCards = overview ? [
    { icon: 'checkmark-circle', value: overview.concluidas_hoje, label: 'OS Hoje', color: colors.success },
    { icon: 'time', value: formatDuration(overview.tempo_medio_segundos), label: 'Tempo Médio', color: colors.primary },
    { icon: 'play-circle', value: overview.andamento, label: 'Em Andamento', color: colors.warning },
  ] : [];

  const checklistPct = overview && overview.checklists_completos > 0 && overview.concluidas_periodo > 0
    ? Math.round((overview.checklists_completos / overview.concluidas_periodo) * 100)
    : 0;

  const lastActivityText = lastActivity
    ? `${lastActivity.users?.nome || 'Alguém'} • ${timeAgo(lastActivity.created_at)}`
    : 'Nenhuma atividade recente';

  const chartData = trend.map(d => ({
    label: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    value: d.concluidas,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Produtividade</Text>
        <View style={styles.periodRow}>
          {PERIODOS.map(p => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodBtn, periodo === p.key && styles.periodBtnActive]}
              onPress={() => setPeriodo(p.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, periodo === p.key && styles.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchAll(); }} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {loading ? (
          <>
            <View style={styles.kpiRow}>
              {[1, 2, 3].map(i => (
                <View key={i} style={styles.kpiCard}>
                  <Skeleton width={20} height={20} borderRadius={10} />
                  <Skeleton width={40} height={24} />
                  <Skeleton width={50} height={10} />
                </View>
              ))}
            </View>
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Skeleton width={60} height={14} />
                <Skeleton width={80} height={28} />
              </View>
              <Skeleton width="100%" height={6} borderRadius={3} />
            </View>
            {[1, 2].map(i => (
              <View key={i} style={{ height: 120, backgroundColor: colors.card, borderRadius: radii.lg, marginBottom: spacing.md }} />
            ))}
          </>
        ) : (
          <>
            <View style={styles.kpiRow}>
              {kpiCards.map((k, i) => (
                <View key={i} style={[styles.kpiCard, { borderLeftColor: k.color }]}>
                  <Ionicons name={k.icon} size={16} color={k.color} />
                  <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                  <Text style={styles.kpiLabel}>{k.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <View style={styles.metaLeft}>
                  <Ionicons name="clipboard-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.metaLabel}>Checklists Completos</Text>
                </View>
                <Text style={styles.metaValue}>{checklistPct}%</Text>
              </View>
              <View style={styles.metaBar}>
                <View style={[styles.metaFill, { width: `${checklistPct}%` }]} />
              </View>
              <View style={styles.metaSub}>
                <Text style={styles.metaSubText}>
                  {overview?.checklists_completos || 0} de {overview?.concluidas_periodo || 0} OS
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <View style={styles.metaLeft}>
                  <Ionicons name="pulse-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.metaLabel}>Última Atividade</Text>
                </View>
                <Text style={styles.metaValueSmall}>{lastActivityText}</Text>
              </View>
            </View>

            <BarChart
              data={chartData}
              title="Tendência Diária"
              height={140}
            />

            <Card>
              <View style={styles.rankingHead}>
                <Ionicons name="trophy-outline" size={16} color={colors.warning} />
                <Text style={styles.rankingTitle}>Ranking dos Técnicos</Text>
              </View>
              {ranking.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum dado no período.</Text>
              ) : (
                ranking.map((tec, index) => (
                  <View key={tec.id} style={[styles.rankingRow, index === 0 && styles.rankingRowTop]}>
                    <View style={[styles.rankBadge, index < 3 && { backgroundColor: colors.warning + '20' }]}>
                      <Text style={[styles.rankPos, index < 3 && { color: colors.warning }]}>{index + 1}</Text>
                    </View>
                    <View style={styles.rankInfo}>
                      <Text style={styles.rankName}>{tec.nome}</Text>
                      <Text style={styles.rankMeta}>
                        {formatDuration(tec.tempo_medio_segundos)} • {timeAgo(tec.ultima_atividade) || '—'}
                      </Text>
                    </View>
                    <View style={styles.rankScore}>
                      <Text style={styles.rankCount}>{tec.concluidas}</Text>
                      <Text style={styles.rankLabel}>OS</Text>
                    </View>
                  </View>
                ))
              )}
            </Card>

            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { ...typography.h2, color: colors.text },
  periodRow: { flexDirection: 'row', gap: 4 },
  periodBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  periodBtnActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  periodText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  periodTextActive: { color: colors.primary },
  scroll: { padding: spacing.xl },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  kpiCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.md,
    borderLeftWidth: 3, borderWidth: 1, borderColor: colors.border, gap: 3, alignItems: 'center',
  },
  kpiValue: { fontSize: 20, fontWeight: '900' },
  kpiLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  metaCard: {
    backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  metaValue: { fontSize: 22, fontWeight: '900', color: colors.primary },
  metaValueSmall: { fontSize: 12, fontWeight: '600', color: colors.text },
  metaBar: {
    height: 6, backgroundColor: colors.surfaceElevated, borderRadius: 3,
    overflow: 'hidden', marginTop: spacing.sm,
  },
  metaFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  metaSub: { marginTop: 4 },
  metaSubText: { fontSize: 10, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  rankingHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  rankingTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.3 },
  rankingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.md,
    paddingVertical: 10, paddingHorizontal: spacing.md, marginBottom: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  rankingRowTop: { borderColor: colors.warning + '40', backgroundColor: colors.warning + '05' },
  rankBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  rankPos: { fontSize: 12, fontWeight: '800', color: colors.textMuted },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 14, fontWeight: '600', color: colors.text },
  rankMeta: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  rankScore: { alignItems: 'flex-end', marginLeft: 8 },
  rankCount: { fontSize: 16, fontWeight: '800', color: colors.primary },
  rankLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '600', marginTop: -1 },
  emptyText: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic' },
});
