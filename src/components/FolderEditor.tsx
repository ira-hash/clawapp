/**
 * FolderEditor Component
 * 
 * 폴더 생성/편집 모달
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { ChatFolder, FolderFilter } from '../types/folders';
import {
  createFolder,
  updateFolder,
  deleteFolder,
  loadFolders,
} from '../services/FolderService';
import { loadAgents, StoredAgent } from '../services/storage';
import { spacing, fontSize, borderRadius } from '../theme';

interface FolderEditorProps {
  visible: boolean;
  folder?: ChatFolder | null;  // null = 새 폴더 생성
  onClose: () => void;
  onSave?: () => void;
}

const EMOJI_OPTIONS = ['📁', '💬', '📌', '🔔', '⭐', '💼', '🎮', '🎨', '📚', '🏠', '💡', '🔥', '❤️', '🤖', '👥', '📱'];
const COLOR_OPTIONS = ['#007AFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5856D6', '#AF52DE', '#FF2D55', '#A2845E'];

export function FolderEditor({ visible, folder, onClose, onSave }: FolderEditorProps) {
  const { theme, isDark } = useTheme();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [color, setColor] = useState('#007AFF');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterPinned, setFilterPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAgentList();
      if (folder) {
        // 편집 모드
        setName(folder.name);
        setEmoji(folder.emoji);
        setColor(folder.color);
        setSelectedAgents(folder.filter.agentIds || []);
        setFilterUnread(folder.filter.hasUnread || false);
        setFilterPinned(folder.filter.isPinned || false);
      } else {
        // 새 폴더
        resetForm();
      }
    }
  }, [visible, folder]);

  const loadAgentList = async () => {
    const loaded = await loadAgents();
    setAgents(loaded);
  };

  const resetForm = () => {
    setName('');
    setEmoji('📁');
    setColor('#007AFF');
    setSelectedAgents([]);
    setFilterUnread(false);
    setFilterPinned(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const filter: FolderFilter = {};
      
      if (selectedAgents.length > 0) {
        filter.agentIds = selectedAgents;
      }
      if (filterUnread) {
        filter.hasUnread = true;
      }
      if (filterPinned) {
        filter.isPinned = true;
      }

      if (folder) {
        // 편집
        await updateFolder(folder.id, { name, emoji, color, filter });
      } else {
        // 새 폴더
        await createFolder(name, emoji, color, filter);
      }

      onSave?.();
      onClose();
    } catch (e) {
      console.error('[FolderEditor] Save failed:', e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!folder) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      await deleteFolder(folder.id);
      onSave?.();
      onClose();
    } catch (e) {
      console.error('[FolderEditor] Delete failed:', e);
    }
  };

  const toggleAgent = (agentId: string) => {
    Haptics.selectionAsync();
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {folder ? 'Edit Folder' : 'New Folder'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={isLoading || !name.trim()}
          >
            <Text style={[
              styles.headerButtonText,
              { color: (!name.trim() || isLoading) ? theme.textTertiary : theme.primary }
            ]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preview */}
          <View style={[styles.previewContainer, { backgroundColor: theme.surface }]}>
            <View style={[styles.previewFolder, { backgroundColor: color + '20' }]}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
            </View>
            <Text style={[styles.previewName, { color: theme.text }]}>
              {name || 'Folder Name'}
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>NAME</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter folder name"
              placeholderTextColor={theme.textTertiary}
              maxLength={30}
            />
          </View>

          {/* Emoji Picker */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ICON</Text>
            <View style={styles.optionGrid}>
              {EMOJI_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.emojiOption,
                    { backgroundColor: theme.surface },
                    emoji === e && { borderColor: theme.primary, borderWidth: 2 },
                  ]}
                  onPress={() => { setEmoji(e); Haptics.selectionAsync(); }}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Picker */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>COLOR</Text>
            <View style={styles.optionGrid}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    color === c && styles.colorOptionSelected,
                  ]}
                  onPress={() => { setColor(c); Haptics.selectionAsync(); }}
                >
                  {color === c && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filters */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>FILTERS</Text>
            
            <TouchableOpacity
              style={[styles.filterRow, { backgroundColor: theme.surface }]}
              onPress={() => { setFilterUnread(!filterUnread); Haptics.selectionAsync(); }}
            >
              <Ionicons
                name={filterUnread ? 'checkbox' : 'square-outline'}
                size={22}
                color={filterUnread ? theme.primary : theme.textSecondary}
              />
              <Text style={[styles.filterText, { color: theme.text }]}>Unread only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterRow, { backgroundColor: theme.surface }]}
              onPress={() => { setFilterPinned(!filterPinned); Haptics.selectionAsync(); }}
            >
              <Ionicons
                name={filterPinned ? 'checkbox' : 'square-outline'}
                size={22}
                color={filterPinned ? theme.primary : theme.textSecondary}
              />
              <Text style={[styles.filterText, { color: theme.text }]}>Pinned chats only</Text>
            </TouchableOpacity>
          </View>

          {/* Agent Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              INCLUDE AGENTS {selectedAgents.length > 0 ? `(${selectedAgents.length})` : '(All)'}
            </Text>
            {agents.map((agent) => (
              <TouchableOpacity
                key={agent.id}
                style={[styles.agentRow, { backgroundColor: theme.surface }]}
                onPress={() => toggleAgent(agent.id)}
              >
                <Text style={styles.agentEmoji}>{agent.emoji}</Text>
                <Text style={[styles.agentName, { color: theme.text }]}>{agent.name}</Text>
                <Ionicons
                  name={selectedAgents.includes(agent.id) ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={selectedAgents.includes(agent.id) ? theme.primary : theme.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Delete Button */}
          {folder && (
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: theme.error + '15' }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color={theme.error} />
              <Text style={[styles.deleteText, { color: theme.error }]}>Delete Folder</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  previewContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  previewFolder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  previewEmoji: {
    fontSize: 32,
  },
  previewName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  input: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    fontSize: fontSize.md,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  agentEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  agentName: {
    fontSize: fontSize.md,
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  deleteText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
