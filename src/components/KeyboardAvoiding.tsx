/**
 * Keyboard Avoiding Component
 * 
 * 크로스 플랫폼 키보드 회피
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface KeyboardAvoidingProps {
  children: React.ReactNode;
  style?: ViewStyle;
  offset?: number;
}

export function KeyboardAvoiding({ children, style, offset = 0 }: KeyboardAvoidingProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? offset : 0}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
