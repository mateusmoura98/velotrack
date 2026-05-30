import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';

export default function ScreenWrapper({ children }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width > 768;
  const colors = useThemeColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[
        styles.inner,
        { backgroundColor: colors.bg },
        isDesktop ? styles.innerWide : { paddingBottom: isWeb ? 0 : 56 }
      ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
  },
  innerWide: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 0,
  },
});

