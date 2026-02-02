/**
 * Slash Commands Component
 * 
 * Shows autocomplete suggestions when user types /
 * Common Clawdbot commands:
 * - /status - Show session status
 * - /reasoning - Toggle reasoning mode
 * - /model - Show/change model
 * - /help - Show help
 * - /clear - Clear conversation
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface Command {
  command: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const COMMANDS: Command[] = [
  { command: '/status', description: 'Show session status & usage', icon: 'stats-chart' },
  { command: '/reasoning', description: 'Toggle reasoning mode', icon: 'bulb' },
  { command: '/reasoning on', description: 'Enable reasoning mode', icon: 'bulb' },
  { command: '/reasoning off', description: 'Disable reasoning mode', icon: 'bulb-outline' },
  { command: '/model', description: 'Show current model', icon: 'hardware-chip' },
  { command: '/help', description: 'Show available commands', icon: 'help-circle' },
  { command: '/version', description: 'Show Clawdbot version', icon: 'information-circle' },
  { command: '/ping', description: 'Check connection latency', icon: 'pulse' },
  { command: '/tokens', description: 'Show token usage', icon: 'calculator' },
];

interface SlashCommandsProps {
  input: string;
  onSelect: (command: string) => void;
  visible: boolean;
}

export function SlashCommands({ input, onSelect, visible }: SlashCommandsProps) {
  const { theme } = useTheme();

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

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <ScrollView 
        horizontal={false} 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        keyboardShouldPersistTaps="always"
      >
        {filteredCommands.map((cmd, index) => (
          <TouchableOpacity
            key={cmd.command}
            style={[
              styles.commandItem,
              index < filteredCommands.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
            ]}
            onPress={() => handleSelect(cmd.command)}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name={cmd.icon} size={18} color={theme.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.commandText, { color: theme.text }]}>
                {cmd.command}
              </Text>
              <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
                {cmd.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    maxHeight: 200,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  commandText: {
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 13,
    marginTop: 2,
  },
});
