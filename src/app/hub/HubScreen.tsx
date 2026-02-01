/**
 * Hub Screen
 * 
 * Clawdbot 관련 링크 및 리소스
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../theme';

interface LinkItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
  color: string;
}

const LINKS: LinkItem[] = [
  {
    id: 'docs',
    title: 'Documentation',
    subtitle: 'Setup guides and API reference',
    icon: 'book-outline',
    url: 'https://docs.clawd.bot',
    color: '#007AFF',
  },
  {
    id: 'github',
    title: 'GitHub',
    subtitle: 'Source code and issues',
    icon: 'logo-github',
    url: 'https://github.com/clawdbot/clawdbot',
    color: '#333',
  },
  {
    id: 'discord',
    title: 'Discord Community',
    subtitle: 'Chat with other users',
    icon: 'logo-discord',
    url: 'https://discord.com/invite/clawd',
    color: '#5865F2',
  },
  {
    id: 'skills',
    title: 'ClawdHub Skills',
    subtitle: 'Browse and install skills',
    icon: 'extension-puzzle-outline',
    url: 'https://clawdhub.com',
    color: '#FF6B35',
  },
  {
    id: 'twitter',
    title: 'Twitter / X',
    subtitle: '@clawdbot updates',
    icon: 'logo-twitter',
    url: 'https://x.com/clawdbot',
    color: '#1DA1F2',
  },
];

export function HubScreen() {
  const { theme, isDark } = useTheme();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const renderLink = (item: LinkItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.linkItem, { backgroundColor: theme.surfaceElevated }]}
      onPress={() => handleLinkPress(item.url)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.linkInfo}>
        <Text style={[styles.linkTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.linkSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
      </View>
      <Ionicons name="open-outline" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🦞 Hub</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logoEmoji}>🦞</Text>
          <Text style={[styles.logoTitle, { color: theme.text }]}>Clawdbot</Text>
          <Text style={[styles.logoSubtitle, { color: theme.textSecondary }]}>
            Your AI-powered personal assistant
          </Text>
        </View>

        {/* Links */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          RESOURCES
        </Text>
        <View style={styles.linksContainer}>
          {LINKS.map(renderLink)}
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>
            Claw App v0.4.0
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  logoSubtitle: {
    fontSize: fontSize.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.md,
  },
  linksContainer: {
    gap: spacing.sm,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  linkTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  linkSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    fontSize: fontSize.sm,
  },
});
