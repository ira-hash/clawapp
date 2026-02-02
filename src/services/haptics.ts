/**
 * Haptics Service
 * 
 * 일관된 햅틱 피드백 관리
 */

import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTICS_ENABLED_KEY = '@clawapp/haptics_enabled';

class HapticsService {
  private enabled: boolean = true;

  async initialize(): Promise<void> {
    const stored = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
    this.enabled = stored !== 'false';
  }

  async setEnabled(value: boolean): Promise<void> {
    this.enabled = value;
    await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, String(value));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Light feedback - button taps, selections
  async light(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  // Medium feedback - toggles, swipes
  async medium(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  // Heavy feedback - important actions
  async heavy(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  // Selection feedback - picker changes
  async selection(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.selectionAsync();
  }

  // Success feedback
  async success(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  // Warning feedback
  async warning(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  // Error feedback
  async error(): Promise<void> {
    if (!this.enabled) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

export const haptics = new HapticsService();
