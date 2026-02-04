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
  media?: string; // Image URI or base64
  codeBlocks?: CodeBlock[];
  replyTo?: {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
  };
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

export interface CodeBlock {
  language: string;
  code: string;
}

// Chat Room (Session) Types
export interface ChatRoom {
  id: string;
  name: string;
  emoji: string;
  sessionKey?: string; // Gateway session key
  createdAt: number;
  lastMessageAt?: number;
  lastMessage?: string;
  unreadCount: number;
  isPinned?: boolean;
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
  sessionKey?: string; // Which room this message belongs to
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

// Navigation Types
export type RootStackParamList = {
  AgentList: undefined;
  RoomList: { agentId: string };
  Chat: { agentId: string; roomId: string };
  Pairing: undefined;
  Settings: undefined;
};

// Connection Status
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting' | 'error';

// Message Status
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Button Variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// Re-export new types
export * from './folders';
export * from './translation';
export * from './pinned';
