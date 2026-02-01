/**
 * Chat Input Component
 * 
 * Text input with send button
 * Supports:
 * - Multi-line input
 * - Image attachment
 * - Keyboard handling
 * - Haptic feedback
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';

interface ChatInputProps {
  onSend: (text: string, image?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled = false, placeholder = '메시지 입력...' }: ChatInputProps) {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText && !selectedImage) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmedText, selectedImage || undefined);
    setText('');
    setSelectedImage(null);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      // Store as data URI for sending
      const asset = result.assets[0];
      if (asset.base64) {
        const mimeType = asset.mimeType || 'image/jpeg';
        setSelectedImage(`data:${mimeType};base64,${asset.base64}`);
      } else {
        setSelectedImage(asset.uri);
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCameraPress = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        const mimeType = asset.mimeType || 'image/jpeg';
        setSelectedImage(`data:${mimeType};base64,${asset.base64}`);
      } else {
        setSelectedImage(asset.uri);
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  const canSend = (text.trim().length > 0 || selectedImage) && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        {/* Image preview */}
        {selectedImage && (
          <View style={[styles.imagePreviewContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.imagePreview}>
              <Ionicons name="image" size={20} color={theme.primary} />
              <View style={styles.imagePreviewText}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
              </View>
            </View>
            <TouchableOpacity onPress={clearImage} style={styles.clearImageButton}>
              <Ionicons name="close-circle" size={24} color={theme.error} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          {/* Attachment button */}
          <TouchableOpacity
            onPress={handlePickImage}
            onLongPress={handleCameraPress}
            style={styles.attachButton}
            disabled={disabled}
          >
            <Ionicons
              name="add-circle-outline"
              size={28}
              color={disabled ? theme.textTertiary : theme.primary}
            />
          </TouchableOpacity>

          {/* Text input */}
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: theme.text }]}
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={theme.textSecondary}
              multiline
              maxLength={4000}
              editable={!disabled}
              returnKeyType="default"
              blurOnSubmit={false}
            />
          </View>

          {/* Send button */}
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              { backgroundColor: canSend ? theme.primary : theme.inputBackground },
            ]}
            disabled={!canSend}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={canSend ? '#FFFFFF' : theme.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imagePreviewText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearImageButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 8,
  },
  attachButton: {
    padding: 4,
    marginBottom: 4,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
