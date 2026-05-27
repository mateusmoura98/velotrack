import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { colors } from '../theme/colors';

export default function ServiceCard({
  service,
  onPress,
  onEdit,
  onComplete,
  onChangeTech,
  compact = false,
}) {
  if (!service) return null;

  const isAlta = service.priority === 'alta';
  const isConcluido = service.status === 'concluido';
  const showCompleteBtn = !compact && !isConcluido;

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
      ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={[styles.card, isAlta && styles.cardHighPriority]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.clientName} numberOfLines={1}>{service.cliente}</Text>
        <PriorityBadge priority={service.priority} size="sm" />
      </View>

      <View style={styles.vehicleRow}>
        <Ionicons name="car-outline" size={13} color={colors.textMuted} />
        <Text style={styles.vehicleText} numberOfLines={1}>
          {service.veiculo}{service.placa ? ` • ${service.placa}` : ''}
        </Text>
      </View>

      {service.endereco ? (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <Text style={styles.infoText} numberOfLines={1}>{service.endereco}</Text>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        {service.users?.nome && (
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{service.users.nome}</Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatDate(service.created_at)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <StatusBadge status={service.status} size="sm" />
        <View style={styles.actions}>
          {showCompleteBtn && onComplete && (
            <TouchableOpacity style={styles.actionBtn} onPress={onComplete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onChangeTech && (
            <TouchableOpacity style={styles.actionBtn} onPress={onChangeTech} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="swap-horizontal-outline" size={18} color={colors.warning} />
            </TouchableOpacity>
          )}
          {onPress && (
            <View style={styles.actionBtn}>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  cardHighPriority: {
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },

  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  vehicleText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
