import { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Linking, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, typography, radii, spacing } from '../../src/theme/colors';
import { supabase } from '../../src/lib/supabase';
import { servicosService } from '../../src/services/servicos';
import { StatusBadge, PriorityBadge } from '../../src/ui/Badge';
import { EmptyState } from '../../src/ui/EmptyState';
import { Skeleton, SkeletonCard } from '../../src/ui/Skeleton';
import Timer from '../../src/ui/Timer';

function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getStartOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getEndOfDay() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default function OsDoDia() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(null);

  const fetchServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('v_service_metrics')
        .select('*')
        .eq('technician_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const hoje = getStartOfDay();
      const seen = new Set();
      const list = (data || []).filter(s => {
        if (seen.has(s.service_id)) return false;
        seen.add(s.service_id);
        const isToday = s.created_at >= hoje;
        const isActive = s.status === 'em_andamento' || s.status === 'pendente';
        return isToday || isActive;
      });

      setServices(list);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchServices(); }, [user?.id]);

  const counts = useMemo(() => ({
    total: services.length,
    pendente: services.filter(s => s.status === 'pendente').length,
    em_andamento: services.filter(s => s.status === 'em_andamento').length,
    concluido: services.filter(s => s.status === 'concluido').length,
  }), [services]);

  const handleStart = async (serviceId) => {
    setUpdating(serviceId);
    try {
      await servicosService.startService(serviceId, user?.id);
      await fetchServices();
    } catch (e) {
      if (e?.message) Alert.alert('Erro', 'Não foi possível iniciar: ' + e.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleFinish = async (serviceId) => {
    setUpdating(serviceId);
    try {
      await servicosService.finishService(serviceId, { checklist: [], observations: '', fotos: [] }, user?.id);
      await fetchServices();
    } catch (e) {
      if (e?.message) Alert.alert('Erro', 'Não foi possível finalizar: ' + e.message);
    } finally {
      setUpdating(null);
    }
  };

  const openMaps = (endereco) => {
    if (!endereco) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    Linking.openURL(url);
  };

  const openWhatsApp = (telefone) => {
    if (!telefone) return;
    const num = telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${num}`;
    Linking.openURL(url);
  };

  const renderCard = useCallback(({ item }) => {
    const isPendente = item.status === 'pendente';
    const isAndamento = item.status === 'em_andamento';
    const isConcluido = item.status === 'concluido';
    const isUpdating = updating === item.service_id;

    return (
      <TouchableOpacity
        style={[styles.card, item.priority === 'alta' && !isConcluido && styles.cardAlta]}
        onPress={() => router.push(`/(tecnico)/servico/${item.service_id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <View style={styles.cardAvatar}>
              <Text style={styles.cardAvatarText}>
                {item.cliente?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '--'}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.clientName} numberOfLines={1}>{item.cliente}</Text>
              <Text style={styles.vehicleInfo} numberOfLines={1}>
                {item.veiculo}{item.placa ? ` • ${item.placa}` : ''}
              </Text>
            </View>
          </View>
          <PriorityBadge priority={item.priority} size="sm" />
        </View>

        {item.endereco ? (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={12} color={colors.textMuted} />
            <Text style={styles.detailText} numberOfLines={1}>{item.endereco}</Text>
          </View>
        ) : null}

        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={12} color={colors.textMuted} />
          <Text style={styles.detailText}>{item.tipo || 'Instalação'}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.detailText}>{formatTime(item.created_at)}</Text>
        </View>

        <View style={styles.cardFooter}>
          <StatusBadge status={item.status} size="sm" />

          <View style={styles.actions}>
            {isPendente && (
              <>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleStart(item.service_id)}
                  disabled={isUpdating}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {isUpdating ? (
                    <ActivityIndicator size={14} color={colors.success} />
                  ) : (
                    <Ionicons name="play-circle" size={18} color={colors.success} />
                  )}
                </TouchableOpacity>

                {item.telefone ? (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openWhatsApp(item.telefone)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                  </TouchableOpacity>
                ) : null}

                {item.endereco ? (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openMaps(item.endereco)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="navigate" size={18} color={colors.primary} />
                  </TouchableOpacity>
                ) : null}
              </>
            )}

            {isAndamento && (
              <>
                <Timer startTime={item.started_at} />

                <TouchableOpacity
                  style={styles.actionBtn}
        onPress={() => router.push(`/(tecnico)/servico/${item.service_id}`)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="clipboard-outline" size={18} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.finishBtn}
                  onPress={() => handleFinish(item.service_id)}
                  disabled={isUpdating}
                  activeOpacity={0.8}
                >
                  {isUpdating ? (
                    <ActivityIndicator size={14} color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                      <Text style={styles.finishText}>Finalizar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {isConcluido && (
              <View style={styles.concluidoTag}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.concluidoText}>Concluído</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [router, updating, user?.id, fetchServices]);

  const counterItems = [
    { key: 'pendente', value: counts.pendente, label: 'Pendentes', color: colors.warning, icon: 'time-outline' },
    { key: 'em_andamento', value: counts.em_andamento, label: 'Em Andamento', color: colors.primary, icon: 'play-circle-outline' },
    { key: 'concluido', value: counts.concluido, label: 'Concluídos', color: colors.success, icon: 'checkmark-circle-outline' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>OS do Dia</Text>
        <Text style={styles.subtitle}>{counts.total} OS hoje</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <View style={styles.counterRow}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.counterCard}>
                <Skeleton width={16} height={16} borderRadius={8} />
                <Skeleton width={28} height={20} />
                <Skeleton width={45} height={10} />
              </View>
            ))}
          </View>
          {[1, 2].map(i => <SkeletonCard key={i} lines={4} />)}
        </View>
      ) : (
        <>
          <View style={styles.counterRow}>
            {counterItems.map((c, i) => (
              <View key={i} style={[styles.counterCard, { borderLeftColor: c.color }]}>
                <Ionicons name={c.icon} size={16} color={c.color} />
                <Text style={[styles.counterNum, { color: c.color }]}>{c.value}</Text>
                <Text style={styles.counterLabel}>{c.label}</Text>
              </View>
            ))}
          </View>

          <FlatList
            data={services}
            keyExtractor={(item) => item.service_id}
            renderItem={renderCard}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchServices(); }} tintColor={colors.primary} colors={[colors.primary]} />
            }
            ListEmptyComponent={
              <EmptyState
                icon="calendar-outline"
                title="Nenhuma OS hoje"
                message="Você não tem ordens de serviço para hoje."
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, padding: spacing.xl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  counterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.md },
  counterCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.sm,
    borderLeftWidth: 3, borderWidth: 1, borderColor: colors.border, gap: 2,
    alignItems: 'center',
  },
  counterNum: { fontSize: 18, fontWeight: '900' },
  counterLabel: { fontSize: 9, color: colors.textSecondary, marginTop: 1, fontWeight: '600' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 20 },
  card: {
    backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  cardAlta: { borderLeftWidth: 3, borderLeftColor: colors.error },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10, marginRight: spacing.sm },
  cardAvatar: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center',
  },
  cardAvatarText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  cardInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '700', color: colors.text },
  vehicleInfo: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  detailText: { fontSize: 11, color: colors.textMuted, flex: 1 },
  dot: { fontSize: 11, color: colors.textMuted, marginHorizontal: 2 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  finishBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.success, borderRadius: 22, paddingHorizontal: 16, height: 44,
  },
  finishText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  concluidoTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  concluidoText: { fontSize: 12, fontWeight: '600', color: colors.success },
});
