import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { historyService } from '../services/history';
import { Skeleton } from '../ui/Skeleton';

const ACTION_CONFIG = {
  created:               { color: colors.primary,        label: 'OS criada' },
  technician_assigned:   { color: colors.primary,        label: 'Técnico atribuído' },
  technician_changed:    { color: colors.warning,        label: 'Técnico alterado' },
  status_changed:        { color: colors.primary,        label: 'Status alterado' },
  started:               { color: colors.success,        label: 'Serviço iniciado' },
  finished:              { color: colors.success,        label: 'Serviço finalizado' },
  checklist_updated:     { color: colors.textSecondary,  label: 'Checklist atualizado' },
  observation_added:     { color: colors.textMuted,      label: 'Observação registrada' },
  photo_added:           { color: colors.textMuted,      label: 'Foto adicionada' },
  priority_changed:      { color: colors.warning,        label: 'Prioridade alterada' },
  edited:                { color: colors.textSecondary,  label: 'OS atualizada' },
};

function formatTime(d) {
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
}

export default function ServiceTimeline({ serviceId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;
    let mounted = true;
    setLoading(true);
    historyService.getByService(serviceId)
      .then(data => {
        if (mounted) {
          setEvents(data || []);
          setLoading(false);
        }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [serviceId]);

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.sectionTitle}>Atividade</Text>
        <View style={styles.card}>
          <Skeleton width="100%" height={10} style={{ marginBottom: 10 }} />
          <Skeleton width="75%" height={10} style={{ marginBottom: 10 }} />
          <Skeleton width="50%" height={10} />
        </View>
      </View>
    );
  }

  if (events.length < 2) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Atividade</Text>
      <View style={styles.card}>
        {events.map((event, i) => {
          const cfg = ACTION_CONFIG[event.action] || { color: colors.textMuted, label: event.action };
          const userName = event.users?.nome || '';
          return (
            <View key={event.id || i} style={styles.row}>
              <View style={styles.dotCol}>
                <View style={[styles.dot, { backgroundColor: cfg.color }]} />
                {i < events.length - 1 && <View style={styles.line} />}
              </View>
              <View style={styles.contentCol}>
                <Text style={styles.label}>{cfg.label}</Text>
                {userName ? <Text style={styles.user}>{userName}</Text> : null}
                <Text style={styles.time}>{formatTime(event.created_at)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dotCol: {
    width: 20,
    alignItems: 'center',
    paddingTop: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    top: 10,
    left: 9,
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  contentCol: {
    marginLeft: 8,
    flex: 1,
    paddingBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  user: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  time: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
});
