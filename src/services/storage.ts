/**
 * Local Storage Service
 * 
 * Handles persistent storage for messages, settings, etc.
 * No external server required - all data stays on device.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types';

const KEYS = {
  MESSAGES: 'claw_messages_',
  SETTINGS: 'claw_settings',
  THEME: 'claw_theme',
};

// ============ Message History ============

/**
 * Save messages for a specific agent/session
 */
export async function saveMessages(agentId: string, messages: Message[]): Promise<void> {
  try {
    const key = KEYS.MESSAGES + agentId;
    // Keep last 500 messages to prevent storage bloat
    const trimmed = messages.slice(-500);
    await AsyncStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.error('[Storage] Failed to save messages:', e);
  }
}

/**
 * Load messages for a specific agent/session
 */
export async function loadMessages(agentId: string): Promise<Message[]> {
  try {
    const key = KEYS.MESSAGES + agentId;
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
 * Clear messages for a specific agent
 */
export async function clearMessages(agentId: string): Promise<void> {
  try {
    const key = KEYS.MESSAGES + agentId;
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('[Storage] Failed to clear messages:', e);
  }
}

/**
 * Get all stored agent IDs
 */
export async function getStoredAgentIds(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys
      .filter(k => k.startsWith(KEYS.MESSAGES))
      .map(k => k.replace(KEYS.MESSAGES, ''));
  } catch (e) {
    console.error('[Storage] Failed to get agent IDs:', e);
    return [];
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

/**
 * Update specific setting
 */
export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const settings = await loadSettings();
  settings[key] = value;
  await saveSettings(settings);
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
