/**
 * Claw - Clawdbot Native App
 * 
 * Main application entry point with navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import { PairingScreen } from './src/app/auth/PairingScreen';
import { ChatScreen } from './src/app/chat/ChatScreen';
import { AgentListScreen } from './src/app/home/AgentListScreen';
import { HubScreen } from './src/app/hub/HubScreen';
import { SettingsScreen } from './src/app/settings/SettingsScreen';

// Hooks & Services
import { useStorage } from './src/hooks';
import { useTheme } from './src/hooks/useTheme';
import { gateway } from './src/services/gateway';

// Types
import { Agent, GatewayConfig } from './src/types';
import { colors } from './src/theme';

type Screen = 'loading' | 'agentList' | 'pairing' | 'chat' | 'hub' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const {
    agents,
    settings,
    isLoading,
    addAgent,
    updateAgent,
    removeAgent,
    addMessage,
    getMessages,
    updateSettings,
    clearAll,
  } = useStorage();

  const { theme, isDark } = useTheme(settings);

  // Initial load
  useEffect(() => {
    if (!isLoading) {
      // If no agents, show pairing screen, otherwise show agent list
      setCurrentScreen(agents.length === 0 ? 'pairing' : 'agentList');
    }
  }, [isLoading, agents.length]);

  // Handle successful pairing
  const handlePaired = useCallback(async (config: GatewayConfig, agentName?: string) => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: agentName || 'My Agent',
      emoji: '🤖',
      gateway: config,
      unreadCount: 0,
      isOnline: true,
      createdAt: Date.now(),
    };
    
    await addAgent(newAgent);
    setSelectedAgent(newAgent);
    setCurrentScreen('chat');
  }, [addAgent]);

  // Handle agent selection
  const handleSelectAgent = useCallback(async (agent: Agent) => {
    setSelectedAgent(agent);
    
    // Connect to gateway
    try {
      await gateway.connect(agent.gateway);
      await updateAgent(agent.id, { isOnline: true });
    } catch (error) {
      console.error('Failed to connect:', error);
      await updateAgent(agent.id, { isOnline: false });
    }
    
    setCurrentScreen('chat');
  }, [updateAgent]);

  // Handle delete agent
  const handleDeleteAgent = useCallback(async (agentId: string) => {
    await removeAgent(agentId);
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
      gateway.disconnect();
    }
  }, [removeAgent, selectedAgent]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    gateway.disconnect();
    await clearAll();
    setSelectedAgent(null);
    setCurrentScreen('pairing');
  }, [clearAll]);

  // Handle back from chat
  const handleBackFromChat = useCallback(() => {
    gateway.disconnect();
    setSelectedAgent(null);
    setCurrentScreen('agentList');
  }, []);

  // Loading state
  if (currentScreen === 'loading' || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    );
  }

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'pairing':
        return (
          <PairingScreen 
            onPaired={() => {
              // After pairing, go to agent list (will show new agent)
              setCurrentScreen('agentList');
            }} 
          />
        );

      case 'agentList':
        return (
          <AgentListScreen
            agents={agents}
            onSelectAgent={handleSelectAgent}
            onAddAgent={() => setCurrentScreen('pairing')}
            onOpenHub={() => setCurrentScreen('hub')}
            onOpenSettings={() => setCurrentScreen('settings')}
            onDeleteAgent={handleDeleteAgent}
          />
        );

      case 'chat':
        if (!selectedAgent) {
          setCurrentScreen('agentList');
          return null;
        }
        return (
          <ChatScreen 
            onDisconnect={handleBackFromChat}
          />
        );

      case 'hub':
        return (
          <HubScreen onBack={() => setCurrentScreen('agentList')} />
        );

      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={updateSettings}
            onBack={() => setCurrentScreen('agentList')}
            onLogout={handleLogout}
          />
        );

      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {renderScreen()}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
