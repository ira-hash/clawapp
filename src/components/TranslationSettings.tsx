/**
 * TranslationSettings Component
 * 
 * 번역 설정 화면
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import {
  TranslationSettings as TranslationSettingsType,
  SUPPORTED_LANGUAGES,
  LanguageCode,
} from '../types/translation';
import {
  loadTranslationSettings,
  saveTranslationSettings,
  clearTranslationCache,
} from '../services/TranslationService';
import { spacing, fontSize, borderRadius } from '../theme';

interface TranslationSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export function TranslationSettings({ visible, onClose }: TranslationSettingsProps) {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<TranslationSettingsType | null>(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    const loaded = await loadTranslationSettings();
    setSettings(loaded);
  };

  const updateSettings = async (updates: Partial<TranslationSettingsType>) => {
    if (!settings) return;

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveTranslationSettings(newSettings);
    Haptics.selectionAsync();
  };

  const handleClearCache = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearTranslationCache();
  };

  if (!settings) {
    return null;
  }

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === settings.targetLanguage);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Translation</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.content}>
          {/* Enable Translation */}
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Enable Translation</Text>
                <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                  Show translate button on messages
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(v) => updateSettings({ enabled: v })}
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={settings.enabled ? theme.primary : theme.surface}
              />
            </View>
          </View>

          {settings.enabled && (
            <>
              {/* Target Language */}
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                TRANSLATE TO
              </Text>
              <TouchableOpacity
                style={[styles.section, { backgroundColor: theme.surface }]}
                onPress={() => setShowLanguagePicker(true)}
              >
                <View style={styles.row}>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowTitle, { color: theme.text }]}>
                      {selectedLang?.flag} {selectedLang?.name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </View>
              </TouchableOpacity>

              {/* Auto Translate */}
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                OPTIONS
              </Text>
              <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <View style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowTitle, { color: theme.text }]}>Auto Translate</Text>
                    <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                      Automatically translate incoming messages
                    </Text>
                  </View>
                  <Switch
                    value={settings.autoTranslate}
                    onValueChange={(v) => updateSettings({ autoTranslate: v })}
                    trackColor={{ false: theme.border, true: theme.primary + '50' }}
                    thumbColor={settings.autoTranslate ? theme.primary : theme.surface}
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowTitle, { color: theme.text }]}>Show Original</Text>
                    <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                      Display original text with translation
                    </Text>
                  </View>
                  <Switch
                    value={settings.showOriginal}
                    onValueChange={(v) => updateSettings({ showOriginal: v })}
                    trackColor={{ false: theme.border, true: theme.primary + '50' }}
                    thumbColor={settings.showOriginal ? theme.primary : theme.surface}
                  />
                </View>
              </View>

              {/* Clear Cache */}
              <TouchableOpacity
                style={[styles.section, { backgroundColor: theme.surface }]}
                onPress={handleClearCache}
              >
                <View style={styles.row}>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowTitle, { color: theme.error }]}>Clear Translation Cache</Text>
                    <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                      Remove all cached translations
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {/* Language Picker Modal */}
        <Modal
          visible={showLanguagePicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowLanguagePicker(false)}
        >
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setShowLanguagePicker(false)}
                style={styles.headerButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Select Language</Text>
              <View style={styles.headerButton} />
            </View>

            <ScrollView style={styles.content}>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageRow,
                    { backgroundColor: theme.surface },
                    lang.code === settings.targetLanguage && { backgroundColor: theme.primary + '15' },
                  ]}
                  onPress={() => {
                    updateSettings({ targetLanguage: lang.code as LanguageCode });
                    setShowLanguagePicker(false);
                  }}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[styles.languageName, { color: theme.text }]}>{lang.name}</Text>
                  {lang.code === settings.targetLanguage && (
                    <Ionicons name="checkmark" size={22} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: fontSize.md,
    flex: 1,
  },
});
