/**
 * Button Component
 * 
 * OpenClaw 디자인 시스템 버튼
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const { theme } = useTheme();

  const handlePress = async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.primary,
          text: '#FFF',
          border: 'transparent',
        };
      case 'secondary':
        return {
          bg: theme.surface,
          text: theme.text,
          border: 'transparent',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: theme.primary,
          border: theme.primary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: theme.primary,
          border: 'transparent',
        };
      case 'danger':
        return {
          bg: theme.error,
          text: '#FFF',
          border: 'transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs + 2,
          paddingHorizontal: spacing.md,
          fontSize: fontSize.sm,
          iconSize: 16,
        };
      case 'medium':
        return {
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.lg,
          fontSize: fontSize.md,
          iconSize: 18,
        };
      case 'large':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          fontSize: fontSize.lg,
          iconSize: 20,
        };
    }
  };

  const colors = getColors();
  const sizeStyles = getSizeStyles();
  const opacity = disabled ? 0.5 : 1;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity,
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={sizeStyles.iconSize} 
              color={colors.text} 
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.text, { color: colors.text, fontSize: sizeStyles.fontSize }]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={sizeStyles.iconSize} 
              color={colors.text} 
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
