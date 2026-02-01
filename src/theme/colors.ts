/**
 * Color System with Dark Mode Support
 */

// Brand colors
export const brand = {
  primary: '#007AFF',
  primaryDark: '#0A84FF',
  secondary: '#5856D6',
  accent: '#FF6B35', // Lobster orange 🦞
};

// Semantic colors
export const semantic = {
  success: '#34C759',
  successDark: '#30D158',
  warning: '#FF9500',
  warningDark: '#FF9F0A',
  error: '#FF3B30',
  errorDark: '#FF453A',
  info: '#5AC8FA',
  infoDark: '#64D2FF',
};

// Gray scale
export const gray = {
  50: '#F9FAFB',
  100: '#F2F2F7',
  200: '#E5E5EA',
  300: '#D1D1D6',
  400: '#C7C7CC',
  500: '#8E8E93',
  600: '#636366',
  700: '#48484A',
  800: '#3A3A3C',
  900: '#2C2C2E',
  950: '#1C1C1E',
};

// Light theme
export const lightTheme = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceElevated: '#FFFFFF',
  
  // Text
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  // Messages
  messageBubbleUser: '#007AFF',
  messageBubbleAssistant: '#E9E9EB',
  messageTextUser: '#FFFFFF',
  messageTextAssistant: '#000000',
  
  // UI Elements
  border: '#E5E5EA',
  divider: '#C6C6C8',
  inputBackground: '#F2F2F7',
  
  // Status
  primary: brand.primary,
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  
  // Code blocks
  codeBackground: '#F5F5F5',
  codeText: '#1A1A1A',
};

// Dark theme
export const darkTheme = {
  // Backgrounds
  background: '#000000',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  
  // Messages
  messageBubbleUser: '#0A84FF',
  messageBubbleAssistant: '#2C2C2E',
  messageTextUser: '#FFFFFF',
  messageTextAssistant: '#FFFFFF',
  
  // UI Elements
  border: '#38383A',
  divider: '#48484A',
  inputBackground: '#1C1C1E',
  
  // Status
  primary: brand.primaryDark,
  success: semantic.successDark,
  warning: semantic.warningDark,
  error: semantic.errorDark,
  
  // Code blocks
  codeBackground: '#1E1E1E',
  codeText: '#D4D4D4',
};

// Export for backward compatibility
export const colors = {
  primary: brand.primary,
  secondary: brand.secondary,
  accent: brand.accent,
  success: semantic.success,
  warning: semantic.warning,
  error: semantic.error,
  
  // Grays
  gray50: gray[50],
  gray100: gray[100],
  gray200: gray[200],
  gray300: gray[300],
  gray400: gray[400],
  gray500: gray[500],
  gray600: gray[600],
  gray700: gray[700],
  gray800: gray[800],
  gray900: gray[900],
  
  // Themes
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = typeof lightTheme;
