/**
 * Date Separator Component
 * 
 * 텔레그램 스타일 날짜 구분선
 * Features:
 * - 오늘/어제/날짜 표시
 * - 깔끔한 디자인
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface DateSeparatorProps {
  date: Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const { theme } = useTheme();

  const formatDate = (d: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (target.getTime() === today.getTime()) {
      return 'Today';
    } else if (target.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else if (now.getFullYear() === d.getFullYear()) {
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    } else {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.pill, { backgroundColor: theme.surface }]}>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          {formatDate(date)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
