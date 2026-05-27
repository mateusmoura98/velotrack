import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { colors } from '../theme/colors';

export default function ScreenWrapper({ children }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.root}>
      <View style={[styles.inner, isWeb && width > 768 && styles.innerWide]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
    backgroundColor: colors.bg,
    paddingBottom: 52,
  },
  innerWide: {
    maxWidth: 1200,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
});
