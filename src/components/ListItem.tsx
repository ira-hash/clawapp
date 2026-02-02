/**
 * List Item Component
 * 
 * 설정/목록용 항목
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize } from '../theme';

interface ListItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
}

export function ListItem({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  showChevron = false,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  onPress,
  destructive = false,
}: ListItemProps) {
  const { theme } = useTheme();

  const handlePress = async () => {
    if (onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleSwitchChange = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwitchChange?.(value);
  };

  const content = (
    <>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: (iconColor || theme.primary) + '15' }]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={destructive ? theme.error : (iconColor || theme.primary)} 
          />
        </View>
      )}
      
      <View style={styles.textContainer}>
        <Text style={[
          styles.title, 
          { color: destructive ? theme.error : theme.text }
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {value && (
        <Text style={[styles.value, { color: theme.textSecondary }]}>{value}</Text>
      )}
      
      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={handleSwitchChange}
          trackColor={{ false: theme.border, true: theme.primary + '80' }}
          thumbColor={switchValue ? theme.primary : '#f4f3f4'}
        />
      )}
      
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      )}
    </>
  );

  if (onPress && !showSwitch) {
    return (
      <TouchableOpacity 
        style={[styles.container, { backgroundColor: theme.background }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  value: {
    fontSize: fontSize.md,
    marginRight: spacing.sm,
  },
});
