# 🦞 Claw

**The native Clawdbot mobile app for iOS & Android**

Claw is a Clawdbot-native messaging app designed with **Telegram-style UX** for the best AI agent communication experience. Built from the ground up for AI-first interactions.

## ✨ Features

### 💬 Chat Experience
- **Swipe to Reply** - Telegram-style swipe gestures
- **Swipe to Delete** - Quick message removal
- **Message Search** - Find messages instantly
- **Typing Indicators** - Animated dot bounce
- **Read Status** - Message delivery & read receipts
- **Time Stamps** - Per-message timestamps
- **Date Separators** - Today/Yesterday/Date grouping

### 🎨 Design
- **OpenClaw Design System** - Signature red (#ff5c5c)
- **Dark & Light Mode** - System preference detection
- **Smooth Animations** - Spring physics throughout
- **Haptic Feedback** - Tactile response

### 🔐 Security
- **Face ID / Touch ID** - Biometric app lock
- **Secure Storage** - Encrypted token storage
- **Offline Queue** - Messages saved when offline

### 🤖 AI Features
- **Multi-Agent Support** - Connect multiple Clawdbot instances
- **Multi-Room Chats** - Organize conversations by topic
- **Canvas Rendering** - Rich content display
- **Code Blocks** - Syntax highlighting + copy
- **Inline Buttons** - Interactive responses
- **Slash Commands** - Quick command access
- **Thinking Indicator** - Visual AI reasoning feedback
- **Real-time Streaming** - Watch responses generate

### 📱 Platform Features
- **Push Notifications** - FCM/APNs support
- **QR Code Pairing** - Instant connection
- **Pull to Refresh** - Update message lists
- **Network Status** - Connection indicator

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 📱 Pairing

1. Open Claw app
2. Tap **"Add Agent"**
3. **Scan QR** from Clawdbot dashboard, OR
4. **Manual entry**: Gateway URL + Token
5. Start chatting! 🎉

## 🛠️ Tech Stack

- **React Native** + Expo SDK 52
- **TypeScript** - Full type safety
- **Gesture Handler** - Swipe gestures
- **Expo Local Auth** - Biometrics
- **Expo Haptics** - Tactile feedback
- **AsyncStorage** - Local persistence

## 📁 Structure

```
src/
├── app/                 # Screens
│   ├── agents/         # Agent list
│   ├── rooms/          # Room list
│   ├── chat/           # Chat screen
│   ├── chats/          # All chats tab
│   ├── hub/            # Resources & skills
│   ├── settings/       # App settings
│   └── auth/           # Pairing flow
├── components/
│   ├── chat/           # Chat components
│   │   ├── MessageBubble
│   │   ├── ChatInput
│   │   ├── SwipeableMessage
│   │   ├── TypingIndicator
│   │   ├── SearchBar
│   │   └── ...
│   └── ...
├── services/           # API & business logic
│   ├── gateway.ts      # WebSocket connection
│   ├── storage.ts      # Local storage
│   ├── biometrics.ts   # Face ID / Touch ID
│   └── notifications.ts
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── theme/              # OpenClaw design tokens
└── types/              # TypeScript definitions
```

## 📋 Version History

- **v1.0-beta** - Full Telegram-style UX
- **v0.9** - Screen UX improvements
- **v0.8** - Security features
- **v0.7** - Chat animations
- **v0.6** - Markdown & slash commands
- **v0.5** - Tab navigation
- **v0.4** - Multi-agent support
- **v0.3** - Multi-room chat

## 🔒 Privacy

- All data stored locally on device
- No analytics or tracking
- Gateway connection is direct (no middle server)
- Biometric data never leaves device

## 📜 License

MIT © Clawdbot

---

Made with 🦞 for the Clawdbot community
