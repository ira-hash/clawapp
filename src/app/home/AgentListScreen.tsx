/**
 * Agent List Screen (Home)
 * 
 * Telegram-style list of registered agents
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgentListItem } from '../../components/AgentListItem';
import { Agent } from '../../types';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

interface AgentListScreenProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onAddAgent: () => void;
  onOpenHub: () => void;
  onOpenSettings: () => void;
  onDeleteAgent?: (agentId: string) => void;
}

export function AgentListScreen({
  agents,
  onSelectAgent,
  onAddAgent,
  onOpenHub,
  onOpenSettings,
  onDeleteAgent,
}: AgentListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLongPress = (agent: Agent) => {
    Alert.alert(
      agent.name,
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeleteAgent?.(agent.id)
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>🦞 Claw</Text>
      <TouchableOpacity onPress={onOpenSettings} style={styles.headerButton}>
        <Ionicons name="settings-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.gray500} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search agents..."
          placeholderTextColor={colors.gray500}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.gray400} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🦞</Text>
      <Text style={styles.emptyTitle}>No Agents Yet</Text>
      <Text style={styles.emptyText}>
        Add your first Clawdbot agent to get started
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAddAgent}>
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.emptyButtonText}>Add Agent</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={onAddAgent}>
      <Ionicons name="add" size={24} color="#FFF" />
    </TouchableOpacity>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity style={[styles.tab, styles.tabActive]}>
        <Ionicons name="chatbubbles" size={24} color={colors.primary} />
        <Text style={[styles.tabText, styles.tabTextActive]}>Chats</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.tab} onPress={onOpenHub}>
        <Ionicons name="cube-outline" size={24} color={colors.gray500} />
        <Text style={styles.tabText}>Hub</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.tab} onPress={onOpenSettings}>
        <Ionicons name="settings-outline" size={24} color={colors.gray500} />
        <Text style={styles.tabText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      
      <FlatList
        data={filteredAgents}
        renderItem={({ item }) => (
          <AgentListItem
            agent={item}
            onPress={() => onSelectAgent(item)}
            onLongPress={() => handleLongPress(item)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={agents.length === 0 ? styles.emptyListContainer : undefined}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {agents.length > 0 && renderAddButton()}
      {renderTabBar()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  headerButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.light.text,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray200,
    marginLeft: 86, // avatar (54) + margin (16) + padding (16)
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.light.tabBar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray200,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabActive: {},
  tabText: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  tabTextActive: {
    color: colors.primary,
  },
});
