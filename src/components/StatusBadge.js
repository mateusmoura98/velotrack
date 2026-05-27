import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const CONFIG = {
  pendente: {
    bg: colors.warningSoft, color: colors.warning,
    label: 'Pendente', icon: 'time-outline',
  },
  em_andamento: {
    bg: colors.primarySoft, color: colors.primary,
    label: 'Em Andamento', icon: 'play-circle-outline',
  },
  concluido: {
    bg: colors.successSoft, color: colors.success,
    label: 'Concluído', icon: 'checkmark-circle-outline',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const c = CONFIG[status] || {
    bg: colors.surfaceLight, color: colors.textSecondary,
    label: status?.toUpperCase() || 'Desconhecido', icon: 'help-circle-outline',
  };
  const large = size === 'lg';

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, large && styles.large]}>
      <Ionicons name={c.icon} size={large ? 16 : 12} color={c.color} />
      <Text style={[styles.text, { color: c.color }, large && styles.textLarge]}>
        {c.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  large: { paddingHorizontal: 14, paddingVertical: 7, gap: 6 },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  textLarge: { fontSize: 13 },
});
