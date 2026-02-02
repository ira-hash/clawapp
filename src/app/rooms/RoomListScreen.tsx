/**
 * Room List Screen
 * 
 * 텔레그램 스타일 채팅방 목록
 * Features:
 * - 방 생성/삭제
 * - 마지막 메시지 미리보기
 * - 읽지 않은 메시지 배지
 * - 시간 표시
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatRoom } from '../../types';
import { loadRooms, saveRooms, deleteRoom } from '../../services/storage';
import { spacing, fontSize, borderRadius, shadows } from '../../theme';

// Default emoji options for rooms
const ROOM_EMOJIS = ['💬', '📝', '🔍', '💡', '🚀', '🎯', '📊', '🛠️', '🎨', '📚', '🎮', '🎵'];

interface RoomListScreenProps {
  agentId: string;
  agentName: string;
  agentEmoji: string;
  onSelectRoom: (room: ChatRoom) => void;
  onBack: () => void;
}

export function RoomListScreen({ 
  agentId, 
  agentName, 
  agentEmoji,
  onSelectRoom, 
  onBack 
}: RoomListScreenProps) {
  const { theme, isDark } = useTheme();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💬');
  
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Load rooms on mount
  useEffect(() => {
    loadRooms(agentId).then((saved) => {
      if (saved.length === 0) {
        const defaultRoom: ChatRoom = {
          id: `${agentId}-default`,
          name: 'General',
          emoji: '💬',
          createdAt: Date.now(),
          unreadCount: 0,
        };
        setRooms([defaultRoom]);
        saveRooms(agentId, [defaultRoom]);
      } else {
        // Sort by last message time
        const sorted = [...saved].sort((a, b) => 
          (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt)
        );
        setRooms(sorted);
      }
      setIsLoading(false);
    });
  }, [agentId]);

  // Modal animation
  useEffect(() => {
    Animated.spring(modalAnim, {
      toValue: showNewRoomModal ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [showNewRoomModal, modalAnim]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const saved = await loadRooms(agentId);
    const sorted = [...saved].sort((a, b) => 
      (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt)
    );
    setRooms(sorted);
    setRefreshing(false);
  }, [agentId]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newRoom: ChatRoom = {
      id: `${agentId}-room-${Date.now()}`,
      name: newRoomName.trim(),
      emoji: selectedEmoji,
      createdAt: Date.now(),
      unreadCount: 0,
    };

    const updatedRooms = [newRoom, ...rooms];
    setRooms(updatedRooms);
    await saveRooms(agentId, updatedRooms);

    setShowNewRoomModal(false);
    setNewRoomName('');
    setSelectedEmoji('💬');

    // Auto-open the new room
    onSelectRoom(newRoom);
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (rooms.length === 1) {
      Alert.alert('Cannot Delete', 'You must have at least one chat room.');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Delete Room',
      `Delete "${roomName}"? All messages will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await deleteRoom(agentId, roomId);
            setRooms(rooms.filter(r => r.id !== roomId));
          },
        },
      ]
    );
  };

  const formatTime = (timestamp?: number): string => {
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

  const renderRoom = ({ item, index }: { item: ChatRoom; index: number }) => (
    <TouchableOpacity
      style={[styles.roomItem, { backgroundColor: theme.surfaceElevated }]}
      onPress={() => onSelectRoom(item)}
      onLongPress={() => handleDeleteRoom(item.id, item.name)}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <View style={[styles.roomEmoji, { backgroundColor: theme.primary + '15' }]}>
        <Text style={styles.emojiText}>{item.emoji}</Text>
      </View>
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={[styles.roomName, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.timeText, { color: theme.textTertiary }]}>
            {formatTime(item.lastMessageAt)}
          </Text>
        </View>
        <View style={styles.roomPreview}>
          <Text 
            style={[
              styles.lastMessage, 
              { color: item.unreadCount > 0 ? theme.text : theme.textSecondary }
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

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color={theme.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerCenter} activeOpacity={0.7}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {agentEmoji} {agentName}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {rooms.length} room{rooms.length !== 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowNewRoomModal(true);
        }} 
        style={styles.addButton}
      >
        <Ionicons name="add-circle" size={28} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderNewRoomModal = () => {
    const translateY = modalAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    });

    return (
      <Modal
        visible={showNewRoomModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowNewRoomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: theme.surfaceElevated,
                transform: [{ translateY }],
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>New Room</Text>
              <TouchableOpacity 
                onPress={() => setShowNewRoomModal(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {/* Emoji selector */}
            <View style={styles.emojiSelector}>
              {ROOM_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    { backgroundColor: theme.surface },
                    selectedEmoji === emoji && { 
                      backgroundColor: theme.primary + '25',
                      borderWidth: 2,
                      borderColor: theme.primary,
                    }
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedEmoji(emoji);
                  }}
                >
                  <Text style={styles.emojiOptionText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name input */}
            <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
              <Text style={styles.inputEmoji}>{selectedEmoji}</Text>
              <TextInput
                style={[styles.nameInput, { color: theme.text }]}
                value={newRoomName}
                onChangeText={setNewRoomName}
                placeholder="Room name..."
                placeholderTextColor={theme.textSecondary}
                autoFocus
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleCreateRoom}
              />
            </View>

            {/* Create button */}
            <TouchableOpacity
              style={[
                styles.createButton, 
                { backgroundColor: newRoomName.trim() ? theme.primary : theme.surface }
              ]}
              onPress={handleCreateRoom}
              disabled={!newRoomName.trim()}
            >
              <Text style={[
                styles.createButtonText, 
                { color: newRoomName.trim() ? '#FFF' : theme.textTertiary }
              ]}>
                Create Room
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{agentEmoji}</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Rooms</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Create your first chat room to start
      </Text>
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: theme.primary }]}
        onPress={() => setShowNewRoomModal(true)}
      >
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.emptyButtonText}>New Room</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {renderHeader()}
      
      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          rooms.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      />

      {renderNewRoomModal()}
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  addButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  roomEmoji: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
  roomInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roomName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  timeText: {
    fontSize: fontSize.xs,
  },
  roomPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lastMessage: {
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
  },
  unreadText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
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
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  modalClose: {
    padding: 4,
  },
  emojiSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  inputEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  nameInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
  },
  createButton: {
    height: 50,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
