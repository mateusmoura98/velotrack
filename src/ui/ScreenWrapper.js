import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { colors } from '../theme/colors';

export default function ScreenWrapper({ children }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width > 768;

  return (
    <View style={styles.root}>
      <View style={[
        styles.inner, 
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
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
    backgroundColor: colors.bg,
  },
  innerWide: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 0,
  },
});
