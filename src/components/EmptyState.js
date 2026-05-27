import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function EmptyState({ icon = 'file-tray-outline', title, message, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 10 },
  iconWrap: { width: 80, height: 80, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 4, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 18, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' },
  message: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.primary },
  actionText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
