/**
 * Badge Component
 * 
 * 숫자 또는 점 표시 배지
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface BadgeProps {
  count?: number;
  maxCount?: number;
  dot?: boolean;
  color?: string;
  size?: 'small' | 'medium';
}

export function Badge({
  count,
  maxCount = 99,
  dot = false,
  color,
  size = 'medium',
}: BadgeProps) {
  const { theme } = useTheme();
  const bgColor = color || theme.primary;

  if (dot) {
    return (
      <View style={[
        styles.dot,
        size === 'small' ? styles.dotSmall : styles.dotMedium,
        { backgroundColor: bgColor }
      ]} />
    );
  }

  if (count === undefined || count === 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View style={[
      styles.badge,
      size === 'small' ? styles.badgeSmall : styles.badgeMedium,
      { backgroundColor: bgColor }
    ]}>
      <Text style={[
        styles.text,
        size === 'small' ? styles.textSmall : styles.textMedium
      ]}>
        {displayCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 999,
  },
  dotSmall: {
    width: 8,
    height: 8,
  },
  dotMedium: {
    width: 10,
    height: 10,
  },
  badge: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSmall: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
  },
  badgeMedium: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
  },
  text: {
    color: '#FFF',
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 11,
  },
});
