# 🦞 Claw

**The native Clawdbot mobile app for iOS & Android**

Claw is a Clawdbot-native messaging app that provides the best experience for communicating with your AI agent. Unlike generic messengers (Telegram, Slack, Discord), Claw is built from the ground up for AI-first interactions.

## ✨ Features

- **QR Code / Auth Code Pairing** - Connect to your Clawdbot gateway instantly
- **Canvas Rendering** - Native display of rich content, charts, and interactive elements
- **Code Blocks** - Syntax-highlighted code with copy functionality
- **File Preview** - Inline preview of images, PDFs, and documents
- **TTS Playback** - Built-in voice message support
- **Real-time Streaming** - See AI responses as they're generated
- **Thinking Indicator** - Visual feedback during AI reasoning
- **Inline Buttons** - Native button interactions
- **Node Integration** - Camera, location, notifications

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## 📱 Pairing Flow

1. Open Claw app
2. Scan QR code from Clawdbot dashboard, OR
3. Enter 6-digit auth code manually
4. Start chatting!

## 🛠️ Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **WebSocket** for real-time communication
- **Expo Router** for navigation

## 📁 Project Structure

```
src/
├── app/                 # Expo Router screens
│   ├── (tabs)/         # Main tab navigation
│   ├── auth/           # Pairing flow
│   └── chat/           # Chat screens
├── components/         # Reusable UI components
│   ├── chat/           # Chat-specific components
│   ├── canvas/         # Canvas rendering
│   └── common/         # Shared components
├── hooks/              # Custom React hooks
├── services/           # API & WebSocket services
├── stores/             # State management
├── types/              # TypeScript types
└── utils/              # Helper functions
```

## 🔒 Security

- End-to-end encrypted communication
- Secure token storage
- Biometric authentication support

## 📜 License

MIT
