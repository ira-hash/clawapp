/**
 * Markdown Renderer Component
 * 
 * Renders markdown content with support for:
 * - **bold**, *italic*, ~~strikethrough~~
 * - `inline code` and ```code blocks```
 * - Links [text](url)
 * - Lists (- item, 1. item)
 * - Headers (#, ##, ###)
 * - Blockquotes (>)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

interface Token {
  type: string;
  content: string;
  language?: string;
  url?: string;
  items?: string[];
  level?: number;
}

export function MarkdownRenderer({ content, isUser = false }: MarkdownRendererProps) {
  const { theme } = useTheme();
  const textColor = isUser ? theme.messageTextUser : theme.messageTextAssistant;

  // Parse markdown into tokens
  const parseMarkdown = (text: string): Token[] => {
    const tokens: Token[] = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code block
      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        tokens.push({
          type: 'codeblock',
          content: codeLines.join('\n'),
          language,
        });
        i++;
        continue;
      }

      // Header
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        tokens.push({
          type: 'header',
          level: headerMatch[1].length,
          content: headerMatch[2],
        });
        i++;
        continue;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        tokens.push({
          type: 'blockquote',
          content: line.slice(2),
        });
        i++;
        continue;
      }

      // Unordered list
      if (line.match(/^[-*]\s+/)) {
        const items: string[] = [];
        while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
          items.push(lines[i].replace(/^[-*]\s+/, ''));
          i++;
        }
        tokens.push({
          type: 'ul',
          content: '',
          items,
        });
        continue;
      }

      // Ordered list
      if (line.match(/^\d+\.\s+/)) {
        const items: string[] = [];
        while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
          items.push(lines[i].replace(/^\d+\.\s+/, ''));
          i++;
        }
        tokens.push({
          type: 'ol',
          content: '',
          items,
        });
        continue;
      }

      // Regular paragraph
      if (line.trim()) {
        tokens.push({
          type: 'paragraph',
          content: line,
        });
      } else if (tokens.length > 0 && tokens[tokens.length - 1].type !== 'break') {
        tokens.push({ type: 'break', content: '' });
      }
      i++;
    }

    return tokens;
  };

  // Render inline markdown (bold, italic, code, links)
  const renderInline = (text: string, key: number = 0): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let elementKey = key;

    const patterns = [
      // Bold **text** or __text__
      { regex: /\*\*(.+?)\*\*|__(.+?)__/, type: 'bold' },
      // Italic *text* or _text_
      { regex: /\*(.+?)\*|_(.+?)_/, type: 'italic' },
      // Strikethrough ~~text~~
      { regex: /~~(.+?)~~/, type: 'strike' },
      // Inline code `code`
      { regex: /`([^`]+)`/, type: 'code' },
      // Link [text](url)
      { regex: /\[([^\]]+)\]\(([^)]+)\)/, type: 'link' },
    ];

    while (remaining) {
      let earliestMatch: { index: number; match: RegExpExecArray; type: string } | null = null;

      for (const pattern of patterns) {
        const match = pattern.regex.exec(remaining);
        if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
          earliestMatch = { index: match.index, match, type: pattern.type };
        }
      }

      if (earliestMatch) {
        // Add text before match
        if (earliestMatch.index > 0) {
          elements.push(
            <Text key={elementKey++} style={{ color: textColor }}>
              {remaining.slice(0, earliestMatch.index)}
            </Text>
          );
        }

        const { match, type } = earliestMatch;
        const content = match[1] || match[2];

        switch (type) {
          case 'bold':
            elements.push(
              <Text key={elementKey++} style={[styles.bold, { color: textColor }]}>
                {content}
              </Text>
            );
            break;
          case 'italic':
            elements.push(
              <Text key={elementKey++} style={[styles.italic, { color: textColor }]}>
                {content}
              </Text>
            );
            break;
          case 'strike':
            elements.push(
              <Text key={elementKey++} style={[styles.strikethrough, { color: textColor }]}>
                {content}
              </Text>
            );
            break;
          case 'code':
            elements.push(
              <Text key={elementKey++} style={[styles.inlineCode, { backgroundColor: theme.codeBackground, color: theme.codeText }]}>
                {content}
              </Text>
            );
            break;
          case 'link':
            const url = match[2];
            elements.push(
              <Text
                key={elementKey++}
                style={[styles.link, { color: theme.primary }]}
                onPress={() => Linking.openURL(url)}
              >
                {content}
              </Text>
            );
            break;
        }

        remaining = remaining.slice(earliestMatch.index + match[0].length);
      } else {
        // No more matches, add remaining text
        elements.push(
          <Text key={elementKey++} style={{ color: textColor }}>
            {remaining}
          </Text>
        );
        break;
      }
    }

    return elements;
  };

  // Copy code block
  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Render a single token
  const renderToken = (token: Token, index: number): React.ReactNode => {
    switch (token.type) {
      case 'codeblock':
        return (
          <View key={index} style={[styles.codeBlock, { backgroundColor: theme.codeBackground }]}>
            <View style={styles.codeHeader}>
              {token.language && (
                <Text style={[styles.codeLanguage, { color: theme.textSecondary }]}>
                  {token.language}
                </Text>
              )}
              <Pressable onPress={() => handleCopyCode(token.content)} style={styles.copyButton}>
                <Text style={[styles.copyText, { color: theme.textSecondary }]}>Copy</Text>
              </Pressable>
            </View>
            <Text style={[styles.codeText, { color: theme.codeText }]}>
              {token.content}
            </Text>
          </View>
        );

      case 'header':
        const headerSizes = [24, 22, 20, 18, 16, 14];
        const fontSize = headerSizes[Math.min((token.level || 1) - 1, 5)];
        return (
          <Text key={index} style={[styles.header, { color: textColor, fontSize }]}>
            {renderInline(token.content)}
          </Text>
        );

      case 'blockquote':
        return (
          <View key={index} style={[styles.blockquote, { borderLeftColor: theme.primary }]}>
            <Text style={[styles.blockquoteText, { color: theme.textSecondary }]}>
              {renderInline(token.content)}
            </Text>
          </View>
        );

      case 'ul':
        return (
          <View key={index} style={styles.list}>
            {token.items?.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={[styles.bullet, { color: textColor }]}>•</Text>
                <Text style={[styles.listText, { color: textColor }]}>
                  {renderInline(item)}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'ol':
        return (
          <View key={index} style={styles.list}>
            {token.items?.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={[styles.bullet, { color: textColor }]}>{i + 1}.</Text>
                <Text style={[styles.listText, { color: textColor }]}>
                  {renderInline(item)}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'paragraph':
        return (
          <Text key={index} style={[styles.paragraph, { color: textColor }]}>
            {renderInline(token.content)}
          </Text>
        );

      case 'break':
        return <View key={index} style={styles.lineBreak} />;

      default:
        return null;
    }
  };

  const tokens = parseMarkdown(content);

  return (
    <View style={styles.container}>
      {tokens.map((token, index) => renderToken(token, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No padding - bubble handles that
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  link: {
    textDecorationLine: 'underline',
  },
  codeBlock: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  codeLanguage: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  copyButton: {
    padding: 4,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  header: {
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginVertical: 8,
  },
  blockquoteText: {
    fontStyle: 'italic',
    fontSize: 15,
  },
  list: {
    marginVertical: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  bullet: {
    width: 20,
    fontSize: 16,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  lineBreak: {
    height: 8,
  },
});
