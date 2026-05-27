import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/colors';

export default function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightPress,
  style,
  multiline,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>}
      <View style={[
        styles.box,
        focused && styles.boxFocused,
        error && styles.boxError,
        multiline && styles.boxMultiline,
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.textMuted}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelFocused: {
    color: colors.primary,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  boxFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  boxError: {
    borderColor: colors.error,
  },
  boxMultiline: {
    height: 'auto',
    minHeight: 100,
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    height: '100%',
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  multiline: {
    minHeight: 80,
    paddingTop: 8,
    height: 'auto',
    textAlignVertical: 'top',
  },
  rightIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});
