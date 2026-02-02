/**
 * Icon Button Component
 * 
 * 아이콘만 있는 버튼
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

type IconButtonVariant = 'default' | 'filled' | 'tinted';
type IconButtonSize = 'small' | 'medium' | 'large';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: string;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  variant = 'default',
  size = 'medium',
  color,
  disabled = false,
}: IconButtonProps) {
  const { theme } = useTheme();

  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeMap = {
    small: { container: 32, icon: 18 },
    medium: { container: 40, icon: 22 },
    large: { container: 48, icon: 26 },
  };

  const s = sizeMap[size];
  const iconColor = color || theme.primary;

  const getBackgroundColor = () => {
    switch (variant) {
      case 'filled':
        return iconColor;
      case 'tinted':
        return iconColor + '20';
      default:
        return 'transparent';
    }
  };

  const getIconColor = () => {
    if (variant === 'filled') return '#FFF';
    return iconColor;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          width: s.container,
          height: s.container,
          borderRadius: s.container / 2,
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={s.icon} color={getIconColor()} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
