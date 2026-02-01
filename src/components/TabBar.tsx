/**
 * Bottom Tab Bar Component
 * 
 * 메신저 스타일 하단 네비게이션
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
  { name: 'settings', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

export function TabBar({ activeTab, onTabPress, agentBadge, chatBadge }: TabBarProps) {
  const { theme } = useTheme();

  const getBadge = (tab: TabName) => {
    if (tab === 'agents' && agentBadge) return agentBadge;
    if (tab === 'chats' && chatBadge) return chatBadge;
    return 0;
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.background,
      borderTopColor: theme.border 
    }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.name;
        const badge = getBadge(tab.name);
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={24}
                color={isActive ? theme.primary : theme.textSecondary}
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
              { color: isActive ? theme.primary : theme.textSecondary }
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
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
});
