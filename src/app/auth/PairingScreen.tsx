/**
 * Pairing Screen
 * 
 * QR code scanning and manual auth code entry for connecting to Clawdbot
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { parseQRCode, exchangeAuthCode, saveSession } from '../../services/pairing';
import { gateway } from '../../services/gateway';
import { GatewayConfig } from '../../types';

interface PairingScreenProps {
  onPaired: () => void;
}

export function PairingScreen({ onPaired }: PairingScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<'qr' | 'code'>('qr');
  const [authCode, setAuthCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleConnect = async (config: GatewayConfig) => {
    setIsConnecting(true);
    
    try {
      const connected = await gateway.connect(config);
      if (connected) {
        await saveSession(config);
        onPaired();
      } else {
        Alert.alert('Connection Failed', 'Could not connect to the gateway. Please try again.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'Failed to connect. Check your network and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleQRScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    const config = parseQRCode(data);
    if (config) {
      handleConnect(config);
    } else {
      Alert.alert('Invalid QR Code', 'This QR code is not a valid Clawdbot pairing code.', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  const handleCodeSubmit = async () => {
    if (authCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-character code.');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      const config = await exchangeAuthCode(authCode);
      if (config) {
        await handleConnect(config);
      } else {
        Alert.alert('Invalid Code', 'This code is invalid or expired. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.connectingText}>Connecting to your agent...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🦞 Claw</Text>
        <Text style={styles.subtitle}>Connect to your Clawdbot agent</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, mode === 'qr' && styles.activeTab]}
          onPress={() => setMode('qr')}
        >
          <Ionicons name="qr-code" size={20} color={mode === 'qr' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, mode === 'qr' && styles.activeTabText]}>Scan QR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, mode === 'code' && styles.activeTab]}
          onPress={() => setMode('code')}
        >
          <Ionicons name="keypad" size={20} color={mode === 'code' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, mode === 'code' && styles.activeTabText]}>Enter Code</Text>
        </TouchableOpacity>
      </View>

      {mode === 'qr' ? (
        <View style={styles.qrContainer}>
          {permission?.granted ? (
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleQRScanned}
            >
              <View style={styles.overlay}>
                <View style={styles.scanArea} />
              </View>
            </CameraView>
          ) : (
            <View style={styles.permissionContainer}>
              <Ionicons name="camera-outline" size={64} color="#8E8E93" />
              <Text style={styles.permissionText}>
                Camera access is required to scan QR codes
              </Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.hint}>
            Scan the QR code from your Clawdbot dashboard
          </Text>
        </View>
      ) : (
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Enter your 6-digit pairing code</Text>
          
          <TextInput
            style={styles.codeInput}
            value={authCode}
            onChangeText={(text) => setAuthCode(text.toUpperCase())}
            placeholder="ABC123"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            keyboardType="default"
          />
          
          <TouchableOpacity
            style={[styles.submitButton, authCode.length !== 6 && styles.submitButtonDisabled]}
            onPress={handleCodeSubmit}
            disabled={authCode.length !== 6}
          >
            <Text style={styles.submitButtonText}>Connect</Text>
          </TouchableOpacity>
          
          <Text style={styles.hint}>
            Find this code in your Clawdbot settings under "Mobile Pairing"
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FFF',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
  },
  qrContainer: {
    alignItems: 'center',
  },
  camera: {
    width: 280,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  permissionContainer: {
    width: 280,
    height: 280,
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  codeContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  codeLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  codeInput: {
    width: 200,
    height: 56,
    backgroundColor: '#FFF',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#1A1A1A',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
  },
  connectingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
});
