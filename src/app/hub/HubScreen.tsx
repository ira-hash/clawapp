/**
 * Hub Screen
 * 
 * 텔레그램 스타일 리소스 & 스킬 허브
 * Features:
 * - Quick links to resources
 * - Installed skills list
 * - Feature suggestions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, borderRadius, shadows } from '../../theme';

interface LinkItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
  color: string;
}

interface SkillItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  installed: boolean;
}

const QUICK_LINKS: LinkItem[] = [
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
    title: 'Discord',
    subtitle: 'Join the community',
    icon: 'logo-discord',
    url: 'https://discord.com/invite/clawd',
    color: '#5865F2',
  },
];

const SAMPLE_SKILLS: SkillItem[] = [
  {
    id: 'weather',
    name: 'Weather',
    description: 'Get weather forecasts',
    icon: '🌤️',
    installed: true,
  },
  {
    id: 'github-skill',
    name: 'GitHub',
    description: 'Manage repos, PRs, issues',
    icon: '🐙',
    installed: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Create and manage pages',
    icon: '📝',
    installed: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages to Slack',
    icon: '💬',
    installed: false,
  },
];

export function HubScreen() {
  const { theme, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [skills] = useState(SAMPLE_SKILLS);

  const handleLinkPress = async (url: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch skills from ClawdHub
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderQuickLink = (item: LinkItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.quickLink, { backgroundColor: item.color }]}
      onPress={() => handleLinkPress(item.url)}
      activeOpacity={0.8}
    >
      <Ionicons name={item.icon} size={24} color="#FFF" />
      <Text style={styles.quickLinkTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderSkill = (skill: SkillItem) => (
    <TouchableOpacity
      key={skill.id}
      style={[styles.skillItem, { backgroundColor: theme.surfaceElevated }]}
      onPress={() => handleLinkPress('https://clawdhub.com/skills/' + skill.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.skillIcon}>{skill.icon}</Text>
      <View style={styles.skillInfo}>
        <Text style={[styles.skillName, { color: theme.text }]}>{skill.name}</Text>
        <Text style={[styles.skillDesc, { color: theme.textSecondary }]}>{skill.description}</Text>
      </View>
      {skill.installed ? (
        <View style={[styles.installedBadge, { backgroundColor: theme.success + '20' }]}>
          <Ionicons name="checkmark" size={14} color={theme.success} />
        </View>
      ) : (
        <Ionicons name="add-circle-outline" size={22} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🦞 Hub</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => handleLinkPress('https://clawdhub.com')}
        >
          <Ionicons name="search" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Quick Links */}
        <View style={styles.quickLinksContainer}>
          {QUICK_LINKS.map(renderQuickLink)}
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Skills</Text>
            <TouchableOpacity onPress={() => handleLinkPress('https://clawdhub.com')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.skillsContainer, { backgroundColor: theme.surfaceElevated }]}>
            {skills.map((skill, index) => (
              <View key={skill.id}>
                {renderSkill(skill)}
                {index < skills.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Feature Requests */}
        <TouchableOpacity 
          style={[styles.featureCard, { backgroundColor: theme.primary + '10' }]}
          onPress={() => handleLinkPress('https://github.com/clawdbot/clawdbot/issues/new')}
        >
          <Ionicons name="bulb-outline" size={24} color={theme.primary} />
          <View style={styles.featureInfo}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Request a Feature</Text>
            <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
              Have an idea? Let us know on GitHub!
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>
            Claw v0.7.0 • Made with 🦞
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 8,
  },
  content: {
    padding: spacing.md,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    ...shadows.sm,
  },
  quickLinkTitle: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  skillsContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  skillIcon: {
    fontSize: 28,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  skillDesc: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  installedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  versionText: {
    fontSize: fontSize.sm,
  },
});
