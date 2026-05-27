import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';

export default function BarChart({ data = [], title, height = 200 }) {
  const animRef = useRef([]);

  if (animRef.current.length !== data.length) {
    animRef.current = data.map((_, i) => animRef.current[i] || new Animated.Value(0));
  }
  const animations = animRef.current;

  useEffect(() => {
    if (data.length > 0) {
      Animated.stagger(
        100,
        animations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          })
        )
      ).start();
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sem dados</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={[styles.chartArea, { height }]} >
        {data.map((item, index) => {
          const anim = animations[index];
          const percentage = (item.value / maxValue) * 100;

          return (
            <View key={index} style={styles.barContainer}>
              <Text style={styles.valueText}>{item.value}</Text>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: item.color || colors.primary,
                      height: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${percentage}%`]
                      })
                    }
                  ]}
                />
              </View>
              <Text style={styles.labelText}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  valueText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  barTrack: {
    flex: 1,
    width: 24,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  labelText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
