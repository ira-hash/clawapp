/**
 * OpenClaw Design System
 * 
 * Based on https://openclaw.ai design tokens
 * Adapted for React Native
 */

export const openClawColors = {
  // Dark Theme (Default)
  dark: {
    // Background - Warmer dark with depth
    bg: '#12141a',
    bgAccent: '#14161d',
    bgElevated: '#1a1d25',
    bgHover: '#262a35',
    bgMuted: '#262a35',

    // Card / Surface
    card: '#181b22',
    cardForeground: '#f4f4f5',
    cardHighlight: 'rgba(255, 255, 255, 0.05)',
    popover: '#181b22',
    popoverForeground: '#f4f4f5',

    // Panel
    panel: '#12141a',
    panelStrong: '#1a1d25',
    panelHover: '#262a35',
    chrome: 'rgba(18, 20, 26, 0.95)',
    chromeStrong: 'rgba(18, 20, 26, 0.98)',

    // Text
    text: '#e4e4e7',
    textStrong: '#fafafa',
    chatText: '#e4e4e7',
    muted: '#71717a',
    mutedStrong: '#52525b',
    mutedForeground: '#71717a',

    // Border
    border: '#27272a',
    borderStrong: '#3f3f46',
    borderHover: '#52525b',
    input: '#27272a',
    ring: '#ff5c5c',

    // Accent - Signature Red
    accent: '#ff5c5c',
    accentHover: '#ff7070',
    accentMuted: '#ff5c5c',
    accentSubtle: 'rgba(255, 92, 92, 0.15)',
    accentForeground: '#fafafa',
    accentGlow: 'rgba(255, 92, 92, 0.25)',
    primary: '#ff5c5c',
    primaryForeground: '#ffffff',

    // Secondary - Teal
    secondary: '#1e2028',
    secondaryForeground: '#f4f4f5',
    accent2: '#14b8a6',
    accent2Muted: 'rgba(20, 184, 166, 0.7)',
    accent2Subtle: 'rgba(20, 184, 166, 0.15)',

    // Semantic
    ok: '#22c55e',
    okMuted: 'rgba(34, 197, 94, 0.75)',
    okSubtle: 'rgba(34, 197, 94, 0.12)',
    destructive: '#ef4444',
    destructiveForeground: '#fafafa',
    warn: '#f59e0b',
    warnMuted: 'rgba(245, 158, 11, 0.75)',
    warnSubtle: 'rgba(245, 158, 11, 0.12)',
    danger: '#ef4444',
    dangerMuted: 'rgba(239, 68, 68, 0.75)',
    dangerSubtle: 'rgba(239, 68, 68, 0.12)',
    info: '#3b82f6',

    // Focus
    focus: 'rgba(255, 92, 92, 0.25)',
  },

  // Light Theme
  light: {
    // Background
    bg: '#fafafa',
    bgAccent: '#f5f5f5',
    bgElevated: '#ffffff',
    bgHover: '#f0f0f0',
    bgMuted: '#f0f0f0',

    // Card / Surface
    card: '#ffffff',
    cardForeground: '#18181b',
    cardHighlight: 'rgba(0, 0, 0, 0.03)',
    popover: '#ffffff',
    popoverForeground: '#18181b',

    // Panel
    panel: '#fafafa',
    panelStrong: '#f5f5f5',
    panelHover: '#ebebeb',
    chrome: 'rgba(250, 250, 250, 0.95)',
    chromeStrong: 'rgba(250, 250, 250, 0.98)',

    // Text
    text: '#3f3f46',
    textStrong: '#18181b',
    chatText: '#3f3f46',
    muted: '#71717a',
    mutedStrong: '#52525b',
    mutedForeground: '#71717a',

    // Border
    border: '#e4e4e7',
    borderStrong: '#d4d4d8',
    borderHover: '#a1a1aa',
    input: '#e4e4e7',
    ring: '#dc2626',

    // Accent - Signature Red (darker for light mode)
    accent: '#dc2626',
    accentHover: '#ef4444',
    accentMuted: '#dc2626',
    accentSubtle: 'rgba(220, 38, 38, 0.12)',
    accentForeground: '#ffffff',
    accentGlow: 'rgba(220, 38, 38, 0.15)',
    primary: '#dc2626',
    primaryForeground: '#ffffff',

    // Secondary - Teal
    secondary: '#f4f4f5',
    secondaryForeground: '#3f3f46',
    accent2: '#0d9488',
    accent2Muted: 'rgba(13, 148, 136, 0.75)',
    accent2Subtle: 'rgba(13, 148, 136, 0.12)',

    // Semantic
    ok: '#16a34a',
    okMuted: 'rgba(22, 163, 74, 0.75)',
    okSubtle: 'rgba(22, 163, 74, 0.1)',
    destructive: '#dc2626',
    destructiveForeground: '#fafafa',
    warn: '#d97706',
    warnMuted: 'rgba(217, 119, 6, 0.75)',
    warnSubtle: 'rgba(217, 119, 6, 0.1)',
    danger: '#dc2626',
    dangerMuted: 'rgba(220, 38, 38, 0.75)',
    dangerSubtle: 'rgba(220, 38, 38, 0.1)',
    info: '#2563eb',

    // Focus
    focus: 'rgba(220, 38, 38, 0.2)',
  },
};

// Typography (Space Grotesk for display, system for body)
export const typography = {
  fontFamily: {
    display: 'System', // Use "Space Grotesk" if available
    body: 'System',
    mono: 'Menlo', // or JetBrains Mono
  },
  fontSize: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.55,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.02,
  },
};

// Spacing (8pt grid)
export const spacing = {
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
};

// Border Radius
export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// Shadows (approximated for RN)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.4,
    shadowRadius: 48,
    elevation: 12,
  },
};

// Animation durations
export const animation = {
  fast: 120,
  normal: 200,
  slow: 350,
};

// Create theme object from OpenClaw colors
export function createOpenClawTheme(mode: 'dark' | 'light') {
  const colors = openClawColors[mode];
  
  return {
    // Core
    background: colors.bg,
    surface: colors.bgAccent,
    surfaceElevated: colors.bgElevated,
    
    // Text
    text: colors.text,
    textSecondary: colors.muted,
    textTertiary: colors.mutedStrong,
    
    // Messages
    messageBubbleUser: colors.primary,
    messageBubbleAssistant: colors.card,
    messageTextUser: '#ffffff',
    messageTextAssistant: colors.text,
    
    // Components
    primary: colors.primary,
    secondary: colors.accent2,
    accent: colors.accent,
    
    // Semantic
    success: colors.ok,
    warning: colors.warn,
    error: colors.danger,
    info: colors.info,
    
    // Input
    inputBackground: colors.input,
    border: colors.border,
    
    // Code
    codeBackground: colors.bgMuted,
    codeText: colors.chatText,
    
    // Raw colors for custom use
    raw: colors,
  };
}

export type OpenClawTheme = ReturnType<typeof createOpenClawTheme>;
