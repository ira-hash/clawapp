/**
 * useAppState Hook
 * 
 * 앱 상태 (foreground/background) 추적
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseAppStateOptions {
  onForeground?: () => void;
  onBackground?: () => void;
}

export function useAppState(options?: UseAppStateOptions): AppStateStatus {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const previousState = useRef<AppStateStatus>(appState);

  const handleAppStateChange = useCallback((nextState: AppStateStatus) => {
    if (previousState.current.match(/inactive|background/) && nextState === 'active') {
      options?.onForeground?.();
    } else if (previousState.current === 'active' && nextState.match(/inactive|background/)) {
      options?.onBackground?.();
    }

    previousState.current = nextState;
    setAppState(nextState);
  }, [options]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  return appState;
}

/**
 * 앱이 foreground로 돌아왔는지 확인
 */
export function useIsForeground(): boolean {
  const appState = useAppState();
  return appState === 'active';
}
