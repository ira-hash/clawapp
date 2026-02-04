/**
 * Translation Types
 * 
 * 메시지 번역 시스템
 */

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedAt: number;
}

export interface TranslationCache {
  [messageId: string]: TranslationResult;
}

export interface TranslationSettings {
  enabled: boolean;
  autoTranslate: boolean;        // 자동 번역 ON/OFF
  targetLanguage: string;        // 번역 대상 언어
  sourceLanguages: string[];     // 번역할 원본 언어들 (비어있으면 전체)
  showOriginal: boolean;         // 원문 함께 표시
}

export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export const DEFAULT_TRANSLATION_SETTINGS: TranslationSettings = {
  enabled: true,
  autoTranslate: false,
  targetLanguage: 'ko',
  sourceLanguages: [],
  showOriginal: true,
};
