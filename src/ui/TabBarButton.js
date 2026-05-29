import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, radii } from '../theme/colors';

export default function TabBarButton({ children, onPress, onLongPress, ...props }) {
  const focused = props['aria-selected'];
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={[styles.button, focused && styles.buttonActive]}
      accessibilityState={{ selected: focused }}
      role={Platform.select({ ios: 'button', default: 'tab' })}
      aria-selected={focused}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  buttonActive: {
    backgroundColor: colors.tabActiveBg,
  },
});
