# Claw App Architecture

## Overview

Claw is a React Native (Expo) app for communicating with Clawdbot agents. Built with TypeScript, featuring Telegram-style UX.

## Tech Stack

- **Framework**: React Native + Expo SDK 52
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based)
- **State**: React Context + Local AsyncStorage
- **Styling**: StyleSheet + OpenClaw Design System
- **Gestures**: React Native Gesture Handler
- **Haptics**: Expo Haptics

## Directory Structure

```
src/
├── app/                    # Expo Router screens
│   ├── agents/            # Agent list screen
│   ├── rooms/             # Room list screen
│   ├── chat/              # Chat screen
│   ├── chats/             # All chats tab
│   ├── hub/               # Resources tab
│   ├── settings/          # Settings screen
│   └── auth/              # Pairing flow
│
├── components/            # Reusable UI components
│   ├── chat/             # Chat-specific
│   │   ├── MessageBubble
│   │   ├── ChatInput
│   │   ├── SwipeableMessage
│   │   ├── TypingIndicator
│   │   └── ...
│   ├── Avatar
│   ├── Badge
│   ├── Button
│   ├── Toast
│   └── ...
│
├── contexts/              # React Contexts
│   └── ThemeContext
│
├── hooks/                 # Custom hooks
│   ├── useTheme
│   ├── useDebounce
│   ├── useKeyboard
│   └── useAppState
│
├── services/              # Business logic
│   ├── gateway.ts        # WebSocket connection
│   ├── storage.ts        # AsyncStorage wrapper
│   ├── biometrics.ts     # Face ID / Touch ID
│   ├── notifications.ts  # Push notifications
│   └── messageQueue.ts   # Offline queue
│
├── theme/                 # Design system
│   ├── colors.ts
│   ├── openclaw.ts       # Theme definitions
│   ├── animations.ts
│   └── index.ts
│
├── types/                 # TypeScript definitions
│   └── index.ts
│
├── utils/                 # Utility functions
│   ├── formatters.ts
│   └── validation.ts
│
└── constants/             # App constants
    └── index.ts
```

## Key Patterns

### 1. Theme System

Uses Context for dark/light mode:

```tsx
const { theme, isDark, toggleTheme } = useTheme();
```

### 2. WebSocket Connection

Gateway service manages persistent connection:

```tsx
const gateway = GatewayService.getInstance();
gateway.connect(url, token);
gateway.send({ type: 'message', content: '...' });
```

### 3. Local Storage

All data persisted locally:

- Agents: `@clawapp/agents`
- Rooms: `@clawapp/rooms/{agentId}`
- Messages: `@clawapp/messages/{agentId}/{roomId}`

### 4. Offline Support

MessageQueue service handles offline messages:

```tsx
await messageQueue.enqueue(agentId, roomId, message);
// Auto-sent when online
```

### 5. Component Composition

Barrel exports for clean imports:

```tsx
import { Button, Avatar, Badge, useToast } from '@/components';
```

## Design System (OpenClaw)

### Colors
- Primary: `#ff5c5c` (signature red)
- Dark background: `#12141a`
- Light background: `#ffffff`

### Spacing (8pt grid)
- xs: 4, sm: 8, md: 16, lg: 24, xl: 32

### Typography
- xs: 12, sm: 13, md: 15, lg: 16, xl: 18

## Version History

- v0.1-0.5: Foundation, navigation, basic chat
- v0.6: Markdown, slash commands
- v0.7: Telegram-style UX (swipe, animations)
- v0.8: Security (biometrics, offline queue)
- v0.9: Screen UX improvements
- v1.0-beta: Full feature complete

## Future Roadmap

- [ ] Push notifications (FCM/APNs)
- [ ] Voice messages
- [ ] Canvas rendering
- [ ] App icon & splash screen
- [ ] App Store / Play Store release
