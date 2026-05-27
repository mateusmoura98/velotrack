import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';

export default function ResponsiveLayout({ children }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = isWeb && width > 640;

  return (
    <View style={[styles.root, isWeb && styles.rootWeb]}>
      <View style={[styles.inner, isLargeScreen && styles.innerLarge]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rootWeb: {
    alignItems: 'center',
    backgroundColor: '#060608',
  },
  inner: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  innerLarge: {
    maxWidth: 480,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
});
