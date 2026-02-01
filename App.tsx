/**
 * Claw - Clawdbot Native App
 * 
 * Main application entry point with navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Screens
import { PairingScreen } from './src/app/auth/PairingScreen';
import { ChatScreen } from './src/app/chat/ChatScreen';

// Services
import { gateway } from './src/services/gateway';
import { loadSession, saveSession, clearSession } from './src/services/pairing';

// Types
import { GatewayConfig } from './src/types';

type Screen = 'loading' | 'pairing' | 'chat';

function AppContent() {
  const { theme, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [agentName, setAgentName] = useState<string>('Clawdbot');

  // Check for existing session on mount
  useEffect(() => {
    loadSession().then((saved) => {
      if (saved) {
        setConfig(saved.config);
        setAgentName(saved.name || 'Clawdbot');
        // Auto-connect
        gateway.connect(saved.config)
          .then(() => setCurrentScreen('chat'))
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
    setCurrentScreen('chat');
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    gateway.disconnect();
    await clearSession();
    setConfig(null);
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
      {currentScreen === 'pairing' ? (
        <PairingScreen onPaired={handlePaired} />
      ) : (
        <ChatScreen
          agentId={config?.agentId || 'default'}
          agentName={agentName}
          onDisconnect={handleDisconnect}
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
