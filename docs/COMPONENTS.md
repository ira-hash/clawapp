# Claw Component Library

OpenClaw Design System 기반 재사용 컴포넌트

## 📦 Core Components

### Button
```tsx
<Button 
  title="Submit" 
  onPress={handlePress}
  variant="primary" // primary | secondary | outline | ghost | danger
  size="medium"     // small | medium | large
  icon="send"
  loading={false}
  fullWidth
/>
```

### IconButton
```tsx
<IconButton 
  icon="settings" 
  onPress={handlePress}
  variant="tinted"  // default | filled | tinted
  size="medium"
/>
```

### Input
```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  leftIcon="mail"
  error="Invalid email"
  hint="We'll never share your email"
/>
```

## 👤 Display Components

### Avatar
```tsx
<Avatar
  emoji="🦞"
  // or imageUri="https://..."
  // or name="John" (shows initials)
  size="medium"    // small | medium | large
  showStatus
  isOnline
/>
```

### Badge
```tsx
<Badge count={5} maxCount={99} />
<Badge dot color="#ff5c5c" />
```

### Chip
```tsx
<Chip
  label="React Native"
  selected
  icon="logo-react"
  onPress={handleSelect}
  onRemove={handleRemove}
  size="medium"
  variant="filled"  // filled | outlined
/>
```

### ProgressBar
```tsx
<ProgressBar
  progress={0.7}  // 0 to 1
  height={4}
  color="#ff5c5c"
  animated
/>
```

## 📋 List Components

### ListItem
```tsx
<ListItem
  icon="notifications"
  iconColor="#ff5c5c"
  title="Notifications"
  subtitle="Manage your alerts"
  value="On"
  showChevron
  onPress={handlePress}
/>

<ListItem
  icon="finger-print"
  title="Face ID"
  showSwitch
  switchValue={enabled}
  onSwitchChange={setEnabled}
/>

<ListItem
  icon="trash"
  title="Delete Account"
  destructive
  onPress={handleDelete}
/>
```

### Divider
```tsx
<Divider />
<Divider label="OR" />
<Divider spacing={24} />
```

## 🔔 Feedback Components

### Toast
```tsx
// Wrap app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Use hook
const { showToast } = useToast();
showToast('Message sent!', 'success');
showToast('Error occurred', 'error', 5000);
```

### LoadingSpinner
```tsx
<LoadingSpinner size="medium" message="Loading..." />
<LoadingSpinner fullScreen />
```

### EmptyState
```tsx
<EmptyState
  emoji="📭"
  title="No Messages"
  message="Start a conversation!"
  actionLabel="New Chat"
  onAction={handleNewChat}
/>
```

## 🪟 Modal Components

### ConfirmModal
```tsx
<ConfirmModal
  visible={showConfirm}
  title="Delete Message?"
  message="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  destructive
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

### BottomSheet
```tsx
<BottomSheet
  visible={showSheet}
  onClose={() => setShowSheet(false)}
  title="Options"
  snapPoints={[0.5]}
>
  <ListItem title="Edit" onPress={...} />
  <ListItem title="Share" onPress={...} />
</BottomSheet>
```

### ActionSheet
```tsx
<ActionSheet
  visible={showActions}
  onClose={() => setShowActions(false)}
  title="Photo Options"
  options={[
    { label: 'Take Photo', icon: 'camera', onPress: ... },
    { label: 'Choose from Library', icon: 'images', onPress: ... },
    { label: 'Delete', icon: 'trash', destructive: true, onPress: ... },
  ]}
/>
```

## 🛡️ Utility Components

### ErrorBoundary
```tsx
<ErrorBoundary fallback={<CustomError />}>
  <App />
</ErrorBoundary>
```

### NetworkBanner
```tsx
<NetworkBanner />
// Auto-shows when offline
```

## 💬 Chat Components

Located in `src/components/chat/`:

- **MessageBubble** - 메시지 버블
- **ChatInput** - 입력창
- **SwipeableMessage** - 스와이프 제스처
- **TypingIndicator** - 타이핑 표시
- **DateSeparator** - 날짜 구분선
- **SearchBar** - 검색창
- **ReplyPreview** - 답장 미리보기
- **ScrollToBottomButton** - 스크롤 버튼
- **ChatHeader** - 채팅 헤더
- **AgentProfileModal** - 에이전트 프로필
- **SlashCommands** - 슬래시 커맨드

## 🎨 Theme Usage

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Hello</Text>
    </View>
  );
}
```

## 📐 Design Tokens

```tsx
import { spacing, fontSize, borderRadius, shadows } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,      // 16
    borderRadius: borderRadius.lg, // 12
    ...shadows.md,
  },
  text: {
    fontSize: fontSize.md,    // 15
  },
});
```
