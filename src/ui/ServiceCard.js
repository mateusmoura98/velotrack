import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/colors';
import { StatusBadge, PriorityBadge } from './Badge';

function ServiceCard({ service, onPress, compact = false }) {
  if (!service) return null;

  const isAlta = service.priority === 'alta';
  const isConcluido = service.status === 'concluido';

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
      ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={[styles.card, isAlta && !isConcluido && styles.cardAlta]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <View style={[styles.avatar, isConcluido && styles.avatarConcluido]}>
            <Text style={styles.avatarText}>
              {service.cliente?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '--'}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.clientName} numberOfLines={1}>{service.cliente}</Text>
            <Text style={styles.vehicleInfo} numberOfLines={1}>
              {service.veiculo}{service.placa ? ` • ${service.placa}` : ''}
            </Text>
          </View>
        </View>
        <PriorityBadge priority={service.priority} size="sm" />
      </View>

      {service.endereco ? (
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.detailText} numberOfLines={1}>{service.endereco}</Text>
        </View>
      ) : null}

      {!compact && (service.technician_name || service.users?.nome) && (
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={12} color={colors.textMuted} />
          <Text style={styles.detailText} numberOfLines={1}>{service.technician_name || service.users?.nome}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <StatusBadge status={service.status} size="sm" />
        <View style={styles.footerRight}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={styles.timeText}>{formatDate(service.created_at)}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ServiceCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardAlta: {
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: spacing.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarConcluido: {
    backgroundColor: colors.successSoft,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  vehicleInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  detailText: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
