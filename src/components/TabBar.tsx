/**
 * Bottom Tab Bar Component
 * 
 * OpenClaw Design System 스타일 하단 네비게이션
 * Features:
 * - Signature red accent for active state
 * - Clean minimal design
 * - Badge support
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

export type TabName = 'agents' | 'chats' | 'hub' | 'settings';

interface TabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
  agentBadge?: number;
  chatBadge?: number;
}

interface TabItem {
  name: TabName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { name: 'agents', label: 'Agents', icon: 'people-outline', iconActive: 'people' },
  { name: 'chats', label: 'Chats', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { name: 'hub', label: 'Hub', icon: 'grid-outline', iconActive: 'grid' },
  { name: 'settings', label: 'Settings', icon: 'cog-outline', iconActive: 'cog' },
];

export function TabBar({ activeTab, onTabPress, agentBadge, chatBadge }: TabBarProps) {
  const { theme } = useTheme();

  const getBadge = (tab: TabName) => {
    if (tab === 'agents' && agentBadge) return agentBadge;
    if (tab === 'chats' && chatBadge) return chatBadge;
    return 0;
  };

  const handlePress = async (tab: TabName) => {
    if (tab !== activeTab) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabPress(tab);
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.tabBar || theme.background,
      borderTopColor: theme.tabBarBorder || theme.border,
    }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.name;
        const badge = getBadge(tab.name);
        const activeColor = theme.tabActive || theme.primary;
        const inactiveColor = theme.tabInactive || theme.textSecondary;
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handlePress(tab.name)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={24}
                color={isActive ? activeColor : inactiveColor}
              />
              {badge > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
                  <Text style={styles.badgeText}>
                    {badge > 99 ? '99+' : badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.label,
              { 
                color: isActive ? activeColor : inactiveColor,
                fontWeight: isActive ? '600' : '500',
              }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    letterSpacing: -0.2,
  },
});
