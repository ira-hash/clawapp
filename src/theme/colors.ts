/**
 * Color System - OpenClaw Design System
 * 
 * Based on https://openclaw.ai design tokens
 * Features:
 * - Signature red accent (#ff5c5c dark / #dc2626 light)
 * - Teal secondary (#14b8a6)
 * - Warm dark backgrounds
 * - Clean light mode
 */

// Brand colors (OpenClaw)
export const brand = {
  primary: '#ff5c5c',       // Signature red (dark mode)
  primaryLight: '#dc2626',  // Signature red (light mode)
  secondary: '#14b8a6',     // Teal
  accent: '#ff5c5c',        // Same as primary
};

// Semantic colors
export const semantic = {
  success: '#22c55e',
  successLight: '#16a34a',
  warning: '#f59e0b',
  warningLight: '#d97706',
  error: '#ef4444',
  errorLight: '#dc2626',
  info: '#3b82f6',
  infoLight: '#2563eb',
};

// Gray scale (Zinc-based for warmth)
export const gray = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#12141a',  // OpenClaw bg
};

// Dark theme (OpenClaw default)
export const darkTheme = {
  // Backgrounds - Warmer dark with depth
  background: '#12141a',
  surface: '#14161d',
  surfaceElevated: '#1a1d25',
  
  // Text
  text: '#e4e4e7',
  textSecondary: '#71717a',
  textTertiary: '#52525b',
  
  // Messages - Red accent for user
  messageBubbleUser: '#ff5c5c',
  messageBubbleAssistant: '#181b22',
  messageTextUser: '#ffffff',
  messageTextAssistant: '#e4e4e7',
  
  // UI Elements
  border: '#27272a',
  divider: '#3f3f46',
  inputBackground: '#1a1d25',
  
  // Status
  primary: '#ff5c5c',
  secondary: '#14b8a6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Code blocks
  codeBackground: '#262a35',
  codeText: '#e4e4e7',
  
  // Tab bar
  tabBar: '#12141a',
  tabBarBorder: '#27272a',
  tabActive: '#ff5c5c',
  tabInactive: '#71717a',
  
  // Cards
  card: '#181b22',
  cardBorder: '#27272a',
  
  // Status indicators
  online: '#22c55e',
  offline: '#71717a',
  busy: '#f59e0b',
  
  // Message status
  sent: '#71717a',
  delivered: '#71717a',
  read: '#14b8a6',
};

// Light theme (OpenClaw)
export const lightTheme = {
  // Backgrounds
  background: '#fafafa',
  surface: '#f5f5f5',
  surfaceElevated: '#ffffff',
  
  // Text
  text: '#3f3f46',
  textSecondary: '#71717a',
  textTertiary: '#a1a1aa',
  
  // Messages
  messageBubbleUser: '#dc2626',
  messageBubbleAssistant: '#ffffff',
  messageTextUser: '#ffffff',
  messageTextAssistant: '#3f3f46',
  
  // UI Elements
  border: '#e4e4e7',
  divider: '#d4d4d8',
  inputBackground: '#f5f5f5',
  
  // Status
  primary: '#dc2626',
  secondary: '#0d9488',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  
  // Code blocks
  codeBackground: '#f0f0f0',
  codeText: '#3f3f46',
  
  // Tab bar
  tabBar: '#ffffff',
  tabBarBorder: '#e4e4e7',
  tabActive: '#dc2626',
  tabInactive: '#71717a',
  
  // Cards
  card: '#ffffff',
  cardBorder: '#e4e4e7',
  
  // Status indicators
  online: '#16a34a',
  offline: '#a1a1aa',
  busy: '#d97706',
  
  // Message status
  sent: '#a1a1aa',
  delivered: '#a1a1aa',
  read: '#0d9488',
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

export type Theme = typeof darkTheme;

// Export theme-specific colors for components
export function getThemeColors(isDark: boolean) {
  return isDark ? darkTheme : lightTheme;
}
