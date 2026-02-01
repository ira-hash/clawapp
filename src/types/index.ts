// Clawdbot Gateway Types

export interface GatewayConfig {
  url: string;
  token: string;
  agentId?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error' | 'streaming';
  replyTo?: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  thinking?: boolean;
  thinkingContent?: string;
  buttons?: InlineButton[][];
  canvas?: CanvasContent;
  media?: MediaAttachment[];
  codeBlocks?: CodeBlock[];
}

export interface InlineButton {
  text: string;
  callback_data: string;
  url?: string;
}

export interface CanvasContent {
  type: 'html' | 'image' | 'chart';
  content: string;
  width?: number;
  height?: number;
  title?: string;
}

export interface MediaAttachment {
  type: 'image' | 'audio' | 'video' | 'file' | 'voice';
  url: string;
  mimeType?: string;
  filename?: string;
  size?: number;
  duration?: number;  // For audio/video
  thumbnail?: string;
}

export interface CodeBlock {
  language: string;
  code: string;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  emoji?: string;
  model?: string;
  gateway: GatewayConfig;
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
  createdAt: number;
  lastActiveAt?: number;
}

// Pairing Types
export interface PairingCode {
  code: string;
  expiresAt: number;
  gatewayUrl: string;
}

export interface PairingQR {
  url: string;
}

// WebSocket Types
export interface WSMessage {
  type: 'message' | 'typing' | 'thinking' | 'stream' | 'buttons' | 'canvas' | 'error' | 'connected' | 'disconnected';
  payload: any;
}

// Session Types
export interface Session {
  id: string;
  gatewayUrl: string;
  token: string;
  agentId: string;
  connectedAt: number;
  lastMessageAt?: number;
}

// App State Types
export interface AppState {
  agents: Agent[];
  currentAgentId: string | null;
  messages: Record<string, Message[]>;  // agentId -> messages
  isConnected: boolean;
}

// ClawdHub Types
export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  author: string;
  version: string;
  rating: number;
  installs: number;
  category: string;
  tags: string[];
}

// Settings Types
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  haptics: boolean;
  biometricLock: boolean;
}
