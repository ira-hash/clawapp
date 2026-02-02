/**
 * Chat Header Component
 * 
 * 텔레그램 스타일 채팅 헤더
 * Features:
 * - 연결 상태 표시
 * - 에이전트 정보
 * - 타이핑 상태 표시
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ChatHeaderProps {
  title: string;
  emoji: string;
  isConnected: boolean;
  isTyping?: boolean;
  isThinking?: boolean;
  onBack: () => void;
  onTitlePress?: () => void;
}

export function ChatHeader({ 
  title, 
  emoji,
  isConnected, 
  isTyping,
  isThinking,
  onBack,
  onTitlePress,
}: ChatHeaderProps) {
  const { theme } = useTheme();

  const getStatusText = () => {
    if (!isConnected) return 'Connecting...';
    if (isThinking) return 'thinking...';
    if (isTyping) return 'typing...';
    return 'online';
  };

  const getStatusColor = () => {
    if (!isConnected) return theme.warning;
    if (isTyping || isThinking) return theme.primary;
    return theme.success;
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.background, 
      borderBottomColor: theme.border 
    }]}>
      {/* Back button */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color={theme.primary} />
      </TouchableOpacity>

      {/* Center content */}
      <TouchableOpacity 
        style={styles.centerContent}
        onPress={onTitlePress}
        disabled={!onTitlePress}
        activeOpacity={onTitlePress ? 0.7 : 1}
      >
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[
            styles.statusText, 
            { color: (isTyping || isThinking) ? theme.primary : theme.textSecondary }
          ]}>
            {getStatusText()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right actions */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 0) + 10,
  },
  backButton: {
    padding: 6,
    marginRight: 4,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    maxWidth: 200,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
});
