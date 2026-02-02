/**
 * Chats Screen
 * 
 * 텔레그램 스타일 모든 채팅 목록
 * Features:
 * - 에이전트별 최근 대화방 통합 표시
 * - 시간순 정렬
 * - 검색 기능
 * - 읽지 않은 메시지 배지
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatRoom } from '../../types';
import { StoredAgent, loadAgents, loadRooms } from '../../services/storage';
import { spacing, fontSize, borderRadius, shadows } from '../../theme';

interface ChatWithAgent extends ChatRoom {
  agent: StoredAgent;
}

interface ChatsScreenProps {
  onSelectChat: (agent: StoredAgent, room: ChatRoom) => void;
}

export function ChatsScreen({ onSelectChat }: ChatsScreenProps) {
  const { theme, isDark } = useTheme();
  const [chats, setChats] = useState<ChatWithAgent[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatWithAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchInputRef = useRef<TextInput>(null);

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
      setFilteredChats(allChats);
    } catch (e) {
      console.error('[ChatsScreen] Failed to load chats:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllChats();
  }, [loadAllChats]);

  // Filter chats when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredChats(
        chats.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.agent.name.toLowerCase().includes(query) ||
          c.lastMessage?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, chats]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

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

  const handleChatPress = (chat: ChatWithAgent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectChat(chat.agent, chat);
  };

  const renderChat = ({ item }: { item: ChatWithAgent }) => (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: theme.background }]}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '15' }]}>
        <Text style={styles.avatarEmoji}>{item.agent.emoji}</Text>
        {item.emoji !== '💬' && (
          <View style={[styles.roomBadge, { backgroundColor: theme.surfaceElevated }]}>
            <Text style={styles.roomEmoji}>{item.emoji}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatTitle, { color: theme.text }]} numberOfLines={1}>
            {item.name === 'General' ? item.agent.name : `${item.agent.name} • ${item.name}`}
          </Text>
          <Text style={[
            styles.chatTime, 
            { color: item.unreadCount > 0 ? theme.primary : theme.textTertiary }
          ]}>
            {formatTime(item.lastMessageAt)}
          </Text>
        </View>
        <View style={styles.chatPreview}>
          <Text 
            style={[
              styles.previewText, 
              { 
                color: item.unreadCount > 0 ? theme.text : theme.textSecondary,
                fontWeight: item.unreadCount > 0 ? '500' : '400',
              }
            ]}
            numberOfLines={1}
          >
            {item.lastMessage || 'No messages yet'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchBar = () => {
    if (!showSearch) return null;
    
    return (
      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.surface }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search chats..."
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>💬</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {searchQuery ? 'No Results' : 'No Chats Yet'}
      </Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {searchQuery 
          ? `No chats found for "${searchQuery}"`
          : 'Add an agent and start chatting!'
        }
      </Text>
    </View>
  );

  // Calculate total unread
  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>💬 Chats</Text>
          {totalUnread > 0 && (
            <View style={[styles.totalBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.totalBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={toggleSearch} style={styles.headerButton}>
          <Ionicons 
            name={showSearch ? "close" : "search"} 
            size={22} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {renderSearchBar()}

      <FlatList
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={item => `${item.agent.id}-${item.id}`}
        contentContainerStyle={[
          styles.listContent,
          filteredChats.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadAllChats}
            tintColor={theme.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  totalBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  totalBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: 4,
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
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  roomBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  roomEmoji: {
    fontSize: 11,
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
    letterSpacing: -0.2,
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
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    marginLeft: spacing.sm,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 86,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 72,
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
    lineHeight: 22,
  },
});
