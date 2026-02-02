/**
 * Progress Bar Component
 * 
 * 진행 상황 표시
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius } from '../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  height = 4,
  color,
  backgroundColor,
  animated = true,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const barColor = color || theme.primary;
  const bgColor = backgroundColor || theme.border;

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: clampedProgress,
        useNativeDriver: false,
        tension: 50,
        friction: 10,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated]);

  return (
    <View style={[styles.container, { height, backgroundColor: bgColor }]}>
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: barColor,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
