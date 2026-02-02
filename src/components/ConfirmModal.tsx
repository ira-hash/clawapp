/**
 * Confirm Modal Component
 * 
 * 확인/취소 모달
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { theme } = useTheme();

  const handleConfirm = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modal, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
              
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { backgroundColor: theme.surface }]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.buttonText, { color: theme.text }]}>{cancelText}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.confirmButton, 
                    { backgroundColor: destructive ? theme.error : theme.primary }
                  ]}
                  onPress={handleConfirm}
                >
                  <Text style={[styles.buttonText, { color: '#FFF' }]}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
