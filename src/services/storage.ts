/**
 * Local Storage Service
 * 
 * Handles persistent storage for messages, rooms, settings
 * No external server required - all data stays on device.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, ChatRoom } from '../types';

const KEYS = {
  MESSAGES: 'claw_messages_',
  ROOMS: 'claw_rooms',
  SETTINGS: 'claw_settings',
  THEME: 'claw_theme',
};

// ============ Chat Rooms ============

/**
 * Load all chat rooms
 */
export async function loadRooms(): Promise<ChatRoom[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ROOMS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Storage] Failed to load rooms:', e);
  }
  return [];
}

/**
 * Save all chat rooms
 */
export async function saveRooms(rooms: ChatRoom[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
  } catch (e) {
    console.error('[Storage] Failed to save rooms:', e);
  }
}

/**
 * Add a new chat room
 */
export async function addRoom(room: ChatRoom): Promise<void> {
  const rooms = await loadRooms();
  rooms.push(room);
  await saveRooms(rooms);
}

/**
 * Update a chat room
 */
export async function updateRoom(roomId: string, updates: Partial<ChatRoom>): Promise<void> {
  const rooms = await loadRooms();
  const index = rooms.findIndex(r => r.id === roomId);
  if (index !== -1) {
    rooms[index] = { ...rooms[index], ...updates };
    await saveRooms(rooms);
  }
}

/**
 * Delete a chat room and its messages
 */
export async function deleteRoom(roomId: string): Promise<void> {
  const rooms = await loadRooms();
  const filtered = rooms.filter(r => r.id !== roomId);
  await saveRooms(filtered);
  await clearMessages(roomId);
}

// ============ Message History ============

/**
 * Save messages for a specific room
 */
export async function saveMessages(roomId: string, messages: Message[]): Promise<void> {
  try {
    const key = KEYS.MESSAGES + roomId;
    // Keep last 500 messages to prevent storage bloat
    const trimmed = messages.slice(-500);
    await AsyncStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.error('[Storage] Failed to save messages:', e);
  }
}

/**
 * Load messages for a specific room
 */
export async function loadMessages(roomId: string): Promise<Message[]> {
  try {
    const key = KEYS.MESSAGES + roomId;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Storage] Failed to load messages:', e);
  }
  return [];
}

/**
 * Clear messages for a specific room
 */
export async function clearMessages(roomId: string): Promise<void> {
  try {
    const key = KEYS.MESSAGES + roomId;
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('[Storage] Failed to clear messages:', e);
  }
}

// ============ Settings ============

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  hapticFeedback: boolean;
  sendOnEnter: boolean;
  fontSize: 'small' | 'medium' | 'large';
  notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  hapticFeedback: true,
  sendOnEnter: true,
  fontSize: 'medium',
  notificationsEnabled: true,
};

/**
 * Load app settings
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('[Storage] Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save app settings
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('[Storage] Failed to save settings:', e);
  }
}

// ============ Theme ============

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Get current theme preference
 */
export async function getThemePreference(): Promise<ThemeMode> {
  try {
    const theme = await AsyncStorage.getItem(KEYS.THEME);
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }
  } catch (e) {
    console.error('[Storage] Failed to get theme:', e);
  }
  return 'system';
}

/**
 * Set theme preference
 */
export async function setThemePreference(theme: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.THEME, theme);
  } catch (e) {
    console.error('[Storage] Failed to set theme:', e);
  }
}
