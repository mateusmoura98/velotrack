import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing } from '../../src/theme/colors';
import { suporteService } from '../../src/services/suporte';
import { useQuery } from '../../src/hooks/useQuery';
import Header from '../../src/ui/Header';
import { Card } from '../../src/ui/Card';
import { Skeleton, SkeletonCard } from '../../src/ui/Skeleton';

export default function SuporteAdmin() {
  const { data: mensagens, loading, refetch } = useQuery(
    ['suporte-admin'],
    () => suporteService.listAll(),
    { cacheTime: 10000 }
  );

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
      ' • ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = useCallback(({ item }) => (
    <Card style={{ marginBottom: spacing.sm }}>
      <View style={styles.cardHead}>
        <View style={styles.senderRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color={colors.primary} />
          </View>
          <Text style={styles.senderName}>{item.users?.nome || 'Desconhecido'}</Text>
        </View>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.message}>{item.mensagem}</Text>
      {item.fotos?.[0] && (
        <Image source={{ uri: item.fotos[0] }} style={styles.image} resizeMode="cover" />
      )}
    </Card>
  ), []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Suporte" />
        <View style={styles.center}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} lines={3} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Suporte</Text>
          <Text style={styles.sub}>{mensagens?.length || 0} mensagens</Text>
        </View>
        <View style={styles.countBadge}>
          <Ionicons name="chatbubbles" size={16} color={colors.primary} />
          <Text style={styles.countText}>{mensagens?.length || 0}</Text>
        </View>
      </View>
      <FlatList
        data={mensagens || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhuma mensagem</Text>
            <Text style={styles.emptySub}>As mensagens dos técnicos aparecerão aqui.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { ...typography.h2, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  countBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.md,
  },
  countText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 30 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 30, height: 30, borderRadius: radii.sm,
    backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center',
  },
  senderName: { color: colors.text, fontWeight: '700', fontSize: 13 },
  date: { color: colors.textMuted, fontSize: 10 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  message: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  image: { width: '100%', height: 180, borderRadius: radii.md, marginTop: spacing.md },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
