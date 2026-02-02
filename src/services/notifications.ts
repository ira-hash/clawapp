/**
 * Push Notifications Service
 * 
 * Handles:
 * - Expo push notifications setup
 * - Permission requests
 * - Token registration with gateway
 * - Local notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = 'push_token';
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private pushToken: string | null = null;
  private notificationListener: Notifications.EventSubscription | null = null;
  private responseListener: Notifications.EventSubscription | null = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    // Check if notifications are enabled
    const enabled = await this.isEnabled();
    if (!enabled) {
      console.log('[Notifications] Disabled by user');
      return;
    }

    // Configure Android channel
    await this.setupAndroidChannel();

    // Get or request push token
    await this.registerForPushNotifications();

    // Set up listeners
    this.setupListeners();
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return null;
    }

    // Get push token
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'claw-app', // Replace with actual project ID when deploying
      });
      
      this.pushToken = token.data;
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, this.pushToken);
      
      console.log('[Notifications] Token:', this.pushToken);
      return this.pushToken;
    } catch (error) {
      console.error('[Notifications] Failed to get token:', error);
      return null;
    }
  }

  /**
   * Set up notification listeners
   */
  private setupListeners(): void {
    // Handle received notifications (foreground)
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notifications] Received:', notification);
    });

    // Handle notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Notifications] Response:', response);
      // Navigate to relevant screen based on notification data
      const data = response.notification.request.content.data;
      if (data?.roomId) {
        // Navigate to chat room - handled by navigation context
      }
    });
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Get current push token
   */
  async getToken(): Promise<string | null> {
    if (this.pushToken) return this.pushToken;
    
    const stored = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (stored) {
      this.pushToken = stored;
      return stored;
    }
    
    return null;
  }

  /**
   * Check if notifications are enabled
   */
  async isEnabled(): Promise<boolean> {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return stored !== 'false'; // Default to enabled
  }

  /**
   * Enable/disable notifications
   */
  async setEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(enabled));
    
    if (enabled) {
      await this.registerForPushNotifications();
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    seconds: number = 1
  ): Promise<string> {
    const trigger: Notifications.NotificationTriggerInput = seconds > 0 
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false }
      : null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger,
    });
    
    return id;
  }

  /**
   * Show immediate notification
   */
  async showNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string> {
    return this.scheduleLocalNotification(title, body, data, 0);
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Configure Android channel (required for Android 8+)
   */
  async setupAndroidChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;

    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0A84FF',
    });

    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      description: 'New message notifications',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0A84FF',
    });
  }
}

export const notifications = new NotificationService();
