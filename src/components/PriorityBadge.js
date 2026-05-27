import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const PRIO_MAP = {
  alta: { color: colors.error, bg: colors.error + '18', label: 'Alta' },
  media: { color: colors.warning, bg: colors.warning + '18', label: 'Média' },
  baixa: { color: colors.success, bg: colors.success + '18', label: 'Baixa' },
};

export default function PriorityBadge({ priority, size = 'sm' }) {
  const p = PRIO_MAP[priority] || PRIO_MAP.baixa;
  const isLg = size === 'lg';

  return (
    <View style={[styles.badge, { backgroundColor: p.bg, borderColor: p.color }, isLg && styles.lg]}>
      <View style={[styles.dot, { backgroundColor: p.color }, isLg && styles.dotLg]} />
      <Text style={[styles.label, { color: p.color }, isLg && styles.labelLg]}>{p.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, alignSelf: 'flex-start',
  },
  lg: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotLg: { width: 9, height: 9, borderRadius: 5 },
  label: { fontSize: 11, fontWeight: '700' },
  labelLg: { fontSize: 13 },
});
