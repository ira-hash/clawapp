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
  status?: 'sending' | 'sent' | 'error';
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
}

export interface CanvasContent {
  type: 'html' | 'image' | 'chart';
  content: string;
  width?: number;
  height?: number;
}

export interface MediaAttachment {
  type: 'image' | 'audio' | 'video' | 'file';
  url: string;
  mimeType?: string;
  filename?: string;
  size?: number;
}

export interface CodeBlock {
  language: string;
  code: string;
}

// Pairing Types
export interface PairingCode {
  code: string;
  expiresAt: number;
  gatewayUrl: string;
}

export interface PairingQR {
  url: string;  // Full gateway URL with token
}

// WebSocket Types
export interface WSMessage {
  type: 'message' | 'typing' | 'thinking' | 'stream' | 'buttons' | 'canvas' | 'error';
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
  session: Session | null;
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  isThinking: boolean;
}
