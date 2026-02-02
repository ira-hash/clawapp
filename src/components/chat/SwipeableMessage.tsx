/**
 * Swipeable Message Component
 * 
 * 텔레그램 스타일 스와이프-투-리플라이
 * Features:
 * - 오른쪽으로 스와이프하면 답장 모드
 * - 햅틱 피드백
 * - 답장 아이콘 애니메이션
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { Message } from '../../types';

interface SwipeableMessageProps {
  message: Message;
  onReply: (message: Message) => void;
  onDelete?: (message: Message) => void;
  children: React.ReactNode;
}

const SWIPE_THRESHOLD = 50;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SwipeableMessage({ message, onReply, onDelete, children }: SwipeableMessageProps) {
  const { theme } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  const hasTriggered = useRef(false);

  const renderLeftActions = useCallback((
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Scale animation for reply icon
    const scale = dragX.interpolate({
      inputRange: [0, SWIPE_THRESHOLD, SWIPE_THRESHOLD + 20],
      outputRange: [0.5, 1, 1.2],
      extrapolate: 'clamp',
    });

    // Opacity animation
    const opacity = dragX.interpolate({
      inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    });

    // Translate animation
    const translateX = dragX.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [-20, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.leftActions,
          {
            opacity,
            transform: [{ translateX }, { scale }],
          }
        ]}
      >
        <View style={[styles.replyIconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons 
            name="arrow-undo" 
            size={20} 
            color={theme.primary} 
          />
        </View>
      </Animated.View>
    );
  }, [theme]);

  const renderRightActions = useCallback((
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!onDelete) return null;
    
    const scale = dragX.interpolate({
      inputRange: [-SWIPE_THRESHOLD - 20, -SWIPE_THRESHOLD, 0],
      outputRange: [1.2, 1, 0.5],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.rightActions,
          {
            opacity,
            transform: [{ scale }],
          }
        ]}
      >
        <View style={[styles.deleteIconContainer, { backgroundColor: theme.error + '20' }]}>
          <Ionicons 
            name="trash" 
            size={20} 
            color={theme.error} 
          />
        </View>
      </Animated.View>
    );
  }, [theme, onDelete]);

  const handleSwipeableOpen = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left' && !hasTriggered.current) {
      hasTriggered.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onReply(message);
      setTimeout(() => {
        swipeableRef.current?.close();
        hasTriggered.current = false;
      }, 100);
    } else if (direction === 'right' && !hasTriggered.current && onDelete) {
      hasTriggered.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onDelete(message);
      setTimeout(() => {
        swipeableRef.current?.close();
        hasTriggered.current = false;
      }, 100);
    }
  }, [message, onReply, onDelete]);

  const handleSwipeableClose = useCallback(() => {
    hasTriggered.current = false;
  }, []);

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={onDelete ? renderRightActions : undefined}
      onSwipeableOpen={handleSwipeableOpen}
      onSwipeableClose={handleSwipeableClose}
      leftThreshold={SWIPE_THRESHOLD}
      rightThreshold={SWIPE_THRESHOLD}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      containerStyle={styles.swipeableContainer}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
    overflow: 'visible',
  },
  leftActions: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    marginRight: -8,
  },
  replyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    marginLeft: -8,
  },
  deleteIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
