/**
 * Divider Component
 * 
 * 구분선
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize } from '../theme';

interface DividerProps {
  label?: string;
  spacing?: number;
}

export function Divider({ label, spacing: customSpacing }: DividerProps) {
  const { theme } = useTheme();
  const verticalSpacing = customSpacing ?? spacing.md;

  if (label) {
    return (
      <View style={[styles.labelContainer, { marginVertical: verticalSpacing }]}>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
        <Text style={[styles.label, { color: theme.textTertiary }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
      </View>
    );
  }

  return (
    <View 
      style={[
        styles.divider, 
        { backgroundColor: theme.border, marginVertical: verticalSpacing }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
