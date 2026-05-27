import { useState, useRef, useEffect } from 'react';
import { Text, Animated, StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme/colors';

export default function Timer({ startTime }) {
  const [elapsed, setElapsed] = useState('00:00:00');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!startTime) return;

    const start = new Date(startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    return () => {
      clearInterval(interval);
      pulseAnim.setValue(1);
    };
  }, [startTime]);

  return (
    <Animated.View style={[styles.container, { opacity: pulseAnim }]}>
      <View style={styles.dot} />
      <View style={styles.center}>
        <Text style={styles.time}>{elapsed}</Text>
        <Text style={styles.label}>TEMPO DE ATENDIMENTO</Text>
      </View>
      <View style={styles.dot} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  center: {
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
});
