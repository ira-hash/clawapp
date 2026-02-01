/**
 * Message Bubble Component
 * 
 * Renders a single chat message with support for:
 * - Text content
 * - Code blocks with syntax highlighting
 * - Inline buttons
 * - Media attachments
 * - Thinking indicator
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Clipboard,
} from 'react-native';
import { Message, InlineButton } from '../../types';

interface MessageBubbleProps {
  message: Message;
  onButtonPress?: (callbackData: string) => void;
}

export function MessageBubble({ message, onButtonPress }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isThinking = message.metadata?.thinking;
  
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    // TODO: Show toast notification
  };

  const renderCodeBlock = (code: string, language: string, index: number) => (
    <View key={index} style={styles.codeBlock}>
      <View style={styles.codeHeader}>
        <Text style={styles.codeLanguage}>{language}</Text>
        <TouchableOpacity onPress={() => copyToClipboard(code)}>
          <Text style={styles.copyButton}>Copy</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.codeContent}>{code}</Text>
    </View>
  );

  const renderButtons = (buttons: InlineButton[][]) => (
    <View style={styles.buttonContainer}>
      {buttons.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.buttonRow}>
          {row.map((button, btnIndex) => (
            <TouchableOpacity
              key={btnIndex}
              style={styles.inlineButton}
              onPress={() => onButtonPress?.(button.callback_data)}
            >
              <Text style={styles.buttonText}>{button.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  const renderMedia = () => {
    const media = message.metadata?.media;
    if (!media?.length) return null;
    
    return (
      <View style={styles.mediaContainer}>
        {media.map((item, index) => {
          if (item.type === 'image') {
            return (
              <Image
                key={index}
                source={{ uri: item.url }}
                style={styles.mediaImage}
                resizeMode="contain"
              />
            );
          }
          // TODO: Handle other media types
          return null;
        })}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        isThinking && styles.thinkingBubble
      ]}>
        {isThinking && (
          <View style={styles.thinkingHeader}>
            <Text style={styles.thinkingText}>🤔 Thinking...</Text>
          </View>
        )}
        
        <Text style={[
          styles.messageText,
          isUser && styles.userText
        ]}>
          {message.content}
        </Text>
        
        {message.metadata?.codeBlocks?.map((block, index) =>
          renderCodeBlock(block.code, block.language, index)
        )}
        
        {renderMedia()}
        
        {message.metadata?.buttons && renderButtons(message.metadata.buttons)}
      </View>
      
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
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
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  thinkingBubble: {
    backgroundColor: '#FFF3CD',
  },
  thinkingHeader: {
    marginBottom: 8,
  },
  thinkingText: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  codeBlock: {
    marginTop: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2D2D2D',
  },
  codeLanguage: {
    fontSize: 12,
    color: '#9CDCFE',
  },
  copyButton: {
    fontSize: 12,
    color: '#007AFF',
  },
  codeContent: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#D4D4D4',
    padding: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inlineButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaContainer: {
    marginTop: 8,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});
