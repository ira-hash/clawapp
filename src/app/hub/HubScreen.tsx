/**
 * ClawdHub Screen
 * 
 * Browse and install skills from ClawdHub marketplace
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Skill } from '../../types';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

interface HubScreenProps {
  onBack: () => void;
}

// Mock data - will be replaced with actual API
const MOCK_SKILLS: Skill[] = [
  {
    id: '1',
    name: 'Weather',
    description: 'Get current weather and forecasts for any location',
    icon: '🌤️',
    author: 'clawdbot',
    version: '1.0.0',
    rating: 4.8,
    installs: 1200,
    category: 'tools',
    tags: ['weather', 'forecast'],
  },
  {
    id: '2',
    name: 'GitHub',
    description: 'Manage repositories, issues, and PRs with gh CLI',
    icon: '🐙',
    author: 'clawdbot',
    version: '1.2.0',
    rating: 4.9,
    installs: 890,
    category: 'development',
    tags: ['github', 'git', 'code'],
  },
  {
    id: '3',
    name: 'Notion',
    description: 'Create and manage Notion pages and databases',
    icon: '📝',
    author: 'clawdbot',
    version: '1.0.0',
    rating: 4.7,
    installs: 650,
    category: 'productivity',
    tags: ['notion', 'notes', 'database'],
  },
  {
    id: '4',
    name: 'Slack',
    description: 'Send messages and manage Slack channels',
    icon: '💬',
    author: 'clawdbot',
    version: '1.1.0',
    rating: 4.6,
    installs: 520,
    category: 'communication',
    tags: ['slack', 'messaging'],
  },
  {
    id: '5',
    name: 'Deep Research',
    description: 'Complex multi-step research with planning and reasoning',
    icon: '🔬',
    author: 'we-crafted',
    version: '1.0.0',
    rating: 4.9,
    installs: 340,
    category: 'research',
    tags: ['research', 'analysis'],
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🔥' },
  { id: 'tools', name: 'Tools', icon: '🔧' },
  { id: 'development', name: 'Dev', icon: '💻' },
  { id: 'productivity', name: 'Productivity', icon: '📊' },
  { id: 'communication', name: 'Comms', icon: '💬' },
];

export function HubScreen({ onBack }: HubScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS);
  const [loading, setLoading] = useState(false);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSkillPress = (skill: Skill) => {
    // Open ClawdHub website for skill details
    Linking.openURL(`https://clawdhub.com/skills/${skill.id}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>📦 ClawdHub</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.gray500} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search skills..."
          placeholderTextColor={colors.gray500}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.categoriesList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === item.id && styles.categoryTextActive
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderSkillItem = ({ item }: { item: Skill }) => (
    <TouchableOpacity style={styles.skillItem} onPress={() => handleSkillPress(item)}>
      <View style={styles.skillIcon}>
        <Text style={styles.skillIconText}>{item.icon}</Text>
      </View>
      
      <View style={styles.skillContent}>
        <View style={styles.skillHeader}>
          <Text style={styles.skillName}>{item.name}</Text>
          <Text style={styles.skillVersion}>v{item.version}</Text>
        </View>
        
        <Text style={styles.skillDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.skillMeta}>
          <View style={styles.skillRating}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.skillMetaText}>{item.rating}</Text>
          </View>
          <Text style={styles.skillMetaDot}>·</Text>
          <Text style={styles.skillMetaText}>
            {item.installs >= 1000 
              ? `${(item.installs / 1000).toFixed(1)}k` 
              : item.installs
            } installs
          </Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      {renderCategories()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSkills}
          renderItem={renderSkillItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.skillsList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No skills found</Text>
            </View>
          )}
        />
      )}
      
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => Linking.openURL('https://clawdhub.com')}
      >
        <Text style={styles.browseButtonText}>Browse all on clawdhub.com</Text>
        <Ionicons name="open-outline" size={16} color={colors.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.light.text,
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.light.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.light.text,
  },
  categoriesContainer: {
    backgroundColor: colors.light.surface,
    paddingBottom: spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
  categoryTextActive: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsList: {
    padding: spacing.md,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skillIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  skillIconText: {
    fontSize: 24,
  },
  skillContent: {
    flex: 1,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skillName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.light.text,
  },
  skillVersion: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  skillDescription: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginTop: 2,
    marginBottom: 4,
  },
  skillMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  skillMetaText: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  skillMetaDot: {
    fontSize: fontSize.xs,
    color: colors.gray400,
    marginHorizontal: spacing.xs,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray200,
    marginLeft: 64,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.gray500,
  },
  browseButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray200,
    gap: spacing.xs,
  },
  browseButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
});
