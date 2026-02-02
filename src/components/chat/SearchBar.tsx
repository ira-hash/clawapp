/**
 * Search Bar Component
 * 
 * 텔레그램 스타일 검색바
 * Features:
 * - 슬라이드 애니메이션
 * - 검색 결과 네비게이션
 * - 취소 버튼
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface SearchBarProps {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  resultCount?: number;
  currentIndex?: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function SearchBar({
  visible,
  value,
  onChangeText,
  onClose,
  resultCount = 0,
  currentIndex = 0,
  onPrevious,
  onNext,
}: SearchBarProps) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -60,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();

    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible, slideAnim]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleNav = async (direction: 'prev' | 'next') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (direction === 'prev') onPrevious?.();
    else onNext?.();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.searchRow}>
        {/* Search icon */}
        <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.icon} />

        {/* Input */}
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Search messages..."
          placeholderTextColor={theme.textSecondary}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Result count */}
        {value.length > 0 && (
          <Text style={[styles.resultCount, { color: theme.textSecondary }]}>
            {resultCount > 0 ? `${currentIndex + 1}/${resultCount}` : '0'}
          </Text>
        )}

        {/* Navigation buttons */}
        {resultCount > 1 && (
          <View style={styles.navButtons}>
            <TouchableOpacity onPress={() => handleNav('prev')} style={styles.navButton}>
              <Ionicons name="chevron-up" size={22} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNav('next')} style={styles.navButton}>
              <Ionicons name="chevron-down" size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Close button */}
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 13,
    marginHorizontal: 8,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 4,
  },
  closeButton: {
    paddingLeft: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
