/**
 * FolderTabs Component
 * 
 * 텔레그램 스타일 폴더 탭 바
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { ChatFolder } from '../types/folders';
import { loadFolders, getFolderUnreadCounts } from '../services/FolderService';
import { spacing, fontSize, borderRadius } from '../theme';

interface FolderTabsProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onEditFolders?: () => void;
}

export function FolderTabs({
  selectedFolderId,
  onSelectFolder,
  onEditFolders,
}: FolderTabsProps) {
  const { theme } = useTheme();
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [tabWidths, setTabWidths] = useState<Record<string, number>>({});
  
  const scrollRef = useRef<ScrollView>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // 선택된 탭으로 인디케이터 애니메이션
    animateIndicator();
  }, [selectedFolderId, tabWidths]);

  const loadData = async () => {
    const [loadedFolders, counts] = await Promise.all([
      loadFolders(),
      getFolderUnreadCounts(),
    ]);
    setFolders(loadedFolders);
    setUnreadCounts(counts);
    
    // 첫 번째 폴더 선택
    if (!selectedFolderId && loadedFolders.length > 0) {
      onSelectFolder(loadedFolders[0].id);
    }
  };

  const animateIndicator = () => {
    if (!selectedFolderId) return;
    
    let offsetX = 0;
    for (const folder of folders) {
      if (folder.id === selectedFolderId) {
        break;
      }
      offsetX += tabWidths[folder.id] || 0;
    }
    
    const width = tabWidths[selectedFolderId] || 0;
    
    Animated.parallel([
      Animated.spring(indicatorAnim, {
        toValue: offsetX,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.spring(indicatorWidth, {
        toValue: width,
        useNativeDriver: false,
        tension: 100,
        friction: 10,
      }),
    ]).start();
  };

  const handleTabLayout = (folderId: string, event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTabWidths(prev => ({ ...prev, [folderId]: width }));
  };

  const handleTabPress = (folder: ChatFolder) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectFolder(folder.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {folders.map((folder, index) => {
          const isSelected = folder.id === selectedFolderId;
          const unread = unreadCounts[folder.id] || 0;
          
          return (
            <TouchableOpacity
              key={folder.id}
              onPress={() => handleTabPress(folder)}
              onLayout={(e) => handleTabLayout(folder.id, e)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Text style={styles.tabEmoji}>{folder.emoji}</Text>
              <Text
                style={[
                  styles.tabText,
                  { color: isSelected ? theme.primary : theme.textSecondary },
                  isSelected && styles.tabTextSelected,
                ]}
              >
                {folder.name}
              </Text>
              {unread > 0 && (
                <View style={[styles.badge, { backgroundColor: folder.color }]}>
                  <Text style={styles.badgeText}>
                    {unread > 99 ? '99+' : unread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        
        {/* Edit Folders 버튼 */}
        {onEditFolders && (
          <TouchableOpacity
            onPress={onEditFolders}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* 선택 인디케이터 */}
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.primary,
            transform: [{ translateX: indicatorAnim }],
            width: indicatorWidth,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  tabTextSelected: {
    fontWeight: '600',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  editButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
