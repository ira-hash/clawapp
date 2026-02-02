/**
 * Chat Input Component
 * 
 * 텔레그램 스타일 메시지 입력
 * Features:
 * - Multi-line input with auto-resize
 * - Image attachment
 * - Keyboard handling
 * - Haptic feedback
 * - Slash commands autocomplete
 * - Animated send button
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Image,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { SlashCommands } from './SlashCommands';

interface ChatInputProps {
  onSend: (text: string, image?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MIN_INPUT_HEIGHT = 36;
const MAX_INPUT_HEIGHT = 120;

export function ChatInput({ onSend, disabled = false, placeholder = '메시지 입력...' }: ChatInputProps) {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const inputRef = useRef<TextInput>(null);
  
  // Animations
  const sendButtonScale = useRef(new Animated.Value(0.8)).current;
  const sendButtonOpacity = useRef(new Animated.Value(0)).current;
  const attachButtonRotation = useRef(new Animated.Value(0)).current;

  const canSend = (text.trim().length > 0 || selectedImage) && !disabled;

  // Animate send button visibility
  useEffect(() => {
    Animated.parallel([
      Animated.spring(sendButtonScale, {
        toValue: canSend ? 1 : 0.8,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.timing(sendButtonOpacity, {
        toValue: canSend ? 1 : 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [canSend, sendButtonScale, sendButtonOpacity]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    
    // Show slash commands when typing / at start
    if (newText.startsWith('/') && !newText.includes(' ')) {
      setShowSlashCommands(true);
    } else {
      setShowSlashCommands(false);
    }
  };

  const handleContentSizeChange = (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
    const newHeight = Math.min(
      Math.max(e.nativeEvent.contentSize.height, MIN_INPUT_HEIGHT),
      MAX_INPUT_HEIGHT
    );
    setInputHeight(newHeight);
  };

  const handleSlashCommandSelect = (command: string) => {
    setText(command + ' ');
    setShowSlashCommands(false);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText && !selectedImage) return;

    // Send animation
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Pulse animation
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.85,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(sendButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
    ]).start();

    onSend(trimmedText, selectedImage || undefined);
    setText('');
    setInputHeight(MIN_INPUT_HEIGHT);
    setSelectedImage(null);
    setImagePreviewUri(null);
    setShowSlashCommands(false);
  };

  const handlePickImage = async () => {
    // Rotate attach button
    Animated.sequence([
      Animated.timing(attachButtonRotation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(attachButtonRotation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImagePreviewUri(asset.uri);
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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImagePreviewUri(asset.uri);
      if (asset.base64) {
        const mimeType = asset.mimeType || 'image/jpeg';
        setSelectedImage(`data:${mimeType};base64,${asset.base64}`);
      } else {
        setSelectedImage(asset.uri);
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const clearImage = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImage(null);
    setImagePreviewUri(null);
  };

  const attachRotate = attachButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
        {/* Slash Commands Popup */}
        <SlashCommands
          input={text}
          onSelect={handleSlashCommandSelect}
          visible={showSlashCommands}
        />

        <View style={[styles.container, { borderTopColor: theme.border }]}>
          {/* Image preview */}
          {imagePreviewUri && (
            <View style={[styles.imagePreviewContainer, { backgroundColor: theme.surface }]}>
              <Image source={{ uri: imagePreviewUri }} style={styles.imagePreview} />
              <TouchableOpacity onPress={clearImage} style={styles.clearImageButton}>
                <Ionicons name="close-circle" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            {/* Attachment button */}
            <Animated.View style={{ transform: [{ rotate: attachRotate }] }}>
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
            </Animated.View>

            {/* Text input */}
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: theme.inputBackground,
                minHeight: MIN_INPUT_HEIGHT + 16,
              }
            ]}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.input, 
                  { 
                    color: theme.text,
                    height: inputHeight,
                  }
                ]}
                value={text}
                onChangeText={handleTextChange}
                onContentSizeChange={handleContentSizeChange}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={4000}
                editable={!disabled}
                returnKeyType="default"
                blurOnSubmit={false}
                textAlignVertical="center"
              />
            </View>

            {/* Send button */}
            <Animated.View
              style={{
                transform: [{ scale: sendButtonScale }],
                opacity: sendButtonOpacity,
              }}
            >
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
            </Animated.View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  imagePreviewContainer: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    margin: 8,
  },
  clearImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 0,
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
    marginBottom: 6,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
});
