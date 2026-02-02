# Contributing to Claw

Thank you for your interest in contributing to Claw! 🦞

## Development Setup

```bash
# Clone the repository
git clone https://github.com/clawdbot/claw.git
cd claw

# Install dependencies
npm install

# Start development server
npx expo start
```

## Project Structure

```
src/
├── app/           # Screens (Expo Router style)
├── components/    # Reusable UI components
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── services/      # Business logic
├── theme/         # Design system
├── types/         # TypeScript definitions
├── utils/         # Utility functions
└── constants/     # App constants
```

## Code Style

- **TypeScript**: All code must be typed
- **Components**: Functional components with hooks
- **Styling**: StyleSheet (no inline styles)
- **Naming**: PascalCase for components, camelCase for functions/variables

## Component Guidelines

### Creating a New Component

1. Create file in `src/components/`
2. Add JSDoc comment at top
3. Export from `src/components/index.ts`
4. Add usage example to `docs/COMPONENTS.md`

```tsx
/**
 * MyComponent
 * 
 * Brief description
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface MyComponentProps {
  // props
}

export function MyComponent({ ...props }: MyComponentProps) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // styles
  },
});
```

### Using Theme

Always use theme colors for dynamic theming:

```tsx
const { theme, isDark } = useTheme();

<View style={{ backgroundColor: theme.background }}>
  <Text style={{ color: theme.text }}>Hello</Text>
</View>
```

### Using Design Tokens

```tsx
import { spacing, fontSize, borderRadius } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,      // 16
    borderRadius: borderRadius.lg, // 12
  },
  text: {
    fontSize: fontSize.md,    // 15
  },
});
```

## Commit Messages

Follow conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open Pull Request

## Testing

```bash
# Type check
npx tsc --noEmit

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Questions?

- Open an issue on GitHub
- Join our Discord: https://discord.com/invite/clawd

---

Made with 🦞 by the Clawdbot community
