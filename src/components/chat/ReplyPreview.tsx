/**
 * Reply Preview Component
 * 
 * 답장할 메시지 미리보기
 * 텔레그램 스타일로 입력창 위에 표시
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Message } from '../../types';

interface ReplyPreviewProps {
  message: Message;
  onCancel: () => void;
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  const { theme } = useTheme();
  
  const senderName = message.role === 'user' ? 'You' : 'Assistant';
  const previewText = message.content.slice(0, 100) + (message.content.length > 100 ? '...' : '');

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.senderName, { color: theme.primary }]}>
          {senderName}
        </Text>
        <Text 
          style={[styles.previewText, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {previewText}
        </Text>
      </View>
      
      {/* Close button */}
      <TouchableOpacity 
        onPress={onCancel}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginHorizontal: 8,
    marginBottom: -4,
  },
  accentBar: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    marginRight: 10,
    minHeight: 36,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewText: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
