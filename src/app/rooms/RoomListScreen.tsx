/**
 * Room List Screen
 * 
 * Shows all chat rooms (sessions) for the connected agent
 * Supports:
 * - Creating new rooms
 * - Swipe to delete
 * - Room renaming
 * - Unread indicators
 */

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatRoom } from '../../types';
import { loadRooms, saveRooms, addRoom, deleteRoom } from '../../services/storage';
import { spacing, fontSize, borderRadius } from '../../theme';

// Default emoji options for rooms
const ROOM_EMOJIS = ['💬', '📝', '🔍', '💡', '🚀', '🎯', '📊', '🛠️', '🎨', '📚'];

interface RoomListScreenProps {
  onSelectRoom: (room: ChatRoom) => void;
  onDisconnect: () => void;
  agentName: string;
}

export function RoomListScreen({ onSelectRoom, onDisconnect, agentName }: RoomListScreenProps) {
  const { theme, isDark } = useTheme();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💬');

  // Load rooms on mount
  useEffect(() => {
    loadRooms().then((saved) => {
      if (saved.length === 0) {
        // Create default room if none exist
        const defaultRoom: ChatRoom = {
          id: 'default',
          name: 'General',
          emoji: '💬',
          createdAt: Date.now(),
          unreadCount: 0,
        };
        setRooms([defaultRoom]);
        saveRooms([defaultRoom]);
      } else {
        setRooms(saved);
      }
      setIsLoading(false);
    });
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      name: newRoomName.trim(),
      emoji: selectedEmoji,
      createdAt: Date.now(),
      unreadCount: 0,
    };

    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    await saveRooms(updatedRooms);

    setShowNewRoomModal(false);
    setNewRoomName('');
    setSelectedEmoji('💬');

    // Auto-open the new room
    onSelectRoom(newRoom);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (rooms.length === 1) {
      Alert.alert('Cannot Delete', 'You must have at least one chat room.');
      return;
    }

    Alert.alert(
      'Delete Room',
      'Are you sure? This will delete all messages in this room.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await deleteRoom(roomId);
            setRooms(rooms.filter(r => r.id !== roomId));
          },
        },
      ]
    );
  };

  const renderRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={[styles.roomItem, { backgroundColor: theme.surfaceElevated }]}
      onPress={() => onSelectRoom(item)}
      onLongPress={() => handleDeleteRoom(item.id)}
      delayLongPress={500}
    >
      <View style={styles.roomEmoji}>
        <Text style={styles.emojiText}>{item.emoji}</Text>
      </View>
      <View style={styles.roomInfo}>
        <Text style={[styles.roomName, { color: theme.text }]}>{item.name}</Text>
        {item.lastMessage && (
          <Text 
            style={[styles.lastMessage, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        )}
      </View>
      <View style={styles.roomMeta}>
        {item.unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={onDisconnect} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color={theme.primary} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🦞 {agentName}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {rooms.length} room{rooms.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => setShowNewRoomModal(true)} 
        style={styles.addButton}
      >
        <Ionicons name="add-circle" size={28} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderNewRoomModal = () => (
    <Modal
      visible={showNewRoomModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowNewRoomModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surfaceElevated }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>New Chat Room</Text>
          
          {/* Emoji selector */}
          <View style={styles.emojiSelector}>
            {ROOM_EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiOption,
                  selectedEmoji === emoji && { backgroundColor: theme.primary + '30' }
                ]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emojiOptionText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name input */}
          <TextInput
            style={[styles.nameInput, { 
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.border 
            }]}
            value={newRoomName}
            onChangeText={setNewRoomName}
            placeholder="Room name..."
            placeholderTextColor={theme.textSecondary}
            autoFocus
            maxLength={30}
          />

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.surface }]}
              onPress={() => {
                setShowNewRoomModal(false);
                setNewRoomName('');
              }}
            >
              <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleCreateRoom}
            >
              <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🦞</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Chat Rooms</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Tap + to create your first room
      </Text>
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
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
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
    paddingHorizontal: spacing.md,
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
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  addButton: {
    padding: spacing.xs,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  roomEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,122,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  roomInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  roomName: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    marginHorizontal: spacing.lg,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emojiSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  nameInput: {
    height: 48,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
