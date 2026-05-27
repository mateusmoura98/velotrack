import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Input({ label, error, style, multiline, icon, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.box,
        focused && styles.boxFocused,
        error && styles.boxError,
      ]}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <TextInput
          style={[styles.input, multiline && styles.multiline, icon && { paddingLeft: 0 }]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    color: colors.textSecondary, fontSize: 11, fontWeight: '700',
    marginBottom: 8, letterSpacing: 0.8, textTransform: 'uppercase',
  },
  box: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border, borderWidth: 1.5,
    borderRadius: 12, paddingHorizontal: 16, height: 52,
  },
  boxFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  boxError: { borderColor: colors.error },
  input: {
    flex: 1, color: colors.text, fontSize: 15,
    height: '100%', outlineStyle: 'none',
  },
  multiline: { minHeight: 100, paddingTop: 14, height: 'auto', textAlignVertical: 'top' },
  iconWrap: { marginRight: 12 },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4, fontWeight: '600' },
});
