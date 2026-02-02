/**
 * Agent List Item
 * 
 * OpenClaw Design System 스타일 리스트 아이템
 * Features:
 * - Clean minimal design
 * - Online status indicator
 * - Unread badge with accent color
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Agent } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';

interface AgentListItemProps {
  agent: Agent;
  onPress: () => void;
  onLongPress?: () => void;
}

export function AgentListItem({ agent, onPress, onLongPress }: AgentListItemProps) {
  const { theme, isDark } = useTheme();

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderAvatar = () => {
    if (agent.avatar) {
      return <Image source={{ uri: agent.avatar }} style={styles.avatar} />;
    }
    
    return (
      <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.surfaceElevated }]}>
        <Text style={styles.avatarEmoji}>{agent.emoji || '🤖'}</Text>
      </View>
    );
  };

  const renderStatus = () => {
    const status = agent.lastMessage?.status;
    if (!status || agent.lastMessage?.role !== 'user') return null;
    
    const readColor = theme.secondary || '#14b8a6';
    const sentColor = theme.textTertiary;
    
    if (status === 'read') {
      return <Ionicons name="checkmark-done" size={16} color={readColor} />;
    } else if (status === 'delivered' || status === 'sent') {
      return <Ionicons name="checkmark-done" size={16} color={sentColor} />;
    } else if (status === 'sending') {
      return <Ionicons name="time-outline" size={14} color={sentColor} />;
    }
    return null;
  };

  return (
    <TouchableHighlight
      onPress={onPress}
      onLongPress={onLongPress}
      underlayColor={theme.surfaceElevated}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.avatarContainer}>
          {renderAvatar()}
          {agent.isOnline && (
            <View style={[styles.onlineIndicator, { 
              backgroundColor: theme.success,
              borderColor: theme.background,
            }]} />
          )}
        </View>
        
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {agent.name}
            </Text>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {formatTime(agent.lastMessage?.timestamp)}
            </Text>
          </View>
          
          <View style={styles.bottomRow}>
            <View style={styles.messagePreview}>
              {renderStatus()}
              <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={1}>
                {agent.lastMessage?.content || 'No messages yet'}
              </Text>
            </View>
            
            {agent.unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>
                  {agent.unreadCount > 99 ? '99+' : agent.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
    letterSpacing: -0.3,
  },
  time: {
    fontSize: fontSize.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
    gap: 4,
  },
  preview: {
    fontSize: fontSize.md,
    flex: 1,
  },
  badge: {
    borderRadius: borderRadius.full,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
