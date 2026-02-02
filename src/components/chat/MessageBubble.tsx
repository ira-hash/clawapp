/**
 * Message Bubble Component
 * 
 * Displays a single message with support for:
 * - User/Assistant styling
 * - Full markdown rendering
 * - Code blocks with copy
 * - Inline buttons
 * - Long press to copy
 * - Images
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
  onButtonPress?: (callbackData: string) => void;
  animated?: boolean;
}

export function MessageBubble({ message, onButtonPress, animated = true }: MessageBubbleProps) {
  const { theme, isDark } = useTheme();
  const isUser = message.role === 'user';
  const [imageError, setImageError] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  
  // Animation
  const slideAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(animated ? 0.95 : 1)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
      ]).start();
    }
  }, [animated, slideAnim, opacityAnim, scaleAnim]);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Copy Text', 'Copy All'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1 || buttonIndex === 2) {
            copyToClipboard();
          }
        }
      );
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(message.content);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS === 'android') {
      Alert.alert('Copied', 'Message copied to clipboard', [{ text: 'OK' }]);
    }
  };

  const renderButtons = () => {
    const buttons = message.metadata?.buttons;
    if (!buttons || buttons.length === 0) return null;

    return (
      <View style={styles.buttonsContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.buttonRow}>
            {(Array.isArray(row) ? row : [row]).map((button, btnIndex) => (
              <TouchableOpacity
                key={btnIndex}
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={() => onButtonPress?.(button.callback_data || button.text)}
              >
                <Text style={styles.buttonText}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderImage = () => {
    const media = message.metadata?.media;
    if (!media || imageError) return null;

    return (
      <>
        <Pressable onPress={() => setShowImageViewer(true)}>
          <Image
            source={{ uri: media }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </Pressable>

        {/* Fullscreen Image Viewer */}
        <Modal
          visible={showImageViewer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageViewer(false)}
        >
          <View style={styles.imageViewerContainer}>
            <Pressable 
              style={styles.imageViewerBackground}
              onPress={() => setShowImageViewer(false)}
            >
              <Image
                source={{ uri: media }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </Pressable>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowImageViewer(false)}
            >
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      </>
    );
  };

  // Check if content has markdown (code blocks, headers, lists, etc.)
  const hasMarkdown = (text: string): boolean => {
    return /```|^#{1,6}\s|^\s*[-*]\s|^\s*\d+\.\s|`[^`]+`|\*\*|\*[^*]+\*|__|_[^_]+_|~~|\[.+\]\(.+\)|^>/m.test(text);
  };

  const renderReplyContext = () => {
    const replyTo = message.metadata?.replyTo;
    if (!replyTo) return null;

    const senderName = replyTo.role === 'user' ? 'You' : 'Assistant';
    
    return (
      <View style={[styles.replyContext, { 
        backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
        borderLeftColor: theme.primary,
      }]}>
        <Text style={[styles.replySender, { color: isUser ? '#fff' : theme.primary }]}>
          {senderName}
        </Text>
        <Text 
          style={[styles.replyText, { color: isUser ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}
          numberOfLines={1}
        >
          {replyTo.content}
        </Text>
      </View>
    );
  };

  const renderContent = () => {
    const content = message.content;
    
    // Use markdown renderer for assistant messages or if content has markdown
    if (!isUser || hasMarkdown(content)) {
      return <MarkdownRenderer content={content} isUser={isUser} />;
    }

    // Plain text for simple user messages
    return (
      <Text style={[styles.messageText, { color: theme.messageTextUser }]}>
        {content}
      </Text>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <View
          style={[
            styles.bubble,
            isUser 
              ? [styles.userBubble, { backgroundColor: theme.messageBubbleUser }]
              : [styles.assistantBubble, { backgroundColor: theme.messageBubbleAssistant }],
          ]}
        >
          {renderReplyContext()}
          {renderImage()}
          {renderContent()}
          {renderButtons()}
          
          {/* Time and status */}
          <View style={styles.footer}>
          <Text style={[
            styles.time, 
            { color: isUser ? 'rgba(255,255,255,0.6)' : theme.textTertiary }
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          {isUser && message.status && (
            <Text style={[styles.status, { color: 'rgba(255,255,255,0.6)' }]}>
              {message.status === 'sending' ? ' ○' : message.status === 'sent' ? ' ✓' : ' ✓✓'}
            </Text>
          )}
        </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  buttonsContainer: {
    marginTop: 8,
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  status: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  replyContext: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
    marginBottom: 8,
    borderRadius: 4,
  },
  replySender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 1,
  },
  replyText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
});
