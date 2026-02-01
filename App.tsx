/**
 * Claw - Clawdbot Native App
 * 
 * Main application entry point
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PairingScreen } from './src/app/auth/PairingScreen';
import { ChatScreen } from './src/app/chat/ChatScreen';
import { loadSession } from './src/services/pairing';
import { gateway } from './src/services/gateway';

type AppState = 'loading' | 'pairing' | 'chat';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const session = await loadSession();
      
      if (session) {
        // Try to reconnect with saved session
        const connected = await gateway.connect(session);
        if (connected) {
          setAppState('chat');
          return;
        }
      }
      
      // No valid session, show pairing
      setAppState('pairing');
    } catch (error) {
      console.error('Session check error:', error);
      setAppState('pairing');
    }
  };

  const handlePaired = () => {
    setAppState('chat');
  };

  const handleDisconnect = () => {
    setAppState('pairing');
  };

  if (appState === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (appState === 'pairing') {
    return (
      <>
        <PairingScreen onPaired={handlePaired} />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <>
      <ChatScreen onDisconnect={handleDisconnect} />
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});
