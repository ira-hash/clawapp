/**
 * Avatar Component
 * 
 * 에이전트/사용자 아바타 표시
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface AvatarProps {
  emoji?: string;
  imageUri?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
  isOnline?: boolean;
}

export function Avatar({
  emoji,
  imageUri,
  name,
  size = 'medium',
  showStatus = false,
  isOnline = false,
}: AvatarProps) {
  const { theme } = useTheme();

  const sizeMap = {
    small: { container: 36, emoji: 18, status: 10, border: 2 },
    medium: { container: 48, emoji: 24, status: 12, border: 2 },
    large: { container: 64, emoji: 32, status: 14, border: 3 },
  };

  const s = sizeMap[size];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <View style={[
      styles.container,
      {
        width: s.container,
        height: s.container,
        borderRadius: s.container / 2,
        backgroundColor: theme.primary + '15',
      }
    ]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { 
            width: s.container, 
            height: s.container, 
            borderRadius: s.container / 2 
          }]}
        />
      ) : emoji ? (
        <Text style={[styles.emoji, { fontSize: s.emoji }]}>{emoji}</Text>
      ) : (
        <Text style={[styles.initials, { fontSize: s.emoji, color: theme.primary }]}>
          {getInitials(name)}
        </Text>
      )}

      {showStatus && (
        <View style={[
          styles.status,
          {
            width: s.status,
            height: s.status,
            borderRadius: s.status / 2,
            borderWidth: s.border,
            borderColor: theme.background,
            backgroundColor: isOnline ? theme.success : theme.textTertiary,
            right: 0,
            bottom: 0,
          }
        ]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  emoji: {
    textAlign: 'center',
  },
  initials: {
    fontWeight: '600',
    textAlign: 'center',
  },
  status: {
    position: 'absolute',
  },
});
