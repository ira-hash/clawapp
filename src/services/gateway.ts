/**
 * Clawdbot Gateway Service
 * 
 * WebSocket client implementing the Gateway Protocol v3
 * https://docs.clawd.bot/gateway/protocol
 * 
 * Supports multiple chat rooms via session labels
 */

import { GatewayConfig, WSMessage } from '../types';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

const PROTOCOL_VERSION = 3;

// Gateway Protocol Types
interface GatewayRequest {
  type: 'req';
  id: string;
  method: string;
  params: any;
}

interface GatewayResponse {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: any;
  error?: { code: string; message: string };
}

interface GatewayEvent {
  type: 'event';
  event: string;
  payload: any;
  seq?: number;
}

type GatewayFrame = GatewayRequest | GatewayResponse | GatewayEvent;

type MessageHandler = (message: WSMessage) => void;
type ConnectionHandler = (connected: boolean) => void;

class GatewayService {
  private ws: WebSocket | null = null;
  private config: GatewayConfig | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();
  private requestId = 0;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private deviceId: string | null = null;
  private isConnected = false;
  private currentRoomId: string | null = null;

  constructor() {
    this.generateDeviceId();
  }

  private async generateDeviceId() {
    try {
      const installId = Application.applicationId || Date.now().toString();
      this.deviceId = `claw-${Platform.OS}-${installId?.slice(0, 8) || Date.now()}`;
    } catch {
      this.deviceId = `claw-${Platform.OS}-${Date.now()}`;
    }
  }

  private nextRequestId(): string {
    return `req-${++this.requestId}`;
  }

