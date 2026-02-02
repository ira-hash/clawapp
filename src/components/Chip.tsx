/**
 * Chip Component
 * 
 * 태그/필터용 칩
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onRemove?: () => void;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

export function Chip({
  label,
  selected = false,
  icon,
  onPress,
  onRemove,
  size = 'medium',
  variant = 'filled',
}: ChipProps) {
  const { theme } = useTheme();

  const handlePress = async () => {
    if (onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleRemove = async () => {
    if (onRemove) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRemove();
    }
  };

  const isSmall = size === 'small';
  const isFilled = variant === 'filled';

  const backgroundColor = selected
    ? theme.primary
    : isFilled
    ? theme.surface
    : 'transparent';

  const textColor = selected ? '#FFF' : theme.text;
  const borderColor = selected ? theme.primary : theme.border;

  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor,
          borderWidth: isFilled ? 0 : 1,
          paddingVertical: isSmall ? spacing.xs : spacing.sm - 2,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
        },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSmall ? 14 : 16}
          color={textColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          { color: textColor, fontSize: isSmall ? fontSize.xs : fontSize.sm },
        ]}
      >
        {label}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
          <Ionicons
            name="close-circle"
            size={isSmall ? 14 : 16}
            color={textColor}
            style={styles.removeIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontWeight: '500',
  },
  removeIcon: {
    marginLeft: 4,
    opacity: 0.8,
  },
});
