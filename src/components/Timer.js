import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Timer({ startTime }) {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!startTime) return;

    const start = new Date(startTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diffInSeconds = Math.floor((now - start) / 1000);

      if (diffInSeconds < 0) return;

      const h = Math.floor(diffInSeconds / 3600);
      const m = Math.floor((diffInSeconds % 3600) / 60);
      const s = Math.floor(diffInSeconds % 60);

      const formatted = 
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      
      setElapsed(formatted);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>TEMPO EM ANDAMENTO</Text>
      <Text style={styles.time}>{elapsed}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '600',
  },
  time: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
