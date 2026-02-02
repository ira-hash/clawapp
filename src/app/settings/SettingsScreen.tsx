/**
 * Settings Screen
 * 
 * 앱 설정 및 테마 변경
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeMode } from '../../services/storage';
import { notifications } from '../../services/notifications';
import { biometrics, getBiometricTypeName } from '../../services/biometrics';
import { spacing, fontSize, borderRadius } from '../../theme';

interface SettingsScreenProps {
  onLogout?: () => void;
}

export function SettingsScreen({ onLogout }: SettingsScreenProps) {
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const [haptics, setHaptics] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');

  // Load settings on mount
  useEffect(() => {
    notifications.isEnabled().then(setNotificationsEnabled);
    
    // Check biometrics
    const loadBiometrics = async () => {
      await biometrics.init();
      const supported = await biometrics.isSupported();
      setBiometricSupported(supported);
      setBiometricEnabled(biometrics.getEnabled());
      
      if (supported) {
        const type = await biometrics.getBiometricType();
        setBiometricType(getBiometricTypeName(type));
      }
    };
    loadBiometrics();
  }, []);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    await notifications.setEnabled(enabled);
    
    if (enabled) {
      const token = await notifications.registerForPushNotifications();
      if (!token) {
        Alert.alert(
          'Notifications',
          'Please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setNotificationsEnabled(false) },
            { text: 'Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      // Authenticate first before enabling
      const success = await biometrics.authenticate(`Use ${biometricType} to enable app lock`);
      if (success) {
        setBiometricEnabled(true);
        await biometrics.setEnabled(true);
      }
    } else {
      setBiometricEnabled(false);
      await biometrics.setEnabled(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'This will remove all agents and data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
      {title}
    </Text>
  );

  const renderThemeOption = (mode: ThemeMode, label: string, icon: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        { backgroundColor: theme.surfaceElevated },
        themeMode === mode && { borderColor: theme.primary, borderWidth: 2 }
      ]}
      onPress={() => handleThemeChange(mode)}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={themeMode === mode ? theme.primary : theme.textSecondary} 
      />
      <Text style={[
        styles.themeLabel,
        { color: themeMode === mode ? theme.primary : theme.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderToggle = (
    label: string,
    subtitle: string,
    value: boolean,
    onValueChange: (val: boolean) => void
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.surfaceElevated }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor="#FFF"
      />
    </View>
  );

  const renderButton = (
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    onPress: () => void,
    destructive?: boolean
  ) => (
    <TouchableOpacity
      style={[styles.buttonItem, { backgroundColor: theme.surfaceElevated }]}
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={22} 
        color={destructive ? theme.error : theme.text} 
      />
      <Text style={[
        styles.buttonLabel,
        { color: destructive ? theme.error : theme.text }
      ]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>⚙️ Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Appearance */}
        {renderSectionHeader('APPEARANCE')}
        <View style={styles.themeContainer}>
          {renderThemeOption('light', 'Light', 'sunny-outline')}
          {renderThemeOption('dark', 'Dark', 'moon-outline')}
          {renderThemeOption('system', 'Auto', 'phone-portrait-outline')}
        </View>

        {/* Preferences */}
        {renderSectionHeader('PREFERENCES')}
        <View style={styles.settingsGroup}>
          {renderToggle(
            'Haptic Feedback',
            'Vibration on actions',
            haptics,
            setHaptics
          )}
          {renderToggle(
            'Push Notifications',
            'Receive message alerts when app is closed',
            notificationsEnabled,
            handleNotificationToggle
          )}
        </View>

        {/* Security */}
        {biometricSupported && (
          <>
            {renderSectionHeader('SECURITY')}
            <View style={styles.settingsGroup}>
              {renderToggle(
                biometricType,
                'Require authentication to open app',
                biometricEnabled,
                handleBiometricToggle
              )}
            </View>
          </>
        )}

        {/* About */}
        {renderSectionHeader('ABOUT')}
        <View style={styles.settingsGroup}>
          {renderButton('Documentation', 'book-outline', () => openLink('https://docs.clawd.bot'))}
          {renderButton('GitHub', 'logo-github', () => openLink('https://github.com/clawdbot/clawdbot'))}
          {renderButton('Discord', 'logo-discord', () => openLink('https://discord.com/invite/clawd'))}
        </View>

        {/* Danger Zone */}
        {renderSectionHeader('ACCOUNT')}
        <View style={styles.settingsGroup}>
          {renderButton('Clear All Data', 'trash-outline', handleLogout, true)}
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>
            Claw v0.7.0
          </Text>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>
            Made with 🦞 for Clawdbot
          </Text>
        </View>
      </ScrollView>
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
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.lg,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  themeLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  settingsGroup: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  buttonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  buttonLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  versionText: {
    fontSize: fontSize.sm,
  },
});
