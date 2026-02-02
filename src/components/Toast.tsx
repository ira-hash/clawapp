/**
 * Toast Component
 * 
 * 텔레그램 스타일 토스트 메시지
 * Features:
 * - 자동 사라짐
 * - 여러 타입 (success, error, info, warning)
 * - 애니메이션
 */

import React, { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StatusBar } from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const topOffset = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10;

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={[styles.container, { top: topOffset }]} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onDismiss={() => removeToast(toast.id)} 
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: ToastData;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss animation
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, (toast.duration || 3000) - 200);

    return () => clearTimeout(timeout);
  }, [slideAnim, opacityAnim, toast.duration]);

  const config = getToastConfig(toast.type);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons name={config.icon} size={20} color={config.color} />
      <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={18} color={config.color} style={{ opacity: 0.7 }} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function getToastConfig(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        backgroundColor: 'rgba(34, 197, 94, 0.95)',
        color: '#FFF',
        icon: 'checkmark-circle' as const,
      };
    case 'error':
      return {
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        color: '#FFF',
        icon: 'alert-circle' as const,
      };
    case 'warning':
      return {
        backgroundColor: 'rgba(245, 158, 11, 0.95)',
        color: '#FFF',
        icon: 'warning' as const,
      };
    case 'info':
    default:
      return {
        backgroundColor: 'rgba(59, 130, 246, 0.95)',
        color: '#FFF',
        icon: 'information-circle' as const,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
