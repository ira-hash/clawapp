/**
 * useNetwork Hook
 * 
 * 네트워크 연결 상태 추적 (간단 버전)
 * Note: 프로덕션에서는 @react-native-community/netinfo 사용 권장
 */

import { useState, useEffect, useCallback } from 'react';

interface NetworkState {
  isConnected: boolean;
  lastChecked: number;
}

export function useNetwork(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    lastChecked: Date.now(),
  });

  const checkConnection = useCallback(async () => {
    try {
      // Simple connectivity check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      setNetworkState({
        isConnected: response.ok || response.status === 204,
        lastChecked: Date.now(),
      });
    } catch {
      setNetworkState({
        isConnected: false,
        lastChecked: Date.now(),
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  return networkState;
}

/**
 * Simple online/offline check
 */
export function useIsOnline(): boolean {
  const { isConnected } = useNetwork();
  return isConnected;
}
