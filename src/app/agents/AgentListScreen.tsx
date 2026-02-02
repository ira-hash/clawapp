/**
 * Agent List Screen
 * 
 * 텔레그램 스타일 에이전트 목록
 * Features:
 * - 에이전트 카드 디자인
 * - 스와이프 삭제
 * - 검색 기능
 * - 애니메이션
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  TextInput,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { StoredAgent, loadAgents, deleteAgent } from '../../services/storage';
import { spacing, fontSize, borderRadius, shadows } from '../../theme';

interface AgentListScreenProps {
  onSelectAgent: (agent: StoredAgent) => void;
  onAddAgent: () => void;
  onOpenSettings: () => void;
}

export function AgentListScreen({ onSelectAgent, onAddAgent, onOpenSettings }: AgentListScreenProps) {
  const { theme, isDark } = useTheme();
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<StoredAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const searchInputRef = useRef<TextInput>(null);
  const fabScale = useRef(new Animated.Value(0)).current;

  // Load agents on mount
  useEffect(() => {
    loadAgents().then((saved) => {
      setAgents(saved);
      setFilteredAgents(saved);
      setIsLoading(false);
      
      // Animate FAB in
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
        delay: 300,
      }).start();
    });
  }, [fabScale]);

  // Filter agents when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAgents(agents);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAgents(
        agents.filter(a => 
          a.name.toLowerCase().includes(query) ||
          a.gateway.url.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, agents]);

  const reloadAgents = useCallback(async () => {
    setRefreshing(true);
    const saved = await loadAgents();
    setAgents(saved);
    setFilteredAgents(saved);
    setRefreshing(false);
  }, []);

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Delete Agent',
      `Are you sure you want to remove "${agentName}"? All chat rooms and messages will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await deleteAgent(agentId);
            setAgents(agents.filter(a => a.id !== agentId));
          },
        },
      ]
    );
  };

  const handleAddPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Bounce animation
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.9, duration: 50, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();
    
    onAddAgent();
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

  const renderAgent = ({ item, index }: { item: StoredAgent; index: number }) => {
    const delay = index * 50;
    
    return (
      <Animated.View
        style={{
          opacity: 1,
          transform: [{ translateY: 0 }],
        }}
      >
        <TouchableOpacity
          style={[styles.agentItem, { backgroundColor: theme.surfaceElevated }]}
          onPress={() => onSelectAgent(item)}
          onLongPress={() => handleDeleteAgent(item.id, item.name)}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <View style={[styles.agentEmoji, { backgroundColor: theme.primary + '15' }]}>
            <Text style={styles.emojiText}>{item.emoji}</Text>
          </View>
          <View style={styles.agentInfo}>
            <Text style={[styles.agentName, { color: theme.text }]}>{item.name}</Text>
            <View style={styles.agentMeta}>
              <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.agentUrl, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.gateway.url.replace('wss://', '').replace('ws://', '').split('/')[0]}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View style={styles.headerLeft}>
        <Text style={[styles.logo, { color: theme.text }]}>🦞 Claw</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={toggleSearch} style={styles.headerButton}>
          <Ionicons 
            name={showSearch ? "close" : "search"} 
            size={22} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenSettings} style={styles.headerButton}>
          <Ionicons name="settings-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => {
    if (!showSearch) return null;
    
    return (
      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.surface }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search agents..."
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🦞</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {searchQuery ? 'No Results' : 'No Agents Yet'}
      </Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {searchQuery 
          ? `No agents found for "${searchQuery}"`
          : 'Add your first Clawdbot agent to get started'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity 
          style={[styles.addFirstButton, { backgroundColor: theme.primary }]}
          onPress={onAddAgent}
        >
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addFirstButtonText}>Add Agent</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAddButton = () => (
    <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }, shadows.lg]}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {renderHeader()}
      {renderSearchBar()}
      
      <FlatList
        data={filteredAgents}
        renderItem={renderAgent}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredAgents.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListHeaderComponent={
          filteredAgents.length > 0 ? (
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {searchQuery ? 'SEARCH RESULTS' : 'YOUR AGENTS'}
            </Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={reloadAgents}
            tintColor={theme.primary}
          />
        }
      />

      {agents.length > 0 && renderAddButton()}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: 4,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  agentEmoji: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
  agentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  agentName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  agentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  agentUrl: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  addFirstButtonText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
