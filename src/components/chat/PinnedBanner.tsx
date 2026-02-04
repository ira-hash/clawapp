/**
 * PinnedBanner Component
 * 
 * 채팅 상단에 표시되는 고정 메시지 배너
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { PinnedMessage } from '../../types/pinned';
import { getPinnedMessagesForRoom } from '../../services/PinnedService';
import { spacing, fontSize, borderRadius } from '../../theme';

interface PinnedBannerProps {
  roomId: string;
  onPress?: (pinnedMessage: PinnedMessage) => void;
  onShowAll?: () => void;
}

export function PinnedBanner({ roomId, onPress, onShowAll }: PinnedBannerProps) {
  const { theme } = useTheme();
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPinnedMessages();
  }, [roomId]);

  const loadPinnedMessages = () => {
    const messages = getPinnedMessagesForRoom(roomId);
    setPinnedMessages(messages);
  };

  const handlePress = () => {
    if (pinnedMessages.length === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(pinnedMessages[currentIndex]);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExpanded(!isExpanded);
  };

  const handleNext = () => {
    if (pinnedMessages.length <= 1) return;
    
    Haptics.selectionAsync();
    
    // 슬라이드 애니메이션
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCurrentIndex((prev) => (prev + 1) % pinnedMessages.length);
  };

  if (pinnedMessages.length === 0) {
    return null;
  }

  const currentPinned = pinnedMessages[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceElevated, borderBottomColor: theme.border }]}>
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name="pin" size={14} color={theme.primary} />
        </View>
        
        <Animated.View 
          style={[
            styles.textContainer, 
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={[styles.label, { color: theme.primary }]}>
            Pinned Message {pinnedMessages.length > 1 ? `${currentIndex + 1}/${pinnedMessages.length}` : ''}
          </Text>
          <Text style={[styles.preview, { color: theme.text }]} numberOfLines={1}>
            {currentPinned.content}
          </Text>
          {currentPinned.note && (
            <Text style={[styles.note, { color: theme.textSecondary }]} numberOfLines={1}>
              📝 {currentPinned.note}
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Navigation buttons */}
      <View style={styles.actions}>
        {pinnedMessages.length > 1 && (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
          >
            <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
        
        {onShowAll && pinnedMessages.length > 1 && (
          <TouchableOpacity
            onPress={onShowAll}
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
          >
            <Text style={[styles.showAllText, { color: theme.primary }]}>
              {pinnedMessages.length}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Expanded view */}
      {isExpanded && (
        <View style={[styles.expandedContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {pinnedMessages.map((pinned, index) => (
            <TouchableOpacity
              key={pinned.id}
              style={[
                styles.expandedItem,
                index === currentIndex && { backgroundColor: theme.primary + '10' },
              ]}
              onPress={() => {
                setCurrentIndex(index);
                setIsExpanded(false);
                onPress?.(pinned);
              }}
            >
              <Text style={[styles.expandedText, { color: theme.text }]} numberOfLines={2}>
                {pinned.content}
              </Text>
              <Text style={[styles.expandedDate, { color: theme.textTertiary }]}>
                {new Date(pinned.pinnedAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: 2,
  },
  preview: {
    fontSize: fontSize.sm,
  },
  note: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  actions: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showAllText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  expandedContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  expandedItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  expandedText: {
    fontSize: fontSize.sm,
  },
  expandedDate: {
    fontSize: fontSize.xs,
    marginTop: 4,
  },
});
