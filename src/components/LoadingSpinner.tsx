/**
 * Loading Spinner Component
 * 
 * OpenClaw 스타일 로딩 인디케이터
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'medium', 
  message, 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spin animation
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    spin.start();
    pulse.start();

    return () => {
      spin.stop();
      pulse.stop();
    };
  }, [spinValue, pulseValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64,
  };

  const spinnerSize = sizeMap[size];
  const borderWidth = size === 'small' ? 2 : size === 'medium' ? 3 : 4;

  const spinner = (
    <View style={styles.spinnerContainer}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderWidth,
            borderColor: theme.border,
            borderTopColor: theme.primary,
            transform: [{ rotate }, { scale: pulseValue }],
          },
        ]}
      />
      {message && (
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.background }]}>
        {spinner}
      </View>
    );
  }

  return spinner;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderRadius: 9999,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
  },
});
