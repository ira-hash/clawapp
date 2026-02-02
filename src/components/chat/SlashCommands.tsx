/**
 * Slash Commands Component
 * 
 * 텔레그램 스타일 슬래시 커맨드 자동완성
 * Features:
 * - 커맨드 필터링
 * - 애니메이션
 * - 카테고리 지원
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface Command {
  command: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  category?: 'status' | 'control' | 'info';
}

const COMMANDS: Command[] = [
  // Status commands
  { command: '/status', description: 'Show session status & usage', icon: 'stats-chart', category: 'status' },
  { command: '/tokens', description: 'Show token usage', icon: 'calculator', category: 'status' },
  { command: '/ping', description: 'Check connection latency', icon: 'pulse', category: 'status' },
  
  // Control commands  
  { command: '/reasoning', description: 'Toggle reasoning mode', icon: 'bulb', category: 'control' },
  { command: '/reasoning on', description: 'Enable reasoning mode', icon: 'bulb', category: 'control' },
  { command: '/reasoning off', description: 'Disable reasoning mode', icon: 'bulb-outline', category: 'control' },
  { command: '/model', description: 'Show/change model', icon: 'hardware-chip', category: 'control' },
  { command: '/clear', description: 'Clear conversation', icon: 'trash-outline', category: 'control' },
  
  // Info commands
  { command: '/help', description: 'Show available commands', icon: 'help-circle', category: 'info' },
  { command: '/version', description: 'Show Clawdbot version', icon: 'information-circle', category: 'info' },
  { command: '/agents', description: 'List available agents', icon: 'people', category: 'info' },
  { command: '/skills', description: 'List installed skills', icon: 'extension-puzzle', category: 'info' },
];

interface SlashCommandsProps {
  input: string;
  onSelect: (command: string) => void;
  visible: boolean;
}

export function SlashCommands({ input, onSelect, visible }: SlashCommandsProps) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(20);
      opacityAnim.setValue(0);
    }
  }, [visible, slideAnim, opacityAnim]);

  if (!visible) return null;

  // Filter commands based on input
  const filterText = input.toLowerCase();
  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.command.toLowerCase().startsWith(filterText) ||
    cmd.description.toLowerCase().includes(filterText.slice(1))
  );

  if (filteredCommands.length === 0) return null;

  const handleSelect = async (command: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(command);
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'status': return theme.info;
      case 'control': return theme.primary;
      case 'info': return theme.success;
      default: return theme.primary;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.surface, 
          borderColor: theme.border,
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <ScrollView 
        horizontal={false} 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        keyboardShouldPersistTaps="always"
      >
        {filteredCommands.map((cmd, index) => {
          const categoryColor = getCategoryColor(cmd.category);
          
          return (
            <TouchableOpacity
              key={cmd.command}
              style={[
                styles.commandItem,
                index < filteredCommands.length - 1 && { 
                  borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderBottomColor: theme.border 
                }
              ]}
              onPress={() => handleSelect(cmd.command)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
                <Ionicons name={cmd.icon} size={18} color={categoryColor} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.commandText, { color: theme.text }]}>
                  {cmd.command}
                </Text>
                <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
                  {cmd.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    maxHeight: 240,
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  scrollView: {
    maxHeight: 240,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  commandText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: 13,
    marginTop: 2,
  },
});
