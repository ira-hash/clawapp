/**
 * Biometrics Service
 * 
 * Face ID / Touch ID 인증
 * Features:
 * - 생체 인증 지원 여부 확인
 * - 인증 요청
 * - 설정 저장
 */

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@clawapp/biometric_enabled';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

class BiometricsService {
  private isEnabled = false;

  async init(): Promise<void> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      this.isEnabled = enabled === 'true';
    } catch (error) {
      console.error('Failed to load biometric settings:', error);
    }
  }

  async isSupported(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Biometrics support check failed:', error);
      return false;
    }
  }

  async getBiometricType(): Promise<BiometricType> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'facial';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'fingerprint';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'iris';
      }
      return 'none';
    } catch (error) {
      return 'none';
    }
  }

  async authenticate(reason?: string): Promise<boolean> {
    try {
      const supported = await this.isSupported();
      if (!supported) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Authenticate to continue',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }
}

export const biometrics = new BiometricsService();

// Helper function to get biometric type name
export function getBiometricTypeName(type: BiometricType): string {
  switch (type) {
    case 'facial': return 'Face ID';
    case 'fingerprint': return 'Touch ID';
    case 'iris': return 'Iris';
    default: return 'Biometrics';
  }
}
