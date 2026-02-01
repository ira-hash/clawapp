/**
 * Clawdbot Gateway Service
 * 
 * Handles WebSocket connection and communication with Clawdbot Gateway
 */

import { GatewayConfig, Message, WSMessage } from '../types';

type MessageHandler = (message: WSMessage) => void;
type ConnectionHandler = (connected: boolean) => void;

class GatewayService {
  private ws: WebSocket | null = null;
  private config: GatewayConfig | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Connect to Clawdbot Gateway
   */
  async connect(config: GatewayConfig): Promise<boolean> {
    this.config = config;
    
    return new Promise((resolve, reject) => {
      try {
        // Convert HTTP URL to WebSocket URL
        const wsUrl = config.url
          .replace('https://', 'wss://')
          .replace('http://', 'ws://');
        
        const fullUrl = `${wsUrl}/ws?token=${config.token}`;
        
        this.ws = new WebSocket(fullUrl);
        
        this.ws.onopen = () => {
          console.log('[Gateway] Connected');
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve(true);
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.notifyMessageHandlers(message);
          } catch (e) {
            console.error('[Gateway] Failed to parse message:', e);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('[Gateway] WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onclose = (event) => {
          console.log('[Gateway] Disconnected:', event.code, event.reason);
          this.notifyConnectionHandlers(false);
          this.attemptReconnect();
        };
        
      } catch (error) {
        reject(error);
      }
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
  }

  /**
   * Send a message to the agent
   */
  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[Gateway] Not connected');
      return;
    }
    
    const message = {
      type: 'message',
      content,
      timestamp: Date.now(),
    };
    
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Send a button callback
   */
  sendButtonCallback(callbackData: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[Gateway] Not connected');
      return;
    }
    
    const message = {
      type: 'callback',
      data: callbackData,
      timestamp: Date.now(),
    };
    
    this.ws.send(JSON.stringify(message));
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
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
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
