/**
 * Skeleton Component
 * 
 * 로딩 플레이스홀더 (shimmer effect)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius: radius = borderRadius.sm,
  style,
}: SkeletonProps) {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.surface,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
            backgroundColor: theme.border,
          },
        ]}
      />
    </View>
  );
}

// Preset skeleton layouts
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          style={i > 0 ? { marginTop: 8 } : undefined}
        />
      ))}
    </View>
  );
}

export function SkeletonAvatar({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

export function SkeletonListItem() {
  const { theme } = useTheme();
  return (
    <View style={[styles.listItem, { backgroundColor: theme.background }]}>
      <SkeletonAvatar />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="90%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonCard() {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.background }]}>
      <Skeleton height={120} borderRadius={borderRadius.lg} />
      <View style={styles.cardContent}>
        <Skeleton width="80%" height={18} />
        <SkeletonText lines={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  shimmer: {
    width: 100,
    height: '100%',
    opacity: 0.3,
  },
  textContainer: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
});
