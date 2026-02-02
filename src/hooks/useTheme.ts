/**
 * Theme Hook
 * 
 * Provides theme colors based on user preference and system settings
 */

import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { Theme, darkTheme, lightTheme } from '../theme';
import { Settings } from '../types';

export function useTheme(settings: Settings): {
  theme: Theme;
  isDark: boolean;
} {
  const systemColorScheme = useColorScheme();
  
  const isDark = useMemo(() => {
    if (settings.theme === 'system') {
      return systemColorScheme === 'dark';
    }
    return settings.theme === 'dark';
  }, [settings.theme, systemColorScheme]);

  const theme = useMemo(() => isDark ? darkTheme : lightTheme, [isDark]);

  return { theme, isDark };
}
