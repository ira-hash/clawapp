/**
 * Pairing Screen
 * 
 * QR code scanning and manual auth code entry for connecting to Clawdbot Gateway
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { parseQRCode, exchangeAuthCode, testConnection } from '../../services/pairing';
import { gateway } from '../../services/gateway';
import { GatewayConfig } from '../../types';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

interface PairingScreenProps {
  onPaired: (config: GatewayConfig, name?: string) => void;
}

export function PairingScreen({ onPaired }: PairingScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<'qr' | 'code' | 'manual'>('qr');
  const [authCode, setAuthCode] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStatus, setConnectStatus] = useState('');
  const [scanned, setScanned] = useState(false);

  const handleConnect = async (config: GatewayConfig, name?: string) => {
    setIsConnecting(true);
    setConnectStatus('Testing connection...');
    
    try {
      // Test basic connectivity first
      const reachable = await testConnection(config);
      if (!reachable) {
        Alert.alert(
          'Connection Failed', 
          'Could not reach the gateway. Check the URL and your network connection.'
        );
        setIsConnecting(false);
        return;
      }

      setConnectStatus('Connecting to gateway...');
      
      // Connect with full handshake
      const connected = await gateway.connect(config);
      if (connected) {
        setConnectStatus('Connected!');
        onPaired(config, name);
      } else {
        Alert.alert('Connection Failed', 'Handshake failed. Check your token.');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      Alert.alert(
        'Connection Error', 
        error.message || 'Failed to connect. Please try again.'
      );
    } finally {
      setIsConnecting(false);
      setConnectStatus('');
    }
  };

  const handleQRScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    console.log('[Pairing] QR scanned:', data.slice(0, 50) + '...');
    
    const result = parseQRCode(data);
    if (result) {
      handleConnect(result.config, result.name);
    } else {
      Alert.alert(
        'Invalid QR Code', 
        'This QR code is not a valid Clawdbot pairing code.\n\nExpected format: clawdbot://connect?url=...&token=...',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const handleCodeSubmit = async () => {
    if (authCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-character code.');
      return;
    }
    
    setIsConnecting(true);
    setConnectStatus('Exchanging code...');
    
    try {
      const result = await exchangeAuthCode(authCode);
      if (result) {
        await handleConnect(result.config, result.name);
      } else {
        Alert.alert('Invalid Code', 'This code is invalid or expired. Please try again.');
        setIsConnecting(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
      setIsConnecting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualUrl.trim()) {
      Alert.alert('Missing URL', 'Please enter the gateway URL.');
      return;
    }
    if (!manualToken.trim()) {
      Alert.alert('Missing Token', 'Please enter the gateway token.');
      return;
    }

    const config: GatewayConfig = {
      url: manualUrl.trim(),
      token: manualToken.trim(),
    };

    await handleConnect(config);
  };

  if (isConnecting) {
    return (
      <View style={styles.container}>
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.connectingText}>{connectStatus || 'Connecting...'}</Text>
        </View>
      </View>
    );
  }

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, mode === 'qr' && styles.activeTab]}
        onPress={() => { setMode('qr'); setScanned(false); }}
      >
        <Ionicons name="qr-code" size={18} color={mode === 'qr' ? colors.primary : colors.gray500} />
        <Text style={[styles.tabText, mode === 'qr' && styles.activeTabText]}>Scan QR</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, mode === 'code' && styles.activeTab]}
        onPress={() => setMode('code')}
      >
        <Ionicons name="keypad" size={18} color={mode === 'code' ? colors.primary : colors.gray500} />
        <Text style={[styles.tabText, mode === 'code' && styles.activeTabText]}>Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, mode === 'manual' && styles.activeTab]}
        onPress={() => setMode('manual')}
      >
        <Ionicons name="build" size={18} color={mode === 'manual' ? colors.primary : colors.gray500} />
        <Text style={[styles.tabText, mode === 'manual' && styles.activeTabText]}>Manual</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQRScanner = () => (
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
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>
        </CameraView>
      ) : (
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.gray400} />
          <Text style={styles.permissionText}>
            Camera access is required to scan QR codes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.hint}>
        Scan the QR code from your Clawdbot dashboard or gateway settings
      </Text>
    </View>
  );

  const renderCodeInput = () => (
    <View style={styles.codeContainer}>
      <Text style={styles.inputLabel}>Enter your 6-digit pairing code</Text>
      
      <TextInput
        style={styles.codeInput}
        value={authCode}
        onChangeText={(text) => setAuthCode(text.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        placeholder="ABC123"
        placeholderTextColor={colors.gray400}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
      />
      
      <TouchableOpacity
        style={[styles.submitButton, authCode.length !== 6 && styles.submitButtonDisabled]}
        onPress={handleCodeSubmit}
        disabled={authCode.length !== 6}
      >
        <Text style={styles.submitButtonText}>Connect</Text>
      </TouchableOpacity>
      
      <Text style={styles.hint}>
        Generate a pairing code from your Clawdbot dashboard
      </Text>
    </View>
  );

  const renderManualInput = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.manualContainer}
    >
      <ScrollView contentContainerStyle={styles.manualScroll}>
        <Text style={styles.inputLabel}>Gateway URL</Text>
        <TextInput
          style={styles.textInput}
          value={manualUrl}
          onChangeText={setManualUrl}
          placeholder="wss://your-gateway.ts.net:18789"
          placeholderTextColor={colors.gray400}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        
        <Text style={[styles.inputLabel, { marginTop: spacing.md }]}>Token</Text>
        <TextInput
          style={styles.textInput}
          value={manualToken}
          onChangeText={setManualToken}
          placeholder="your_gateway_token"
          placeholderTextColor={colors.gray400}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton, 
            (!manualUrl.trim() || !manualToken.trim()) && styles.submitButtonDisabled
          ]}
          onPress={handleManualSubmit}
          disabled={!manualUrl.trim() || !manualToken.trim()}
        >
          <Text style={styles.submitButtonText}>Connect</Text>
        </TouchableOpacity>
        
        <Text style={styles.hint}>
          Find these in your Clawdbot config file under gateway.auth.token
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🦞 Claw</Text>
        <Text style={styles.subtitle}>Connect to your Clawdbot agent</Text>
      </View>

      {renderTabs()}

      {mode === 'qr' && renderQRScanner()}
      {mode === 'code' && renderCodeInput()}
      {mode === 'manual' && renderManualInput()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: colors.light.background,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.gray500,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.light.background,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.gray500,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  camera: {
    width: 280,
    height: 280,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanArea: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FFF',
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: 3, borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: 3, borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: 3, borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: 3, borderRightWidth: 3,
  },
  permissionContainer: {
    width: 280,
    height: 280,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  permissionText: {
    fontSize: fontSize.sm,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  codeContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.md,
    color: colors.light.text,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  codeInput: {
    width: 200,
    height: 64,
    backgroundColor: colors.light.background,
    borderRadius: borderRadius.md,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
    color: colors.light.text,
    marginBottom: spacing.lg,
  },
  textInput: {
    width: '100%',
    height: 48,
    backgroundColor: colors.light.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.light.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  manualContainer: {
    flex: 1,
  },
  manualScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    fontSize: fontSize.md,
    color: colors.gray500,
    marginTop: spacing.md,
  },
});
