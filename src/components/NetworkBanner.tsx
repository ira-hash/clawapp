/**
 * Network Status Banner
 * 
 * 네트워크 상태 표시
 * Features:
 * - 연결 끊김 표시
 * - 재연결 중 표시
 * - 오프라인 큐 상태
 * - 애니메이션
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface NetworkBannerProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  queuedCount?: number;
}

export function NetworkBanner({ isConnected, isReconnecting, queuedCount = 0 }: NetworkBannerProps) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const visible = !isConnected || queuedCount > 0;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -50,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  }, [visible, slideAnim]);

  if (!visible) return null;

  const getBannerConfig = () => {
    if (!isConnected) {
      if (isReconnecting) {
        return {
          icon: 'sync' as const,
          text: 'Reconnecting...',
          color: theme.warning,
          showSpinner: true,
        };
      }
      return {
        icon: 'cloud-offline' as const,
        text: 'No connection',
        color: theme.error,
        showSpinner: false,
      };
    }
    if (queuedCount > 0) {
      return {
        icon: 'time' as const,
        text: `${queuedCount} message${queuedCount > 1 ? 's' : ''} pending`,
        color: theme.info,
        showSpinner: true,
      };
    }
    return null;
  };

  const config = getBannerConfig();
  if (!config) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.color,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        {config.showSpinner ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Ionicons name={config.icon} size={16} color="#FFF" />
        )}
        <Text style={styles.text}>{config.text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
