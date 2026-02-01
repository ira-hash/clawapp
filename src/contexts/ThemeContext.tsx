/**
 * Theme Context
 * 
 * Provides theme (light/dark) throughout the app
 * Supports system preference detection
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from '../theme/colors';
import { getThemePreference, setThemePreference, ThemeMode } from '../services/storage';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    getThemePreference().then((mode) => {
      setThemeModeState(mode);
      setIsLoaded(true);
    });
  }, []);

  // Determine if dark mode should be active
  const isDark = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await setThemePreference(mode);
  };

  // Don't render until we've loaded the preference
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
