/**
 * Chat Screen
 * 
 * Main chat interface for communicating with Clawdbot agent
 * Features:
 * - Message history persistence
 * - Dark mode support
 * - Image sending
 * - Message copy (long press)
 * - Proper keyboard handling
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble, ChatInput } from '../../components/chat';
import { gateway } from '../../services/gateway';
import { clearSession } from '../../services/pairing';
import { saveMessages, loadMessages } from '../../services/storage';
import { useTheme } from '../../contexts/ThemeContext';
import { Message, WSMessage } from '../../types';

interface ChatScreenProps {
  agentId?: string;
  agentName?: string;
  onDisconnect: () => void;
}

export function ChatScreen({ agentId = 'default', agentName = 'Clawdbot', onDisconnect }: ChatScreenProps) {
  const { theme, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Load message history on mount
  useEffect(() => {
    loadMessages(agentId).then((savedMessages) => {
      setMessages(savedMessages);
      setIsLoading(false);
    });
  }, [agentId]);

  // Save messages when they change
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      saveMessages(agentId, messages);
    }
  }, [messages, agentId, isLoading]);

  // Subscribe to gateway events
  useEffect(() => {
    const unsubConnection = gateway.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    const unsubMessages = gateway.onMessage((wsMessage: WSMessage) => {
      handleWSMessage(wsMessage);
    });

    return () => {
      unsubConnection();
      unsubMessages();
    };
  }, []);

  const handleWSMessage = useCallback((wsMessage: WSMessage) => {
    switch (wsMessage.type) {
      case 'message':
        const newMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: wsMessage.payload.content || wsMessage.payload.text || '',
          timestamp: Date.now(),
          metadata: {
            buttons: wsMessage.payload.buttons,
            media: wsMessage.payload.media,
          },
        };
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
        setIsThinking(false);
        break;

      case 'typing':
        setIsTyping(wsMessage.payload.isTyping ?? true);
        break;

      case 'thinking':
        setIsThinking(wsMessage.payload.isThinking ?? true);
        break;

      case 'stream':
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant' && lastMsg.status === 'streaming') {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + wsMessage.payload.delta }
            ];
          } else {
            return [...prev, {
              id: Date.now().toString(),
              role: 'assistant' as const,
              content: wsMessage.payload.delta || '',
              timestamp: Date.now(),
              status: 'streaming' as const,
            }];
          }
        });
        break;

      case 'error':
        console.error('Gateway error:', wsMessage.payload);
        break;
    }
  }, []);

  const handleSend = (text: string, image?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      status: 'sending',
      metadata: image ? { media: image } : undefined,
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to gateway
    gateway.sendMessage(text);

    // Update status
    setMessages(prev => 
      prev.map(m => m.id === userMessage.id ? { ...m, status: 'sent' } : m)
    );
  };

  const handleButtonPress = (callbackData: string) => {
    gateway.sendButtonCallback(callbackData);
  };

  const handleDisconnect = async () => {
    gateway.disconnect();
    await clearSession();
    onDisconnect();
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} onButtonPress={handleButtonPress} />
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View style={styles.headerLeft}>
        <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>🦞 {agentName}</Text>
      </View>
      <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectButton}>
        <Ionicons name="log-out-outline" size={24} color={theme.error} />
      </TouchableOpacity>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping && !isThinking) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={[styles.typingBubble, { backgroundColor: theme.messageBubbleAssistant }]}>
          {isThinking ? (
            <Text style={[styles.thinkingText, { color: theme.textSecondary }]}>🤔 Thinking...</Text>
          ) : (
            <View style={styles.typingDots}>
              <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
              <View style={[styles.dot, { backgroundColor: theme.textSecondary, opacity: 0.7 }]} />
              <View style={[styles.dot, { backgroundColor: theme.textSecondary, opacity: 0.4 }]} />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🦞</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Connected!</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Start chatting with your Clawdbot agent
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {renderHeader()}
      
      {!isConnected && (
        <View style={[styles.reconnectBanner, { backgroundColor: theme.warning }]}>
          <ActivityIndicator size="small" color="#FFF" />
          <Text style={styles.reconnectText}>Reconnecting...</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.messageList,
          messages.length === 0 && styles.emptyMessageList,
          { backgroundColor: theme.background }
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={scrollToBottom}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      <ChatInput onSend={handleSend} disabled={!isConnected} />
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 + 12 : 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#34C759',
  },
  disconnected: {
    backgroundColor: '#FF3B30',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  disconnectButton: {
    padding: 4,
  },
  reconnectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  reconnectText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  messageList: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyMessageList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  typingContainer: {
    marginVertical: 4,
    marginHorizontal: 12,
    alignItems: 'flex-start',
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  thinkingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
