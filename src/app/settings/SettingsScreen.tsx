/**
 * Settings Screen
 * 
 * App preferences and account management
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Settings } from '../../types';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

interface SettingsScreenProps {
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  onBack: () => void;
  onLogout: () => void;
}

interface SettingsItemProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingsItem({ 
  icon, 
  iconColor = colors.primary, 
  title, 
  subtitle,
  value,
  showChevron = true,
  onPress,
  rightElement,
}: SettingsItemProps) {
  const content = (
    <View style={styles.settingsItem}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Ionicons name={icon as any} size={20} color="#FFF" />
      </View>
      
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      
      {rightElement}
      {value && <Text style={styles.itemValue}>{value}</Text>}
      {showChevron && !rightElement && (
        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

function SettingsSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

export function SettingsScreen({ 
  settings, 
  onUpdateSettings, 
  onBack,
  onLogout,
}: SettingsScreenProps) {

  const handleThemeChange = () => {
    Alert.alert(
      'Theme',
      'Choose your preferred theme',
      [
        { text: 'Light', onPress: () => onUpdateSettings({ theme: 'light' }) },
        { text: 'Dark', onPress: () => onUpdateSettings({ theme: 'dark' }) },
        { text: 'System', onPress: () => onUpdateSettings({ theme: 'system' }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleFontSizeChange = () => {
    Alert.alert(
      'Font Size',
      'Choose your preferred font size',
      [
        { text: 'Small', onPress: () => onUpdateSettings({ fontSize: 'small' }) },
        { text: 'Medium', onPress: () => onUpdateSettings({ fontSize: 'medium' }) },
        { text: 'Large', onPress: () => onUpdateSettings({ fontSize: 'large' }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Disconnect All Agents',
      'Are you sure you want to disconnect from all agents? You will need to pair again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const getThemeLabel = () => {
    switch (settings.theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
    }
  };

  const getFontSizeLabel = () => {
    switch (settings.fontSize) {
      case 'small': return 'Small';
      case 'medium': return 'Medium';
      case 'large': return 'Large';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <SettingsSection>
          <SettingsItem
            icon="person"
            iconColor={colors.primary}
            title="Account"
            subtitle="Manage your Clawdbot account"
            onPress={() => Linking.openURL('https://clawd.bot/account')}
          />
        </SettingsSection>

        <SettingsSection title="APPEARANCE">
          <SettingsItem
            icon="moon"
            iconColor="#5856D6"
            title="Theme"
            value={getThemeLabel()}
            onPress={handleThemeChange}
          />
          <View style={styles.separator} />
          <SettingsItem
            icon="text"
            iconColor="#FF9500"
            title="Font Size"
            value={getFontSizeLabel()}
            onPress={handleFontSizeChange}
          />
        </SettingsSection>

        <SettingsSection title="NOTIFICATIONS">
          <SettingsItem
            icon="notifications"
            iconColor="#FF3B30"
            title="Push Notifications"
            showChevron={false}
            rightElement={
              <Switch
                value={settings.notifications}
                onValueChange={(value) => onUpdateSettings({ notifications: value })}
                trackColor={{ false: colors.gray300, true: colors.primary }}
              />
            }
          />
          <View style={styles.separator} />
          <SettingsItem
            icon="pulse"
            iconColor="#34C759"
            title="Haptic Feedback"
            showChevron={false}
            rightElement={
              <Switch
                value={settings.haptics}
                onValueChange={(value) => onUpdateSettings({ haptics: value })}
                trackColor={{ false: colors.gray300, true: colors.primary }}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="SECURITY">
          <SettingsItem
            icon="lock-closed"
            iconColor="#5856D6"
            title="Biometric Lock"
            subtitle="Require Face ID or fingerprint"
            showChevron={false}
            rightElement={
              <Switch
                value={settings.biometricLock}
                onValueChange={(value) => onUpdateSettings({ biometricLock: value })}
                trackColor={{ false: colors.gray300, true: colors.primary }}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="SUPPORT">
          <SettingsItem
            icon="help-circle"
            iconColor="#007AFF"
            title="Help & FAQ"
            onPress={() => Linking.openURL('https://docs.clawd.bot/faq')}
          />
          <View style={styles.separator} />
          <SettingsItem
            icon="book"
            iconColor="#34C759"
            title="Documentation"
            onPress={() => Linking.openURL('https://docs.clawd.bot')}
          />
          <View style={styles.separator} />
          <SettingsItem
            icon="logo-discord"
            iconColor="#5865F2"
            title="Community"
            onPress={() => Linking.openURL('https://discord.com/invite/clawd')}
          />
          <View style={styles.separator} />
          <SettingsItem
            icon="logo-github"
            iconColor="#333"
            title="GitHub"
            onPress={() => Linking.openURL('https://github.com/clawdbot/clawdbot')}
          />
        </SettingsSection>

        <SettingsSection title="LEGAL">
          <SettingsItem
            icon="document-text"
            iconColor={colors.gray500}
            title="Terms of Service"
            onPress={() => Linking.openURL('https://clawd.bot/terms')}
          />
          <View style={styles.separator} />
          <SettingsItem
            icon="shield-checkmark"
            iconColor={colors.gray500}
            title="Privacy Policy"
            onPress={() => Linking.openURL('https://clawd.bot/privacy')}
          />
        </SettingsSection>

        <SettingsSection>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Disconnect All Agents</Text>
          </TouchableOpacity>
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🦞 Claw v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for Clawdbot</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.light.text,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.gray500,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.light.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray200,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: fontSize.md,
    color: colors.light.text,
  },
  itemSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray500,
    marginTop: 2,
  },
  itemValue: {
    fontSize: fontSize.md,
    color: colors.gray500,
    marginRight: spacing.xs,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray200,
    marginLeft: 62,
  },
  logoutButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: fontSize.md,
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  footerText: {
    fontSize: fontSize.md,
    color: colors.gray500,
  },
  footerSubtext: {
    fontSize: fontSize.xs,
    color: colors.gray400,
    marginTop: spacing.xs,
  },
});
