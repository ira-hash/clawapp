/**
 * Chat Screen
 * 
 * Main chat interface for communicating with Clawdbot agent
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble, ChatInput } from '../../components/chat';
import { gateway } from '../../services/gateway';
import { clearSession } from '../../services/pairing';
import { Message, WSMessage } from '../../types';

interface ChatScreenProps {
  onDisconnect: () => void;
}

export function ChatScreen({ onDisconnect }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Subscribe to connection changes
    const unsubConnection = gateway.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Subscribe to messages
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
            codeBlocks: wsMessage.payload.codeBlocks,
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
        // Handle streaming response - update last assistant message
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant' && lastMsg.status === 'streaming') {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + wsMessage.payload.delta }
            ];
          } else {
            // Start new streaming message
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

      case 'buttons':
        // Update last message with buttons
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, metadata: { ...lastMsg.metadata, buttons: wsMessage.payload.buttons } }
            ];
          }
          return prev;
        });
        break;

      case 'error':
        console.error('Gateway error:', wsMessage.payload);
        break;
    }
  }, []);

  const handleSend = (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      status: 'sending',
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
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} onButtonPress={handleButtonPress} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
        <Text style={styles.headerTitle}>Clawdbot</Text>
      </View>
      <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectButton}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping && !isThinking) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          {isThinking ? (
            <Text style={styles.thinkingText}>🤔 Thinking...</Text>
          ) : (
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🦞</Text>
      <Text style={styles.emptyTitle}>Connected!</Text>
      <Text style={styles.emptyText}>
        Start chatting with your Clawdbot agent
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {!isConnected && (
        <View style={styles.reconnectBanner}>
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
          messages.length === 0 && styles.emptyMessageList
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={scrollToBottom}
      />

      <ChatInput onSend={handleSend} disabled={!isConnected} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFF',
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
    color: '#1A1A1A',
  },
  disconnectButton: {
    padding: 4,
  },
  reconnectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
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
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  typingContainer: {
    marginVertical: 4,
    marginHorizontal: 12,
    alignItems: 'flex-start',
  },
  typingBubble: {
    backgroundColor: '#E9E9EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  thinkingText: {
    fontSize: 14,
    color: '#8E8E93',
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
    backgroundColor: '#8E8E93',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});
