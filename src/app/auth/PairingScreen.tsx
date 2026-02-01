/**
 * Pairing Screen
 * 
 * QR code scanning and manual auth code entry for connecting to Clawdbot Gateway
 */

import React, { useState } from 'react';
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
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { parseQRCode, testConnection } from '../../services/pairing';
import { gateway } from '../../services/gateway';
import { GatewayConfig } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../theme';

interface PairingScreenProps {
  onPaired: (config: GatewayConfig, name?: string) => void;
}

export function PairingScreen({ onPaired }: PairingScreenProps) {
  const { theme, isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<'qr' | 'manual'>('qr');
  const [manualUrl, setManualUrl] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStatus, setConnectStatus] = useState('');
  const [scanned, setScanned] = useState(false);

  const handleConnect = async (config: GatewayConfig, name?: string) => {
    setIsConnecting(true);
    setConnectStatus('Testing connection...');
    
    try {
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
    
    const result = parseQRCode(data);
    if (result) {
      handleConnect(result.config, result.name);
    } else {
      Alert.alert(
        'Invalid QR Code', 
        'This QR code is not a valid Clawdbot pairing code.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.connectingText, { color: theme.textSecondary }]}>
            {connectStatus || 'Connecting...'}
          </Text>
        </View>
      </View>
    );
  }

  const renderTabs = () => (
    <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
      <TouchableOpacity
        style={[styles.tab, mode === 'qr' && [styles.activeTab, { backgroundColor: theme.background }]]}
        onPress={() => { setMode('qr'); setScanned(false); }}
      >
        <Ionicons name="qr-code" size={18} color={mode === 'qr' ? theme.primary : theme.textSecondary} />
        <Text style={[styles.tabText, mode === 'qr' && { color: theme.primary }]}>Scan QR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, mode === 'manual' && [styles.activeTab, { backgroundColor: theme.background }]]}
        onPress={() => setMode('manual')}
      >
        <Ionicons name="build" size={18} color={mode === 'manual' ? theme.primary : theme.textSecondary} />
        <Text style={[styles.tabText, mode === 'manual' && { color: theme.primary }]}>Manual</Text>
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
        <View style={[styles.permissionContainer, { backgroundColor: theme.surface }]}>
          <Ionicons name="camera-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.permissionText, { color: theme.textSecondary }]}>
            Camera access is required to scan QR codes
          </Text>
          <TouchableOpacity style={[styles.permissionButton, { backgroundColor: theme.primary }]} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        Scan the QR code from your Clawdbot gateway settings
      </Text>
    </View>
  );

  const renderManualInput = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.manualContainer}
    >
      <ScrollView contentContainerStyle={styles.manualScroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.inputLabel, { color: theme.text }]}>Gateway URL</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
          value={manualUrl}
          onChangeText={setManualUrl}
          placeholder="wss://your-gateway:18789"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        
        <Text style={[styles.inputLabel, { color: theme.text, marginTop: spacing.md }]}>Token</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
          value={manualToken}
          onChangeText={setManualToken}
          placeholder="your_gateway_token"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton, 
            { backgroundColor: (!manualUrl.trim() || !manualToken.trim()) ? theme.border : theme.primary }
          ]}
          onPress={handleManualSubmit}
          disabled={!manualUrl.trim() || !manualToken.trim()}
        >
          <Text style={styles.submitButtonText}>Connect</Text>
        </TouchableOpacity>
        
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Find these in your Clawdbot config file under gateway.auth.token
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>🦞 Claw</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Connect to your Clawdbot agent</Text>
      </View>

      {renderTabs()}

      {mode === 'qr' && renderQRScanner()}
      {mode === 'manual' && renderManualInput()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  tabContainer: {
    flexDirection: 'row',
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
  activeTab: {},
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
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
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  permissionContainer: {
    width: 280,
    height: 280,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  permissionText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  permissionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  textInput: {
    width: '100%',
    height: 48,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  submitButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: fontSize.sm,
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
    marginTop: spacing.md,
  },
});
