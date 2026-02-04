/**
 * PinButton Component
 * 
 * 메시지 고정/해제 버튼
 */

import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import {
  pinMessage,
  unpinMessage,
  isMessagePinned,
} from '../../services/PinnedService';

interface PinButtonProps {
  messageId: string;
  roomId: string;
  agentId: string;
  content: string;
  onPinChange?: (isPinned: boolean) => void;
  size?: number;
}

export function PinButton({
  messageId,
  roomId,
  agentId,
  content,
  onPinChange,
  size = 18,
}: PinButtonProps) {
  const { theme } = useTheme();
  const [isPinned, setIsPinned] = useState(false);
  
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsPinned(isMessagePinned(messageId, roomId));
  }, [messageId, roomId]);

  const handlePress = async () => {
    // 애니메이션
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
        Animated.timing(rotateAnim, {
          toValue: isPinned ? 0 : 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
    ]).start();

    if (isPinned) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await unpinMessage(messageId, roomId);
      setIsPinned(false);
      onPinChange?.(false);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await pinMessage(messageId, roomId, agentId, content);
      setIsPinned(true);
      onPinChange?.(true);
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.button}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { rotate }],
        }}
      >
        <Ionicons
          name={isPinned ? 'pin' : 'pin-outline'}
          size={size}
          color={isPinned ? theme.primary : theme.textSecondary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
