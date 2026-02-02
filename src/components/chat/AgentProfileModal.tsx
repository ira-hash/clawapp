/**
 * Agent Profile Modal
 * 
 * 텔레그램 스타일 프로필 모달
 * Features:
 * - 에이전트 정보 표시
 * - 설정 바로가기
 * - 채팅 통계
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface AgentProfileModalProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  emoji: string;
  isConnected: boolean;
  messageCount?: number;
  createdAt?: number;
  onClearHistory?: () => void;
}

export function AgentProfileModal({
  visible,
  onClose,
  name,
  emoji,
  isConnected,
  messageCount = 0,
  createdAt,
  onClearHistory,
}: AgentProfileModalProps) {
  const { theme } = useTheme();

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Room Info</Text>
                <View style={styles.placeholder} />
              </View>

              <ScrollView style={styles.content}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                  <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
                    <Text style={styles.avatarEmoji}>{emoji}</Text>
                  </View>
                  <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
                  <View style={styles.statusRow}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: isConnected ? theme.success : theme.textTertiary }
                    ]} />
                    <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                      {isConnected ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <View style={styles.statRow}>
                    <Ionicons name="chatbubbles-outline" size={20} color={theme.textSecondary} />
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Messages</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>{messageCount}</Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: theme.border }]} />
                  <View style={styles.statRow}>
                    <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Created</Text>
                    <Text style={[styles.statValue, { color: theme.text }]}>{formatDate(createdAt)}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <TouchableOpacity 
                    style={styles.actionRow}
                    onPress={() => {
                      onClearHistory?.();
                      onClose();
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.error} />
                    <Text style={[styles.actionText, { color: theme.error }]}>Clear Chat History</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 15,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginLeft: 46,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
