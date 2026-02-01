/**
 * Claw - Clawdbot Native App
 * 
 * Main application entry point with navigation
 * Supports multiple chat rooms per agent connection
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Screens
import { PairingScreen } from './src/app/auth/PairingScreen';
import { RoomListScreen } from './src/app/rooms/RoomListScreen';
import { ChatScreen } from './src/app/chat/ChatScreen';

// Services
import { gateway } from './src/services/gateway';
import { loadSession, saveSession, clearSession } from './src/services/pairing';
import { updateRoom, loadRooms } from './src/services/storage';

// Types
import { GatewayConfig, ChatRoom } from './src/types';

type Screen = 'loading' | 'pairing' | 'rooms' | 'chat';

function AppContent() {
  const { theme, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [agentName, setAgentName] = useState<string>('Clawdbot');
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    loadSession().then((saved) => {
      if (saved) {
        setConfig(saved.config);
        setAgentName(saved.name || 'Clawdbot');
        // Auto-connect
        gateway.connect(saved.config)
          .then(() => setCurrentScreen('rooms'))
          .catch(() => setCurrentScreen('pairing'));
      } else {
        setCurrentScreen('pairing');
      }
    });
  }, []);

  // Handle successful pairing
  const handlePaired = useCallback(async (newConfig: GatewayConfig, name?: string) => {
    setConfig(newConfig);
    setAgentName(name || 'Clawdbot');
    await saveSession(newConfig, name);
    setCurrentScreen('rooms');
  }, []);

  // Handle room selection
  const handleSelectRoom = useCallback((room: ChatRoom) => {
    setCurrentRoom(room);
    gateway.setCurrentRoom(room.id);
    setCurrentScreen('chat');
  }, []);

  // Handle back from chat to room list
  const handleBackToRooms = useCallback(async () => {
    // Update last message preview in room
    if (currentRoom) {
      const rooms = await loadRooms();
      const updated = rooms.find(r => r.id === currentRoom.id);
      if (updated) {
        await updateRoom(currentRoom.id, { lastMessageAt: Date.now() });
      }
    }
    gateway.setCurrentRoom(null);
    setCurrentRoom(null);
    setCurrentScreen('rooms');
  }, [currentRoom]);

  // Handle full disconnect
  const handleDisconnect = useCallback(async () => {
    gateway.disconnect();
    await clearSession();
    setConfig(null);
    setCurrentRoom(null);
    setCurrentScreen('pairing');
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
      {currentScreen === 'pairing' && (
        <PairingScreen onPaired={handlePaired} />
      )}
      
      {currentScreen === 'rooms' && (
        <RoomListScreen
          agentName={agentName}
          onSelectRoom={handleSelectRoom}
          onDisconnect={handleDisconnect}
        />
      )}
      
      {currentScreen === 'chat' && currentRoom && (
        <ChatScreen
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
