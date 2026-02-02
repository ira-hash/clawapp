# Changelog

All notable changes to Claw will be documented in this file.

## [1.0.0-beta] - 2026-02-02

### Added

#### Chat Features
- Swipe to reply (Telegram-style)
- Swipe to delete messages
- Message search within chat
- Typing indicator with dot animation
- Message send animation
- Scroll to bottom button
- Per-message timestamps
- Date separators (Today/Yesterday/Date)
- Agent profile modal
- Pull-to-refresh

#### Components (33 total)
- **Core**: Button, IconButton, Input
- **Display**: Avatar, Badge, Chip, ProgressBar, Skeleton
- **List**: ListItem, Divider, AgentListItem
- **Modal**: ConfirmModal, BottomSheet, ActionSheet
- **Feedback**: Toast, LoadingSpinner, EmptyState
- **Utility**: ErrorBoundary, NetworkBanner, RefreshControl, KeyboardAvoiding
- **Navigation**: TabBar
- **Chat**: MessageBubble, ChatInput, SwipeableMessage, TypingIndicator, DateSeparator, SearchBar, ReplyPreview, ScrollToBottomButton, ChatHeader, AgentProfileModal, SlashCommands

#### Hooks (9 total)
- useTheme
- useStorage
- useDebounce
- useKeyboard
- useAppState / useIsForeground
- useNetwork / useIsOnline
- usePrevious
- useInterval

#### Services
- Gateway (WebSocket)
- Storage (AsyncStorage)
- Notifications (Expo)
- Message Queue (Offline support)
- Biometrics (Face ID / Touch ID)
- Haptics

#### Security
- Face ID / Touch ID app lock
- Offline message queue
- Secure token storage

#### Design
- OpenClaw Design System
- Signature red (#ff5c5c)
- Dark / Light mode
- Animation configurations
- Design tokens (spacing, fontSize, borderRadius, shadows)

#### Documentation
- README.md
- ARCHITECTURE.md
- docs/COMPONENTS.md

### Changed
- Improved all screens with Telegram-style UX
- Enhanced search functionality across all list screens
- Better haptic feedback throughout app

## [0.9.0] - 2026-02-02 (earlier)
- Screen UX improvements
- Agent/Room/Chats list enhancements

## [0.8.0] - 2026-02-02 (earlier)
- Security features (biometrics, offline queue)
- Network status banner

## [0.7.0] - 2026-02-01
- Telegram-style chat animations
- Swipe gestures

## [0.6.0] - 2026-02-01
- Markdown rendering
- Slash commands
- Code blocks

## [0.5.0] - 2026-01-31
- Tab navigation
- Multi-agent support

## [0.4.0] - 2026-01-31
- Multi-room chat

## [0.3.0] - 2026-01-30
- Basic chat functionality
- WebSocket connection

## [0.2.0] - 2026-01-30
- Pairing flow (QR + Manual)

## [0.1.0] - 2026-01-29
- Initial project setup
- Expo + TypeScript
