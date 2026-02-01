/**
 * Claw - Clawdbot Native App
 * 
 * Multi-agent, multi-room chat client for Clawdbot
 * 
 * Navigation: Agents → Rooms → Chat
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Screens
import { AgentListScreen } from './src/app/agents/AgentListScreen';
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

type Screen = 'loading' | 'agents' | 'pairing' | 'rooms' | 'chat';

// Agent emojis for selection
const AGENT_EMOJIS = ['🤖', '🦞', '🐙', '🦊', '🐳', '🦄', '🐲', '🌟', '💎', '🚀'];

function AppContent() {
  const { theme, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<StoredAgent | null>(null);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);

  // Load agents on mount
  useEffect(() => {
    loadAgents().then((saved) => {
      setAgents(saved);
      setCurrentScreen('agents');
    });
  }, []);

  // Handle agent selection
  const handleSelectAgent = useCallback(async (agent: StoredAgent) => {
    setCurrentAgent(agent);
    
    // Connect to gateway
    try {
      await gateway.connect(agent.gateway);
      await updateAgent(agent.id, { lastActiveAt: Date.now() });
      setCurrentScreen('rooms');
    } catch (error) {
      console.error('Failed to connect:', error);
      // Still go to rooms, will show disconnected state
      setCurrentScreen('rooms');
    }
  }, []);

  // Handle new agent added via pairing
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

  // Handle back from rooms to agents
  const handleBackToAgents = useCallback(() => {
    gateway.disconnect();
    setCurrentAgent(null);
    setCurrentRoom(null);
    setCurrentScreen('agents');
  }, []);

  // Handle cancel pairing
  const handleCancelPairing = useCallback(() => {
    setCurrentScreen('agents');
  }, []);

  // Refresh agents list
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

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
      {currentScreen === 'agents' && (
        <AgentListScreen
          onSelectAgent={handleSelectAgent}
          onAddAgent={() => setCurrentScreen('pairing')}
          onOpenSettings={() => {/* TODO: settings */}}
        />
      )}
      
      {currentScreen === 'pairing' && (
        <PairingScreen
          onPaired={handleAgentPaired}
          onCancel={handleCancelPairing}
          showCancel={agents.length > 0}
        />
      )}
      
      {currentScreen === 'rooms' && currentAgent && (
        <RoomListScreen
          agentId={currentAgent.id}
          agentName={currentAgent.name}
          agentEmoji={currentAgent.emoji}
          onSelectRoom={handleSelectRoom}
          onBack={handleBackToAgents}
        />
      )}
      
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
