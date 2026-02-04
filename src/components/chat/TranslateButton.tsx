/**
 * TranslateButton Component
 * 
 * 메시지 번역 버튼 (메시지 버블 내에 표시)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import {
  translateMessage,
  getCachedTranslation,
  getLanguageFlag,
  detectLanguage,
} from '../../services/TranslationService';
import { TranslationResult, LanguageCode } from '../../types/translation';
import { spacing, fontSize, borderRadius } from '../../theme';

interface TranslateButtonProps {
  messageId: string;
  text: string;
  targetLanguage?: LanguageCode;
  onTranslated?: (result: TranslationResult) => void;
  compact?: boolean;
}

export function TranslateButton({
  messageId,
  text,
  targetLanguage = 'ko',
  onTranslated,
  compact = false,
}: TranslateButtonProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<TranslationResult | null>(
    getCachedTranslation(messageId)
  );

  // 같은 언어면 번역 버튼 숨기기
  const detectedLang = detectLanguage(text);
  if (detectedLang === targetLanguage) {
    return null;
  }

  const handlePress = async () => {
    if (translation) {
      // 이미 번역됨 - 원문/번역 토글
      setTranslation(null);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setError(null);

    try {
      const result = await translateMessage(messageId, text, targetLanguage);
      setTranslation(result);
      onTranslated?.(result);
    } catch (e) {
      setError('Translation failed');
      console.error('[TranslateButton] Failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.compactButton, { backgroundColor: theme.surface }]}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Ionicons
            name={translation ? 'language' : 'language-outline'}
            size={14}
            color={translation ? theme.primary : theme.textSecondary}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.button,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <>
            <Ionicons
              name={translation ? 'checkmark-circle' : 'language-outline'}
              size={14}
              color={translation ? theme.success : theme.textSecondary}
            />
            <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
              {translation
                ? `${getLanguageFlag(translation.sourceLanguage as LanguageCode)} → ${getLanguageFlag(targetLanguage)}`
                : 'Translate'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      )}

      {translation && (
        <View style={[styles.translationBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.translationText, { color: theme.text }]}>
            {translation.translatedText}
          </Text>
          <Text style={[styles.translationMeta, { color: theme.textTertiary }]}>
            {getLanguageFlag(translation.sourceLanguage as LanguageCode)} →{' '}
            {getLanguageFlag(translation.targetLanguage as LanguageCode)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: fontSize.xs,
  },
  compactButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  translationBox: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  translationText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  translationMeta: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
