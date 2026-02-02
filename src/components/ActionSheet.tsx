/**
 * Action Sheet Component
 * 
 * iOS 스타일 액션 시트
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';

export interface ActionSheetOption {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
}

export function ActionSheet({
  visible,
  onClose,
  title,
  message,
  options,
  cancelLabel = 'Cancel',
}: ActionSheetProps) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 12,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = async (option: ActionSheetOption) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    // Small delay for animation
    setTimeout(() => option.onPress(), 200);
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Actions Group */}
        <View style={[styles.actionsGroup, { backgroundColor: theme.surfaceElevated }]}>
          {(title || message) && (
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              {title && (
                <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
              )}
              {message && (
                <Text style={[styles.message, { color: theme.textTertiary }]}>{message}</Text>
              )}
            </View>
          )}

          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                index < options.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
              onPress={() => handleOptionPress(option)}
            >
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={option.destructive ? theme.error : theme.primary}
                  style={styles.optionIcon}
                />
              )}
              <Text style={[
                styles.optionLabel,
                { color: option.destructive ? theme.error : theme.primary },
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.surfaceElevated }]}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelLabel, { color: theme.primary }]}>{cancelLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.sm,
  },
  actionsGroup: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  header: {
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  message: {
    fontSize: fontSize.xs,
    marginTop: 4,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
  },
  optionIcon: {
    marginRight: spacing.sm,
  },
  optionLabel: {
    fontSize: fontSize.lg,
    fontWeight: '500',
  },
  cancelButton: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
