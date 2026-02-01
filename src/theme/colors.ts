/**
 * Claw Color System
 * 
 * Telegram-inspired color palette with Clawdbot branding
 */

export const colors = {
  // Primary brand colors
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0056B3',
  
  // Accent colors
  accent: '#5856D6',
  lobster: '#E74C3C',  // Clawdbot brand
  
  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  
  // Grays
  gray50: '#F9FAFB',
  gray100: '#F2F2F7',
  gray200: '#E5E5EA',
  gray300: '#D1D1D6',
  gray400: '#C7C7CC',
  gray500: '#8E8E93',
  gray600: '#636366',
  gray700: '#48484A',
  gray800: '#3A3A3C',
  gray900: '#2C2C2E',
  
  // Light theme
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
    border: '#E5E5EA',
    userBubble: '#007AFF',
    userBubbleText: '#FFFFFF',
    agentBubble: '#E9E9EB',
    agentBubbleText: '#000000',
    inputBackground: '#F2F2F7',
    headerBackground: '#FFFFFF',
    tabBar: '#FFFFFF',
  },
  
  // Dark theme
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',
    border: '#38383A',
    userBubble: '#007AFF',
    userBubbleText: '#FFFFFF',
    agentBubble: '#2C2C2E',
    agentBubbleText: '#FFFFFF',
    inputBackground: '#1C1C1E',
    headerBackground: '#1C1C1E',
    tabBar: '#1C1C1E',
  },
  
  // Status colors
  online: '#34C759',
  offline: '#8E8E93',
  typing: '#007AFF',
  thinking: '#FF9500',
  
  // Message status
  sent: '#8E8E93',
  delivered: '#8E8E93',
  read: '#007AFF',
};

export type ThemeColors = typeof colors.light;

export const getTheme = (isDark: boolean): ThemeColors => {
  return isDark ? colors.dark : colors.light;
};
