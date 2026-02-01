/**
 * Claw - Clawdbot Native App
 * 
 * Multi-agent, multi-room chat client for Clawdbot
 * 메신저 스타일 탭 네비게이션
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Components
import { TabBar, TabName } from './src/components/TabBar';

// Screens
import { AgentListScreen } from './src/app/agents/AgentListScreen';
import { ChatsScreen } from './src/app/chats/ChatsScreen';
import { HubScreen } from './src/app/hub/HubScreen';
import { SettingsScreen } from './src/app/settings/SettingsScreen';
import { PairingScreen } from './src/app/auth/PairingScreen';
import { RoomListScreen } from './src/app/rooms/RoomListScreen';
import { ChatScreen } from './src/app/chat/ChatScreen';

// Services
import { gateway } from './src/services/gateway';
import { 
  StoredAgent, 
  loadAgents, 
  addAgent, 
  updateAgent,
  updateRoom,
} from './src/services/storage';

// Types
import { GatewayConfig, ChatRoom } from './src/types';

type Screen = 'loading' | 'tabs' | 'pairing' | 'rooms' | 'chat';

const AGENT_EMOJIS = ['🤖', '🦞', '🐙', '🦊', '🐳', '🦄', '🐲', '🌟', '💎', '🚀'];

function AppContent() {
  const { theme, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const [activeTab, setActiveTab] = useState<TabName>('agents');
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<StoredAgent | null>(null);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);

  // Load agents on mount
  useEffect(() => {
    loadAgents().then((saved) => {
      setAgents(saved);
      setCurrentScreen('tabs');
    });
  }, []);

  // Handle agent selection from Agents tab
  const handleSelectAgent = useCallback(async (agent: StoredAgent) => {
    setCurrentAgent(agent);
    
    try {
      await gateway.connect(agent.gateway);
      await updateAgent(agent.id, { lastActiveAt: Date.now() });
    } catch (error) {
      console.error('Failed to connect:', error);
    }
    setCurrentScreen('rooms');
  }, []);

  // Handle chat selection from Chats tab
  const handleSelectChat = useCallback(async (agent: StoredAgent, room: ChatRoom) => {
    setCurrentAgent(agent);
    setCurrentRoom(room);
    
    try {
      await gateway.connect(agent.gateway);
      await updateAgent(agent.id, { lastActiveAt: Date.now() });
      gateway.setCurrentRoom(room.id);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
    setCurrentScreen('chat');
  }, []);

  // Handle new agent added
  const handleAgentPaired = useCallback(async (config: GatewayConfig, name?: string) => {
    const newAgent: StoredAgent = {
      id: `agent-${Date.now()}`,
      name: name || 'My Agent',
      emoji: AGENT_EMOJIS[Math.floor(Math.random() * AGENT_EMOJIS.length)],
      gateway: config,
      createdAt: Date.now(),
    };
    
    await addAgent(newAgent);
    setAgents(prev => [...prev, newAgent]);
    setCurrentAgent(newAgent);
    setCurrentScreen('rooms');
  }, []);

  // Handle room selection
  const handleSelectRoom = useCallback((room: ChatRoom) => {
    setCurrentRoom(room);
    gateway.setCurrentRoom(room.id);
    setCurrentScreen('chat');
  }, []);

  // Handle back from chat to rooms
  const handleBackToRooms = useCallback(async () => {
    if (currentAgent && currentRoom) {
      await updateRoom(currentAgent.id, currentRoom.id, { 
        lastMessageAt: Date.now() 
      });
    }
    gateway.setCurrentRoom(null);
    setCurrentRoom(null);
    setCurrentScreen('rooms');
  }, [currentAgent, currentRoom]);

  // Handle back from rooms to tabs
  const handleBackToTabs = useCallback(() => {
    gateway.disconnect();
    setCurrentAgent(null);
    setCurrentRoom(null);
    setCurrentScreen('tabs');
  }, []);

  // Handle cancel pairing
  const handleCancelPairing = useCallback(() => {
    setCurrentScreen('tabs');
  }, []);

  // Handle logout (clear all data)
  const handleLogout = useCallback(async () => {
    // TODO: Clear all data
    setAgents([]);
    setCurrentAgent(null);
    setCurrentRoom(null);
    setCurrentScreen('tabs');
  }, []);

  // Refresh agents
  const refreshAgents = useCallback(async () => {
    const saved = await loadAgents();
    setAgents(saved);
  }, []);

  // Loading state
  if (currentScreen === 'loading') {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'agents':
        return (
          <AgentListScreen
            onSelectAgent={handleSelectAgent}
            onAddAgent={() => setCurrentScreen('pairing')}
            onOpenSettings={() => setActiveTab('settings')}
          />
        );
      case 'chats':
        return <ChatsScreen onSelectChat={handleSelectChat} />;
      case 'hub':
        return <HubScreen />;
      case 'settings':
        return <SettingsScreen onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Main Tab View */}
      {currentScreen === 'tabs' && (
        <View style={styles.container}>
          {renderTabContent()}
          <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
      )}

      {/* Pairing Screen */}
      {currentScreen === 'pairing' && (
        <PairingScreen
          onPaired={handleAgentPaired}
          onCancel={handleCancelPairing}
          showCancel={true}
        />
      )}

      {/* Room List */}
      {currentScreen === 'rooms' && currentAgent && (
        <RoomListScreen
          agentId={currentAgent.id}
          agentName={currentAgent.name}
          agentEmoji={currentAgent.emoji}
          onSelectRoom={handleSelectRoom}
          onBack={handleBackToTabs}
        />
      )}

      {/* Chat Screen */}
      {currentScreen === 'chat' && currentAgent && currentRoom && (
        <ChatScreen
          agentId={currentAgent.id}
          roomId={currentRoom.id}
          roomName={currentRoom.name}
          roomEmoji={currentRoom.emoji}
          onBack={handleBackToRooms}
        />
      )}

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
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
