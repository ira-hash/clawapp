/**
 * Chat Screen
 * 
 * Main chat interface for communicating with Clawdbot agent
 * Features:
 * - Room-based message isolation
 * - Message history persistence
 * - Dark mode support
 * - Image sending
 * - Message copy (long press)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { MessageBubble, ChatInput, SwipeableMessage, ReplyPreview, ScrollToBottomButton, TypingIndicator, ChatHeader, SearchBar, AgentProfileModal, PinnedBanner, TranslateButton, PinButton } from '../../components/chat';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { gateway } from '../../services/gateway';
import { saveMessages, loadMessages, updateRoom } from '../../services/storage';
import { loadTranslationSettings } from '../../services/TranslationService';
import { getPinnedMessagesForRoom } from '../../services/PinnedService';
import { TranslationSettings, LanguageCode } from '../../types/translation';
import { PinnedMessage } from '../../types/pinned';

// Helper to truncate preview
import { useTheme } from '../../contexts/ThemeContext';
import { Message, WSMessage } from '../../types';

interface ChatScreenProps {
  agentId: string;
  roomId: string;
  roomName: string;
  roomEmoji: string;
  onBack: () => void;
}

export function ChatScreen({ agentId, roomId, roomName, roomEmoji, onBack }: ChatScreenProps) {
  const { theme, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [translationSettings, setTranslationSettings] = useState<TranslationSettings | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const contentHeight = useRef(0);
  const scrollOffset = useRef(0);

  // Load message history, translation settings, and pinned messages on mount
  useEffect(() => {
    const loadData = async () => {
      const [savedMessages, transSettings] = await Promise.all([
        loadMessages(roomId),
        loadTranslationSettings(),
      ]);
      setMessages(savedMessages);
      setTranslationSettings(transSettings);
      setPinnedMessages(getPinnedMessagesForRoom(roomId));
      setIsLoading(false);
    };
    
    loadData();
    
    // Set current room in gateway
    gateway.setCurrentRoom(roomId);
    
    return () => {
      gateway.setCurrentRoom(null);
    };
  }, [roomId]);

  // Save messages when they change
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      saveMessages(roomId, messages);
      
      // Update room's last message preview
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
        updateRoom(agentId, roomId, {
          lastMessage: lastMsg.content.slice(0, 50),
          lastMessageAt: lastMsg.timestamp,
        });
      }
    }
  }, [messages, roomId, isLoading]);

  // Subscribe to gateway events
  useEffect(() => {
    const unsubConnection = gateway.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    const unsubMessages = gateway.onMessage((wsMessage: WSMessage) => {
      // Only process messages for this room
      if (wsMessage.sessionKey && wsMessage.sessionKey !== roomId) {
        return;
      }
      handleWSMessage(wsMessage);
    });

    return () => {
      unsubConnection();
      unsubMessages();
    };
  }, [roomId]);

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
    // Build message content with reply context if present
    let content = text;
    let metadata: Message['metadata'] = image ? { media: image } : undefined;
    
    if (replyTo) {
      metadata = {
        ...metadata,
        replyTo: {
          id: replyTo.id,
          content: replyTo.content.slice(0, 100),
          role: replyTo.role,
        },
      };
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      status: 'sending',
      metadata,
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to gateway with room ID
    gateway.sendMessage(text, roomId);

    // Clear reply state
    setReplyTo(null);

    // Update status
    setMessages(prev => 
      prev.map(m => m.id === userMessage.id ? { ...m, status: 'sent' } : m)
    );
  };

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    scrollOffset.current = contentOffset.y;
    contentHeight.current = contentSize.height;
    
    // Show button if scrolled up more than 200px from bottom
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    setShowScrollButton(distanceFromBottom > 200);
  }, []);

  const handleScrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Reload messages from storage
    const savedMessages = await loadMessages(roomId);
    setMessages(savedMessages);
    setIsRefreshing(false);
  }, [roomId]);

  // Search functionality
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      setSearchIndex(0);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results: number[] = [];
    messages.forEach((msg, index) => {
      if (msg.content.toLowerCase().includes(lowerQuery)) {
        results.push(index);
      }
    });
    setSearchResults(results);
    setSearchIndex(0);
    
    // Scroll to first result
    if (results.length > 0) {
      flatListRef.current?.scrollToIndex({ index: results[0], animated: true });
    }
  }, [messages]);

  const handleSearchPrev = useCallback(() => {
    if (searchResults.length === 0) return;
    const newIndex = (searchIndex - 1 + searchResults.length) % searchResults.length;
    setSearchIndex(newIndex);
    flatListRef.current?.scrollToIndex({ index: searchResults[newIndex], animated: true });
  }, [searchResults, searchIndex]);

  const handleSearchNext = useCallback(() => {
    if (searchResults.length === 0) return;
    const newIndex = (searchIndex + 1) % searchResults.length;
    setSearchIndex(newIndex);
    flatListRef.current?.scrollToIndex({ index: searchResults[newIndex], animated: true });
  }, [searchResults, searchIndex]);

  const handleSearchClose = useCallback(() => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchIndex(0);
  }, []);

  const handleButtonPress = (callbackData: string) => {
    gateway.sendButtonCallback(callbackData, roomId);
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
    <SwipeableMessage message={item} onReply={handleReply} onDelete={handleDeleteMessage}>
      <View>
        <MessageBubble message={item} onButtonPress={handleButtonPress} />
        {/* Message actions row */}
        <View style={styles.messageActions}>
          {/* Translation button for assistant messages */}
          {item.role === 'assistant' && translationSettings?.enabled && (
            <TranslateButton
              messageId={item.id}
              text={item.content}
              targetLanguage={translationSettings.targetLanguage as LanguageCode}
              compact
            />
          )}
          {/* Pin button */}
          <PinButton
            messageId={item.id}
            roomId={roomId}
            agentId={agentId}
            content={item.content.slice(0, 200)}
            onPinChange={refreshPinnedMessages}
            size={16}
          />
        </View>
      </View>
    </SwipeableMessage>
  );

  const handleClearHistory = useCallback(async () => {
    setMessages([]);
    await saveMessages(roomId, []);
  }, [roomId]);

  const handleDeleteMessage = useCallback((message: Message) => {
    setMessages(prev => prev.filter(m => m.id !== message.id));
  }, []);

  // Handle pinned message press - scroll to that message
  const handlePinnedPress = useCallback((pinned: PinnedMessage) => {
    const messageIndex = messages.findIndex(m => m.id === pinned.messageId);
    if (messageIndex !== -1) {
      flatListRef.current?.scrollToIndex({ index: messageIndex, animated: true });
    }
  }, [messages]);

  // Refresh pinned messages
  const refreshPinnedMessages = useCallback(() => {
    setPinnedMessages(getPinnedMessagesForRoom(roomId));
  }, [roomId]);

  const renderHeader = () => (
    <ChatHeader
      title={roomName}
      emoji={roomEmoji}
      isConnected={isConnected}
      isTyping={isTyping}
      isThinking={isThinking}
      onBack={onBack}
      onSearchPress={() => setShowSearch(true)}
      onTitlePress={() => setShowProfile(true)}
    />
  );

  const renderTypingIndicator = () => (
    <TypingIndicator isTyping={isTyping} isThinking={isThinking} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{roomEmoji}</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{roomName}</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Start a conversation in this room
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {renderHeader()}

        {/* Pinned Messages Banner */}
        <PinnedBanner
          roomId={roomId}
          onPress={handlePinnedPress}
        />

        <SearchBar
          visible={showSearch}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onClose={handleSearchClose}
          resultCount={searchResults.length}
          currentIndex={searchIndex}
          onPrevious={handleSearchPrev}
          onNext={handleSearchNext}
        />
        
        {!isConnected && (
          <View style={[styles.reconnectBanner, { backgroundColor: theme.warning }]}>
            <ActivityIndicator size="small" color="#FFF" />
            <Text style={styles.reconnectText}>Reconnecting...</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
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
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            }
          />
          
          <ScrollToBottomButton
            visible={showScrollButton}
            onPress={handleScrollToBottom}
          />
        </View>

        {replyTo && (
          <ReplyPreview message={replyTo} onCancel={() => setReplyTo(null)} />
        )}
        <ChatInput onSend={handleSend} disabled={!isConnected} />

        <AgentProfileModal
          visible={showProfile}
          onClose={() => setShowProfile(false)}
          name={roomName}
          emoji={roomEmoji}
          isConnected={isConnected}
          messageCount={messages.length}
          onClearHistory={handleClearHistory}
        />
      </SafeAreaView>
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
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 8,
    opacity: 0.6,
  },
});