  /**
   * Connect to Clawdbot Gateway
   */
  async connect(config: GatewayConfig): Promise<boolean> {
    this.config = config;
    
    return new Promise((resolve, reject) => {
      try {
        let wsUrl = config.url
          .replace('https://', 'wss://')
          .replace('http://', 'ws://');
        
        wsUrl = wsUrl.replace(/\/$/, '');
        
        console.log('[Gateway] Connecting to:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = async () => {
          console.log('[Gateway] WebSocket opened, sending handshake...');
          try {
            await this.sendHandshake();
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.notifyConnectionHandlers(true);
            resolve(true);
          } catch (error) {
            console.error('[Gateway] Handshake failed:', error);
            reject(error);
          }
        };
        
        this.ws.onmessage = (event) => {
          this.handleFrame(event.data);
        };
        
        this.ws.onerror = (error) => {
          console.error('[Gateway] WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onclose = (event) => {
          console.log('[Gateway] Disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.notifyConnectionHandlers(false);
          this.attemptReconnect();
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send connect handshake
   */
  private async sendHandshake(): Promise<void> {
    const appVersion = Application.nativeApplicationVersion || '1.0.0';
    
    const response = await this.sendRequest('connect', {
      minProtocol: PROTOCOL_VERSION,
      maxProtocol: PROTOCOL_VERSION,
      client: {
        id: 'claw-app',
        version: appVersion,
        platform: Platform.OS,
        mode: 'operator',
      },
      role: 'operator',
      scopes: ['operator.read', 'operator.write'],
      caps: [],
      commands: [],
      permissions: {},
      auth: {
        token: this.config?.token,
      },
      locale: 'en-US',
      userAgent: `claw-app/${appVersion} (${Platform.OS})`,
      device: {
        id: this.deviceId,
      },
    });

    if (!response.ok) {
      throw new Error(response.error?.message || 'Handshake failed');
    }

    console.log('[Gateway] Handshake successful:', response.payload?.type);
  }

  /**
   * Handle incoming WebSocket frame
   */
  private handleFrame(data: string): void {
    try {
      const frame: GatewayFrame = JSON.parse(data);
      
      switch (frame.type) {
        case 'res':
          this.handleResponse(frame);
          break;
        case 'event':
          this.handleEvent(frame);
          break;
        default:
          console.log('[Gateway] Unknown frame type:', frame);
      }
    } catch (e) {
      console.error('[Gateway] Failed to parse frame:', e);
    }
  }

  /**
   * Handle response frame
   */
  private handleResponse(response: GatewayResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (pending) {
      this.pendingRequests.delete(response.id);
      if (response.ok) {
        pending.resolve(response);
      } else {
        pending.reject(new Error(response.error?.message || 'Request failed'));
      }
    }
  }

  /**
   * Handle event frame
   */
  private handleEvent(event: GatewayEvent): void {
    console.log('[Gateway] Event:', event.event);
    
    switch (event.event) {
      case 'agent':
        this.handleAgentEvent(event.payload);
        break;
      case 'agent.stream':
        this.handleStreamEvent(event.payload);
        break;
      case 'agent.thinking':
        this.notifyMessageHandlers({
          type: 'thinking',
          sessionKey: this.currentRoomId || undefined,
          payload: { isThinking: true, content: event.payload?.content },
        });
        break;
      case 'tick':
        // Heartbeat, ignore
        break;
      default:
        console.log('[Gateway] Unhandled event:', event.event);
    }
  }

  /**
   * Handle agent response event
   */
  private handleAgentEvent(payload: any): void {
    if (payload.status === 'streaming') {
      this.notifyMessageHandlers({
        type: 'typing',
        sessionKey: this.currentRoomId || undefined,
        payload: { isTyping: true },
      });
    } else if (payload.status === 'complete' || payload.status === 'done') {
      this.notifyMessageHandlers({
        type: 'message',
        sessionKey: this.currentRoomId || undefined,
        payload: {
          content: payload.content || payload.text || payload.summary,
          buttons: payload.buttons,
          media: payload.media,
        },
      });
    } else if (payload.content || payload.text) {
      this.notifyMessageHandlers({
        type: 'message',
        sessionKey: this.currentRoomId || undefined,
        payload: {
          content: payload.content || payload.text,
          buttons: payload.buttons,
          media: payload.media,
        },
      });
    }
  }

  /**
   * Handle streaming event
   */
  private handleStreamEvent(payload: any): void {
    this.notifyMessageHandlers({
      type: 'stream',
      sessionKey: this.currentRoomId || undefined,
      payload: {
        delta: payload.delta || payload.chunk || '',
      },
    });
  }

  /**
   * Send a request and wait for response
   */
  private sendRequest(method: string, params: any): Promise<GatewayResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'));
        return;
      }

      const id = this.nextRequestId();
      const request: GatewayRequest = {
        type: 'req',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });
      
      // Timeout after 30s
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);

      this.ws.send(JSON.stringify(request));
    });
  }

  /**
   * Disconnect from Gateway
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.config = null;
    this.isConnected = false;
    this.pendingRequests.clear();
    this.currentRoomId = null;
  }

  /**
   * Set current room for message routing
   */
  setCurrentRoom(roomId: string | null): void {
    this.currentRoomId = roomId;
  }

  /**
   * Get current room ID
   */
  getCurrentRoom(): string | null {
    return this.currentRoomId;
  }

  /**
   * Send a message to the agent
   * Uses sessionKey/label for room-specific context
   */
  async sendMessage(content: string, roomId?: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }
    
    const effectiveRoomId = roomId || this.currentRoomId || 'default';
    
    try {
      const response = await this.sendRequest('agent', {
        message: content,
        // Use room ID as session label for context separation
        label: `claw-room-${effectiveRoomId}`,
        idempotencyKey: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });
      
      if (!response.ok) {
        console.error('[Gateway] Send failed:', response.error);
      }
    } catch (error) {
      console.error('[Gateway] Send error:', error);
      throw error;
    }
  }

  /**
   * Send a button callback
   */
  async sendButtonCallback(callbackData: string, roomId?: string): Promise<void> {
    await this.sendMessage(callbackData, roomId);
  }

  /**
   * Subscribe to messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  private notifyMessageHandlers(message: WSMessage): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  private attemptReconnect(): void {
    if (!this.config || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[Gateway] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.config) {
        this.connect(this.config).catch(console.error);
      }
    }, delay);
  }
}

// Singleton instance
export const gateway = new GatewayService();
