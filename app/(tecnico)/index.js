import { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, typography, radii, spacing } from '../../src/theme/colors';
import { supabase } from '../../src/lib/supabase';
import ServiceCard from '../../src/ui/ServiceCard';
import { EmptyState } from '../../src/ui/EmptyState';
import { Skeleton, SkeletonCard } from '../../src/ui/Skeleton';

export default function TecnicoHome() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*, users(nome)')
        .eq('technician_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setServices(data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchServices(); }, [user?.id]);

  const today = useMemo(() =>
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
  []);

  const counts = useMemo(() => {
    const hoje = services.filter(s => {
      const d = new Date(s.created_at);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      total: hoje.length,
      pendente: hoje.filter(s => s.status === 'pendente').length,
      andamento: hoje.filter(s => s.status === 'em_andamento').length,
      concluido: hoje.filter(s => s.status === 'concluido').length,
    };
  }, [services]);

  const activeUrgent = useMemo(() =>
    services.filter(s => s.status !== 'concluido').slice(0, 3),
  [services]);

  const renderCard = useCallback(({ item }) => (
    <ServiceCard
      service={item}
      onPress={() => router.push(`/(tecnico)/servico/${item.id}`)}
    />
  ), [router]);

  const renderHeader = () => (
    <>
      <TouchableOpacity
        style={styles.heroCard}
        onPress={() => router.push('/(tecnico)/os-do-dia')}
        activeOpacity={0.7}
      >
        <View style={styles.heroLeft}>
          <Text style={styles.heroTitle}>OS do Dia</Text>
          <Text style={styles.heroDesc}>
            {counts.total} OS • {counts.pendente} pendentes • {counts.andamento} em andamento
          </Text>
        </View>
        <View style={styles.heroRight}>
          <Text style={styles.heroCount}>{counts.total}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </TouchableOpacity>

      <View style={styles.counterRow}>
        <View style={[styles.counterCard, { borderLeftColor: colors.warning }]}>
          <Ionicons name="time-outline" size={14} color={colors.warning} />
          <Text style={[styles.counterNum, { color: colors.warning }]}>{counts.pendente}</Text>
          <Text style={styles.counterLabel}>Pendentes</Text>
        </View>
        <View style={[styles.counterCard, { borderLeftColor: colors.primary }]}>
          <Ionicons name="play-circle-outline" size={14} color={colors.primary} />
          <Text style={[styles.counterNum, { color: colors.primary }]}>{counts.andamento}</Text>
          <Text style={styles.counterLabel}>Em Andamento</Text>
        </View>
        <View style={[styles.counterCard, { borderLeftColor: colors.success }]}>
          <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
          <Text style={[styles.counterNum, { color: colors.success }]}>{counts.concluido}</Text>
          <Text style={styles.counterLabel}>Concluídos</Text>
        </View>
      </View>

      {activeUrgent.length > 0 && (
        <Text style={styles.sectionTitle}>OS Ativas</Text>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {profile?.nome?.split(' ')[0] || 'Técnico'}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Skeleton width={200} height={20} />
          <View style={{ height: 12 }} />
          {[1, 2].map(i => <SkeletonCard key={i} lines={3} />)}
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={activeUrgent}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              icon="home-outline"
              title="Bem-vindo!"
              message="Você não tem serviços ativos no momento. Acesse a OS do Dia para ver suas ordens."
            />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchServices(); }} tintColor={colors.primary} colors={[colors.primary]} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  greeting: { ...typography.h2, color: colors.text },
  date: { ...typography.caption, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  heroCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primarySoft, marginHorizontal: spacing.xl, marginTop: spacing.lg,
    borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.primary + '30',
  },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: 16, fontWeight: '700', color: colors.primary },
  heroDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 3 },
  heroRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroCount: {
    fontSize: 28, fontWeight: '900', color: colors.primary,
  },
  counterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.xl, marginTop: spacing.md },
  counterCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.sm,
    borderLeftWidth: 3, borderWidth: 1, borderColor: colors.border, gap: 2,
    alignItems: 'center',
  },
  counterNum: { fontSize: 16, fontWeight: '900' },
  counterLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: '600' },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: colors.textSecondary,
    marginBottom: spacing.sm, marginTop: spacing.lg,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
});
