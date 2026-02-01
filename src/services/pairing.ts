/**
 * Pairing Service
 * 
 * Handles QR code and auth code pairing with Clawdbot Gateway
 */

import { GatewayConfig } from '../types';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'clawapp_session';

interface StoredSession {
  gatewayUrl: string;
  token: string;
  agentId?: string;
  agentName?: string;
  savedAt: number;
}

/**
 * Parse QR code data
 * 
 * Supported formats:
 * 1. clawdbot://connect?url=<gateway_url>&token=<token>&name=<agent_name>
 * 2. JSON: {"url": "...", "token": "...", "name": "..."}
 * 3. Simple URL with token: wss://gateway.example.com?token=xxx
 */
export function parseQRCode(data: string): { config: GatewayConfig; name?: string } | null {
  try {
    // Format 1: clawdbot:// protocol
    if (data.startsWith('clawdbot://connect')) {
      const url = new URL(data);
      const gatewayUrl = url.searchParams.get('url');
      const token = url.searchParams.get('token');
      const name = url.searchParams.get('name') || undefined;
      const agentId = url.searchParams.get('agent') || undefined;
      
      if (gatewayUrl && token) {
        return {
          config: { url: gatewayUrl, token, agentId },
          name,
        };
      }
    }
    
    // Format 2: JSON
    if (data.startsWith('{')) {
      const parsed = JSON.parse(data);
      if (parsed.url && parsed.token) {
        return {
          config: {
            url: parsed.url,
            token: parsed.token,
            agentId: parsed.agentId,
          },
          name: parsed.name,
        };
      }
    }
    
    // Format 3: Direct WebSocket URL with token param
    if (data.startsWith('ws://') || data.startsWith('wss://')) {
      const url = new URL(data);
      const token = url.searchParams.get('token');
      if (token) {
        // Remove token from URL params
        url.searchParams.delete('token');
        const name = url.searchParams.get('name') || undefined;
        url.searchParams.delete('name');
        
        return {
          config: {
            url: url.toString().replace(/\?$/, ''),
            token,
          },
          name,
        };
      }
    }
    
    return null;
  } catch (e) {
    console.error('[Pairing] Failed to parse QR code:', e);
    return null;
  }
}

/**
 * Generate QR code data for sharing
 */
export function generateQRData(config: GatewayConfig, name?: string): string {
  const params = new URLSearchParams({
    url: config.url,
    token: config.token,
  });
  
  if (config.agentId) {
    params.set('agent', config.agentId);
  }
  if (name) {
    params.set('name', name);
  }
  
  return `clawdbot://connect?${params.toString()}`;
}

/**
 * Validate auth code format (6-digit alphanumeric)
 */
export function validateAuthCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/i.test(code);
}

/**
 * Exchange auth code for gateway config
 * 
 * The pairing server exchanges short codes for full gateway configs
 */
export async function exchangeAuthCode(
  code: string,
  pairingServerUrl: string = 'https://pair.clawd.bot'
): Promise<{ config: GatewayConfig; name?: string } | null> {
  try {
    const response = await fetch(`${pairingServerUrl}/api/pair`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: code.toUpperCase() }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('[Pairing] Auth code exchange failed:', error);
      return null;
    }
    
    const data = await response.json();
    return {
      config: {
        url: data.gatewayUrl || data.url,
        token: data.token,
        agentId: data.agentId,
      },
      name: data.name || data.agentName,
    };
  } catch (e) {
    console.error('[Pairing] Auth code exchange error:', e);
    return null;
  }
}

/**
 * Test gateway connection
 */
export async function testConnection(config: GatewayConfig): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      let wsUrl = config.url
        .replace('https://', 'wss://')
        .replace('http://', 'ws://');
      
      const ws = new WebSocket(wsUrl);
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      };
      
      ws.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    } catch {
      resolve(false);
    }
  });
}

/**
 * Save session to secure storage
 */
export async function saveSession(config: GatewayConfig, name?: string): Promise<void> {
  const session: StoredSession = {
    gatewayUrl: config.url,
    token: config.token,
    agentId: config.agentId,
    agentName: name,
    savedAt: Date.now(),
  };
  
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
}

/**
 * Load session from secure storage
 */
export async function loadSession(): Promise<{ config: GatewayConfig; name?: string } | null> {
  try {
    const data = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!data) return null;
    
    const session: StoredSession = JSON.parse(data);
    return {
      config: {
        url: session.gatewayUrl,
        token: session.token,
        agentId: session.agentId,
      },
      name: session.agentName,
    };
  } catch (e) {
    console.error('[Pairing] Failed to load session:', e);
    return null;
  }
}

/**
 * Clear saved session
 */
export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
