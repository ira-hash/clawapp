/**
 * Animation Configurations
 * 
 * 일관된 애니메이션 설정
 */

import { Animated, Easing } from 'react-native';

// Spring configurations
export const springConfig = {
  default: {
    tension: 100,
    friction: 10,
  },
  gentle: {
    tension: 50,
    friction: 7,
  },
  bouncy: {
    tension: 150,
    friction: 8,
  },
  stiff: {
    tension: 200,
    friction: 15,
  },
};

// Timing configurations
export const timingConfig = {
  fast: {
    duration: 150,
    easing: Easing.ease,
  },
  normal: {
    duration: 250,
    easing: Easing.ease,
  },
  slow: {
    duration: 400,
    easing: Easing.ease,
  },
};

// Common animation presets
export const animationPresets = {
  fadeIn: (value: Animated.Value) =>
    Animated.timing(value, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }),

  fadeOut: (value: Animated.Value) =>
    Animated.timing(value, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }),

  slideUp: (value: Animated.Value) =>
    Animated.spring(value, {
      toValue: 0,
      ...springConfig.default,
      useNativeDriver: true,
    }),

  slideDown: (value: Animated.Value, to: number) =>
    Animated.spring(value, {
      toValue: to,
      ...springConfig.default,
      useNativeDriver: true,
    }),

  scale: (value: Animated.Value, to: number) =>
    Animated.spring(value, {
      toValue: to,
      ...springConfig.bouncy,
      useNativeDriver: true,
    }),

  pulse: (value: Animated.Value) =>
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]),
};

// Stagger delay for list items
export const staggerDelay = 50; // ms between each item
