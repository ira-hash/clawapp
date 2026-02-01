/**
 * Chats Screen
 * 
 * 모든 에이전트의 최근 대화방 목록 (카카오톡 채팅 탭처럼)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatRoom } from '../../types';
import { StoredAgent, loadAgents, loadRooms } from '../../services/storage';
import { spacing, fontSize, borderRadius } from '../../theme';

interface ChatWithAgent extends ChatRoom {
  agent: StoredAgent;
}

interface ChatsScreenProps {
  onSelectChat: (agent: StoredAgent, room: ChatRoom) => void;
}

export function ChatsScreen({ onSelectChat }: ChatsScreenProps) {
  const { theme, isDark } = useTheme();
  const [chats, setChats] = useState<ChatWithAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all chats from all agents
  const loadAllChats = useCallback(async () => {
    try {
      const agents = await loadAgents();
      const allChats: ChatWithAgent[] = [];

      for (const agent of agents) {
        const rooms = await loadRooms(agent.id);
        for (const room of rooms) {
          allChats.push({ ...room, agent });
        }
      }

      // Sort by last message time (newest first)
      allChats.sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt));
      
      setChats(allChats);
    } catch (e) {
      console.error('[ChatsScreen] Failed to load chats:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllChats();
  }, [loadAllChats]);

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

  const renderChat = ({ item }: { item: ChatWithAgent }) => (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: theme.background }]}
      onPress={() => onSelectChat(item.agent, item)}
    >
      <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20' }]}>
        <Text style={styles.avatarEmoji}>{item.agent.emoji}</Text>
        <View style={[styles.roomBadge, { backgroundColor: theme.surfaceElevated }]}>
          <Text style={styles.roomEmoji}>{item.emoji}</Text>
        </View>
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatTitle, { color: theme.text }]} numberOfLines={1}>
            {item.agent.name} • {item.name}
          </Text>
          <Text style={[styles.chatTime, { color: theme.textSecondary }]}>
            {formatTime(item.lastMessageAt)}
          </Text>
        </View>
        <View style={styles.chatPreview}>
          <Text 
            style={[styles.previewText, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {item.lastMessage || 'No messages yet'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>💬</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Chats Yet</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Add an agent and start chatting!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>💬 Chats</Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={item => `${item.agent.id}-${item.id}`}
        contentContainerStyle={[
          styles.listContent,
          chats.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
        )}
        onRefresh={loadAllChats}
        refreshing={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  roomBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomEmoji: {
    fontSize: 12,
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  chatTime: {
    fontSize: fontSize.xs,
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  previewText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 88,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
