/**
 * OpenClaw Design System - Theme Exports
 */

export * from './colors';
export * from './openclaw';

// Spacing (8pt grid system)
export const spacing = {
  px: 1,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// Font Sizes
export const fontSize = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  title: 34,
};

// Font Weights
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Line Heights
export const lineHeight = {
  tight: 1.25,
  normal: 1.55,
  relaxed: 1.75,
};

// Shadows (iOS/Android compatible)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Animation durations (ms)
export const animation = {
  fast: 120,
  normal: 200,
  slow: 350,
};

// Z-Index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
