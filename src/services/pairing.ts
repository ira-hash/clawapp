/**
 * Pairing Service
 * 
 * Handles QR code and auth code pairing with Clawdbot Gateway
 */

import { GatewayConfig, PairingCode, PairingQR } from '../types';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'clawapp_session';

interface StoredSession {
  gatewayUrl: string;
  token: string;
  agentId?: string;
  savedAt: number;
}

/**
 * Parse QR code data
 * Expected format: clawdbot://connect?url=<gateway_url>&token=<token>&agent=<agent_id>
 */
export function parseQRCode(data: string): GatewayConfig | null {
  try {
    // Handle clawdbot:// protocol
    if (data.startsWith('clawdbot://connect')) {
      const url = new URL(data);
      const gatewayUrl = url.searchParams.get('url');
      const token = url.searchParams.get('token');
      const agentId = url.searchParams.get('agent') || undefined;
      
      if (gatewayUrl && token) {
        return { url: gatewayUrl, token, agentId };
      }
    }
    
    // Handle direct JSON format
    if (data.startsWith('{')) {
      const parsed = JSON.parse(data);
      if (parsed.url && parsed.token) {
        return {
          url: parsed.url,
          token: parsed.token,
          agentId: parsed.agentId,
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
 * Validate auth code format (6-digit alphanumeric)
 */
export function validateAuthCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/i.test(code);
}

/**
 * Exchange auth code for gateway config
 */
export async function exchangeAuthCode(
  code: string,
  pairingServerUrl: string = 'https://pair.clawd.bot'
): Promise<GatewayConfig | null> {
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
      url: data.gatewayUrl,
      token: data.token,
      agentId: data.agentId,
    };
  } catch (e) {
    console.error('[Pairing] Auth code exchange error:', e);
    return null;
  }
}

/**
 * Save session to secure storage
 */
export async function saveSession(config: GatewayConfig): Promise<void> {
  const session: StoredSession = {
    gatewayUrl: config.url,
    token: config.token,
    agentId: config.agentId,
    savedAt: Date.now(),
  };
  
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
}

/**
 * Load session from secure storage
 */
export async function loadSession(): Promise<GatewayConfig | null> {
  try {
    const data = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!data) return null;
    
    const session: StoredSession = JSON.parse(data);
    return {
      url: session.gatewayUrl,
      token: session.token,
      agentId: session.agentId,
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
