import { View, Text, StyleSheet } from 'react-native';

export default function Logo({ size = 'large' }) {
  const isLarge = size === 'large';

  return (
    <View style={styles.container}>
      <Text style={[styles.text, isLarge ? styles.textLarge : styles.textSmall]}>
        <Text style={styles.velo}>VELO</Text>
        <Text style={styles.track}>TRACK</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
    letterSpacing: 2,
  },
  textLarge: {
    fontSize: 38,
  },
  textSmall: {
    fontSize: 26,
  },
  velo: {
    color: '#FFFFFF',
  },
  track: {
    color: '#FF1493',
    textShadowColor: 'rgba(255, 20, 147, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
