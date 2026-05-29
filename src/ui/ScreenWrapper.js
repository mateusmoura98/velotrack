import { View, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export default function ScreenWrapper({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.inner}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: colors.bg,
  },
});
