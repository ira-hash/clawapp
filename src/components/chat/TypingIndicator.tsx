/**
 * Typing Indicator Component
 * 
 * 텔레그램 스타일 타이핑 애니메이션
 * Features:
 * - 3개의 점이 순차적으로 바운스
 * - thinking 상태 지원
 * - 부드러운 등장/퇴장 애니메이션
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface TypingIndicatorProps {
  isTyping: boolean;
  isThinking?: boolean;
  agentName?: string;
}

export function TypingIndicator({ isTyping, isThinking, agentName }: TypingIndicatorProps) {
  const { theme } = useTheme();
  
  // Animation values for dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  
  // Container animation
  const containerOpacity = useRef(new Animated.Value(0)).current;

  // Show/hide animation
  useEffect(() => {
    if (isTyping || isThinking) {
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isTyping, isThinking, containerOpacity]);

  // Dot bounce animation
  useEffect(() => {
    if (!isTyping) return;

    const createBounce = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = Animated.parallel([
      createBounce(dot1, 0),
      createBounce(dot2, 150),
      createBounce(dot3, 300),
    ]);

    animations.start();

    return () => {
      animations.stop();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, [isTyping, dot1, dot2, dot3]);

  if (!isTyping && !isThinking) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: containerOpacity }
      ]}
    >
      <View style={[styles.bubble, { backgroundColor: theme.messageBubbleAssistant }]}>
        {isThinking ? (
          <View style={styles.thinkingContainer}>
            <Text style={styles.thinkingEmoji}>🤔</Text>
            <Text style={[styles.thinkingText, { color: theme.textSecondary }]}>
              Thinking...
            </Text>
          </View>
        ) : (
          <View style={styles.dotsContainer}>
            {[dot1, dot2, dot3].map((dot, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { 
                    backgroundColor: theme.primary,
                    transform: [{ translateY: dot }],
                  }
                ]}
              />
            ))}
          </View>
        )}
      </View>
      
      {agentName && (
        <Text style={[styles.statusText, { color: theme.textSecondary }]}>
          {isThinking ? `${agentName} is thinking...` : `${agentName} is typing...`}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    minWidth: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  thinkingEmoji: {
    fontSize: 16,
  },
  thinkingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});
