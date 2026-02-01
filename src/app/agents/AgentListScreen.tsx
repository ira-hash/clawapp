/**
 * Agent List Screen
 * 
 * Shows all registered Clawdbot agents
 * Entry point of the app
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { StoredAgent, loadAgents, deleteAgent } from '../../services/storage';
import { spacing, fontSize, borderRadius } from '../../theme';

interface AgentListScreenProps {
  onSelectAgent: (agent: StoredAgent) => void;
  onAddAgent: () => void;
  onOpenSettings: () => void;
}

export function AgentListScreen({ onSelectAgent, onAddAgent, onOpenSettings }: AgentListScreenProps) {
  const { theme, isDark } = useTheme();
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load agents on mount
  useEffect(() => {
    loadAgents().then((saved) => {
      setAgents(saved);
      setIsLoading(false);
    });
  }, []);

  // Reload agents when screen is focused (after adding new one)
  const reloadAgents = useCallback(async () => {
    const saved = await loadAgents();
    setAgents(saved);
  }, []);

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
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

  const renderAgent = ({ item }: { item: StoredAgent }) => (
    <TouchableOpacity
      style={[styles.agentItem, { backgroundColor: theme.surfaceElevated }]}
      onPress={() => onSelectAgent(item)}
      onLongPress={() => handleDeleteAgent(item.id, item.name)}
      delayLongPress={500}
    >
      <View style={[styles.agentEmoji, { backgroundColor: theme.primary + '20' }]}>
        <Text style={styles.emojiText}>{item.emoji}</Text>
      </View>
      <View style={styles.agentInfo}>
        <Text style={[styles.agentName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.agentUrl, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.gateway.url.replace('wss://', '').replace('ws://', '').split('/')[0]}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View style={styles.headerLeft}>
        <Text style={[styles.logo, { color: theme.text }]}>🦞 Claw</Text>
      </View>
      <TouchableOpacity onPress={onOpenSettings} style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={24} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🦞</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Agents Yet</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Add your first Clawdbot agent to get started
      </Text>
      <TouchableOpacity 
        style={[styles.addFirstButton, { backgroundColor: theme.primary }]}
        onPress={onAddAgent}
      >
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.addFirstButtonText}>Add Agent</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddButton = () => (
    <TouchableOpacity
      style={[styles.addButton, { backgroundColor: theme.primary }]}
      onPress={onAddAgent}
    >
      <Ionicons name="add" size={28} color="#FFF" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {renderHeader()}
      
      <FlatList
        data={agents}
        renderItem={renderAgent}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          agents.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ListHeaderComponent={
          agents.length > 0 ? (
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              YOUR AGENTS
            </Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        onRefresh={reloadAgents}
        refreshing={false}
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
  },
  settingsButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
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
  },
  agentEmoji: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 28,
  },
  agentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  agentName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  agentUrl: {
    fontSize: fontSize.sm,
    marginTop: 2,
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
  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
