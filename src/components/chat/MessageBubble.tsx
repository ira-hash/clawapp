/**
 * Message Bubble Component
 * 
 * Displays a single message with support for:
 * - User/Assistant styling
 * - Code blocks
 * - Inline buttons
 * - Long press to copy
 * - Images
 */

import React, { useState } from 'react';
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
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Message } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface MessageBubbleProps {
  message: Message;
  onButtonPress?: (callbackData: string) => void;
}

export function MessageBubble({ message, onButtonPress }: MessageBubbleProps) {
  const { theme, isDark } = useTheme();
  const isUser = message.role === 'user';
  const [imageError, setImageError] = useState(false);

  const handleLongPress = async () => {
    // Haptic feedback
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
      // Android - just copy
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(message.content);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // On Android, show a brief confirmation
    if (Platform.OS === 'android') {
      Alert.alert('Copied', 'Message copied to clipboard', [{ text: 'OK' }]);
    }
  };

  // Parse content for code blocks
  const renderContent = () => {
    const content = message.content;
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        parts.push(
          <Text key={key++} style={[styles.messageText, { color: isUser ? theme.messageTextUser : theme.messageTextAssistant }]}>
            {textBefore}
          </Text>
        );
      }

      // Add code block
      const language = match[1] || '';
      const code = match[2].trim();
      parts.push(
        <View key={key++} style={[styles.codeBlock, { backgroundColor: theme.codeBackground }]}>
          {language && (
            <Text style={[styles.codeLanguage, { color: theme.textSecondary }]}>{language}</Text>
          )}
          <Text style={[styles.codeText, { color: theme.codeText }]}>{code}</Text>
        </View>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <Text key={key++} style={[styles.messageText, { color: isUser ? theme.messageTextUser : theme.messageTextAssistant }]}>
          {content.slice(lastIndex)}
        </Text>
      );
    }

    return parts.length > 0 ? parts : (
      <Text style={[styles.messageText, { color: isUser ? theme.messageTextUser : theme.messageTextAssistant }]}>
        {content}
      </Text>
    );
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
      <Image
        source={{ uri: media }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <Pressable
      onLongPress={handleLongPress}
      delayLongPress={500}
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser 
            ? [styles.userBubble, { backgroundColor: theme.messageBubbleUser }]
            : [styles.assistantBubble, { backgroundColor: theme.messageBubbleAssistant }],
        ]}
      >
        {renderImage()}
        {renderContent()}
        {renderButtons()}
        
        {/* Status indicator for user messages */}
        {isUser && message.status && (
          <Text style={[styles.status, { color: 'rgba(255,255,255,0.6)' }]}>
            {message.status === 'sending' ? '○' : message.status === 'sent' ? '✓' : '✓✓'}
          </Text>
        )}
      </View>
    </Pressable>
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
  codeBlock: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  codeLanguage: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 18,
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
});
