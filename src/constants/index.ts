/**
 * App Constants
 */

// App Info
export const APP_NAME = 'Claw';
export const APP_VERSION = '1.0.0';
export const APP_BUILD = '1';

// API
export const DEFAULT_WS_PORT = 18789;
export const RECONNECT_INTERVAL = 3000; // ms
export const MAX_RECONNECT_ATTEMPTS = 5;
export const MESSAGE_TIMEOUT = 30000; // ms

// UI
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_ROOM_NAME_LENGTH = 30;
export const MAX_AGENT_NAME_LENGTH = 50;
export const TYPING_INDICATOR_TIMEOUT = 3000;
export const SCROLL_THRESHOLD = 200; // px from bottom

// Storage Keys
export const STORAGE_KEYS = {
  AGENTS: '@clawapp/agents',
  ROOMS_PREFIX: '@clawapp/rooms/',
  MESSAGES_PREFIX: '@clawapp/messages/',
  SETTINGS: '@clawapp/settings',
  THEME: '@clawapp/theme',
  BIOMETRIC_ENABLED: '@clawapp/biometric_enabled',
  MESSAGE_QUEUE: '@clawapp/message_queue',
  NOTIFICATION_ENABLED: '@clawapp/notifications_enabled',
  PUSH_TOKEN: '@clawapp/push_token',
} as const;

// Room Emojis
export const ROOM_EMOJIS = [
  '💬', '📝', '🔍', '💡', '🚀', '🎯', 
  '📊', '🛠️', '🎨', '📚', '🎮', '🎵',
  '📱', '💼', '🏠', '🌟', '🔥', '💎',
];

// Agent Emojis
export const AGENT_EMOJIS = [
  '🤖', '🦞', '🐙', '🦊', '🐱', '🐶',
  '🦁', '🐻', '🐼', '🦄', '🐲', '👾',
];

// Links
export const LINKS = {
  DOCS: 'https://docs.clawd.bot',
  GITHUB: 'https://github.com/clawdbot/clawdbot',
  DISCORD: 'https://discord.com/invite/clawd',
  SKILLS: 'https://clawdhub.com',
  ISSUES: 'https://github.com/clawdbot/clawdbot/issues/new',
};
