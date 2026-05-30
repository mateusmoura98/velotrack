import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '../theme/colors';

export function StatusBadge({ status, size = 'sm' }) {
  const STATUS_CONFIG = {
    pendente: {
      bg: colors.warningSoft,
      color: colors.warning,
      label: 'Pendente',
      icon: 'time-outline',
    },
    em_andamento: {
      bg: colors.primarySoft,
      color: colors.primary,
      label: 'Em Andamento',
      icon: 'play-circle-outline',
    },
    concluido: {
      bg: colors.successSoft,
      color: colors.success,
      label: 'Concluído',
      icon: 'checkmark-circle-outline',
    },
  };

  const c = STATUS_CONFIG[status] || { bg: colors.card, color: colors.textMuted, label: status, icon: 'help-circle-outline' };
  const isLg = size === 'lg';

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, isLg && styles.badgeLg]}>
      <Ionicons name={c.icon} size={isLg ? 14 : 11} color={c.color} />
      <Text style={[styles.label, { color: c.color }, isLg && styles.labelLg]}>{c.label}</Text>
    </View>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const PRIORITY_CONFIG = {
    alta: { color: colors.error, bg: colors.errorSoft, label: 'Alta' },
    media: { color: colors.warning, bg: colors.warningSoft, label: 'Média' },
    baixa: { color: colors.success, bg: colors.successSoft, label: 'Baixa' },
  };

  const p = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.baixa;
  const isLg = size === 'lg';

  return (
    <View style={[styles.prioBadge, { backgroundColor: p.bg, borderColor: p.color }, isLg && styles.prioBadgeLg]}>
      <View style={[styles.prioDot, { backgroundColor: p.color }, isLg && styles.prioDotLg]} />
      <Text style={[styles.label, { color: p.color }, isLg && styles.labelLg]}>{p.label}</Text>
    </View>
  );
}

export function CountBadge({ count, color }) {
  const finalColor = color || colors.primary;
  if (count <= 0) return null;
  return (
    <View style={[styles.countBadge, { backgroundColor: finalColor + '18' }]}>
      <Text style={[styles.countText, { color: finalColor }]}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeLg: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    gap: 6,
  },
  prioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  prioBadgeLg: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 9,
    gap: 6,
  },
  prioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  prioDotLg: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelLg: {
    fontSize: 12,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
