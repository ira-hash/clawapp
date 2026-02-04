/**
 * Translation Service
 * 
 * 메시지 번역 서비스
 * - 무료 번역 API 사용 (LibreTranslate / Google Translate 무료 tier)
 * - 캐시 시스템으로 중복 요청 방지
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TranslationResult,
  TranslationCache,
  TranslationSettings,
  DEFAULT_TRANSLATION_SETTINGS,
  SUPPORTED_LANGUAGES,
  LanguageCode,
} from '../types/translation';

const CACHE_KEY = 'claw_translation_cache';
const SETTINGS_KEY = 'claw_translation_settings';
const MAX_CACHE_SIZE = 500;

// 캐시
let translationCache: TranslationCache = {};

// ============ Settings ============

/**
 * 번역 설정 로드
 */
export async function loadTranslationSettings(): Promise<TranslationSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return { ...DEFAULT_TRANSLATION_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('[TranslationService] Failed to load settings:', e);
  }
  return DEFAULT_TRANSLATION_SETTINGS;
}

/**
 * 번역 설정 저장
 */
export async function saveTranslationSettings(settings: TranslationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('[TranslationService] Failed to save settings:', e);
  }
}

// ============ Cache ============

/**
 * 캐시 로드
 */
export async function loadCache(): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEY);
    if (data) {
      translationCache = JSON.parse(data);
    }
  } catch (e) {
    console.error('[TranslationService] Failed to load cache:', e);
  }
}

/**
 * 캐시 저장
 */
async function saveCache(): Promise<void> {
  try {
    // 캐시 크기 제한
    const keys = Object.keys(translationCache);
    if (keys.length > MAX_CACHE_SIZE) {
      const sortedKeys = keys.sort((a, b) => 
        (translationCache[a].translatedAt || 0) - (translationCache[b].translatedAt || 0)
      );
      const toRemove = sortedKeys.slice(0, keys.length - MAX_CACHE_SIZE);
      toRemove.forEach(key => delete translationCache[key]);
    }
    
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(translationCache));
  } catch (e) {
    console.error('[TranslationService] Failed to save cache:', e);
  }
}

/**
 * 캐시에서 번역 결과 가져오기
 */
export function getCachedTranslation(messageId: string): TranslationResult | null {
  return translationCache[messageId] || null;
}

// ============ Translation API ============

/**
 * 언어 감지
 */
export function detectLanguage(text: string): LanguageCode {
  // 간단한 언어 감지 (정규식 기반)
  const patterns: [RegExp, LanguageCode][] = [
    [/[\uAC00-\uD7AF]/g, 'ko'],      // 한글
    [/[\u3040-\u309F\u30A0-\u30FF]/g, 'ja'],  // 일본어
    [/[\u4E00-\u9FFF]/g, 'zh'],      // 중국어
    [/[\u0400-\u04FF]/g, 'ru'],      // 러시아어
    [/[\u0600-\u06FF]/g, 'ar'],      // 아랍어
    [/[\u0900-\u097F]/g, 'hi'],      // 힌디어
    [/[\u0E00-\u0E7F]/g, 'th'],      // 태국어
  ];
  
  for (const [pattern, lang] of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > text.length * 0.1) {
      return lang;
    }
  }
  
  // 기본값: 영어
  return 'en';
}

/**
 * 텍스트 번역 (Google Translate 무료 API 사용)
 */
export async function translateText(
  text: string,
  targetLang: LanguageCode,
  sourceLang?: LanguageCode
): Promise<string> {
  try {
    // 빈 텍스트 처리
    if (!text.trim()) {
      return text;
    }
    
    // 소스 언어 감지
    const source = sourceLang || detectLanguage(text);
    
    // 같은 언어면 번역 불필요
    if (source === targetLang) {
      return text;
    }
    
    // Google Translate 무료 API (비공식)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 응답 파싱: [[["번역된 텍스트", "원본 텍스트", ...]]]
    if (data && data[0]) {
      const translatedParts = data[0]
        .filter((part: any) => part && part[0])
        .map((part: any) => part[0]);
      return translatedParts.join('');
    }
    
    throw new Error('Invalid translation response');
  } catch (e) {
    console.error('[TranslationService] Translation failed:', e);
    throw e;
  }
}

/**
 * 메시지 번역 (캐시 포함)
 */
export async function translateMessage(
  messageId: string,
  text: string,
  targetLang: LanguageCode
): Promise<TranslationResult> {
  // 캐시 확인
  const cached = getCachedTranslation(messageId);
  if (cached && cached.targetLanguage === targetLang) {
    return cached;
  }
  
  // 번역 실행
  const sourceLang = detectLanguage(text);
  const translatedText = await translateText(text, targetLang, sourceLang);
  
  const result: TranslationResult = {
    originalText: text,
    translatedText,
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    translatedAt: Date.now(),
  };
  
  // 캐시에 저장
  translationCache[messageId] = result;
  await saveCache();
  
  return result;
}

// ============ Utilities ============

/**
 * 언어 이름 가져오기
 */
export function getLanguageName(code: LanguageCode): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
}

/**
 * 언어 플래그 가져오기
 */
export function getLanguageFlag(code: LanguageCode): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.flag || '🌐';
}

/**
 * 캐시 클리어
 */
export async function clearTranslationCache(): Promise<void> {
  translationCache = {};
  await AsyncStorage.removeItem(CACHE_KEY);
}

// 앱 시작 시 캐시 로드
loadCache();
