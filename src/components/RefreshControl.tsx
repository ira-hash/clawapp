/**
 * Custom Refresh Control
 * 
 * OpenClaw 스타일 pull-to-refresh
 */

import React from 'react';
import {
  RefreshControl as RNRefreshControl,
  RefreshControlProps as RNRefreshControlProps,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface RefreshControlProps extends Omit<RNRefreshControlProps, 'tintColor' | 'colors'> {
  refreshing: boolean;
  onRefresh: () => void;
}

export function RefreshControl({ refreshing, onRefresh, ...props }: RefreshControlProps) {
  const { theme } = useTheme();

  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.primary}
      colors={[theme.primary]} // Android
      progressBackgroundColor={theme.surface} // Android
      {...props}
    />
  );
}
