/**
 * Agent List Item
 * 
 * Telegram-style chat list item showing agent info and last message
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
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface AgentListItemProps {
  agent: Agent;
  onPress: () => void;
  onLongPress?: () => void;
}

export function AgentListItem({ agent, onPress, onLongPress }: AgentListItemProps) {
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
      <View style={[styles.avatar, styles.avatarPlaceholder]}>
        <Text style={styles.avatarEmoji}>{agent.emoji || '🤖'}</Text>
      </View>
    );
  };

  const renderStatus = () => {
    const status = agent.lastMessage?.status;
    if (!status || agent.lastMessage?.role !== 'user') return null;
    
    if (status === 'read') {
      return <Ionicons name="checkmark-done" size={16} color={colors.read} />;
    } else if (status === 'delivered' || status === 'sent') {
      return <Ionicons name="checkmark-done" size={16} color={colors.sent} />;
    } else if (status === 'sending') {
      return <Ionicons name="time-outline" size={14} color={colors.sent} />;
    }
    return null;
  };

  return (
    <TouchableHighlight
      onPress={onPress}
      onLongPress={onLongPress}
      underlayColor={colors.gray100}
    >
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          {renderAvatar()}
          {agent.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{agent.name}</Text>
            <Text style={styles.time}>{formatTime(agent.lastMessage?.timestamp)}</Text>
          </View>
          
          <View style={styles.bottomRow}>
            <View style={styles.messagePreview}>
              {renderStatus()}
              <Text style={styles.preview} numberOfLines={1}>
                {agent.lastMessage?.content || 'No messages yet'}
              </Text>
            </View>
            
            {agent.unreadCount > 0 && (
              <View style={styles.badge}>
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
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.light.background,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarPlaceholder: {
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.light.background,
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
    color: colors.light.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    fontSize: fontSize.sm,
    color: colors.light.textSecondary,
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
    color: colors.light.textSecondary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
