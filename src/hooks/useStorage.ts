/**
 * Storage Hook
 * 
 * Persistent storage for agents, messages, and settings
 */

import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Agent, Message, Settings } from '../types';

const STORAGE_KEYS = {
  AGENTS: 'claw_agents',
  MESSAGES: 'claw_messages',
  SETTINGS: 'claw_settings',
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  fontSize: 'medium',
  notifications: true,
  haptics: true,
  biometricLock: false,
};

export function useStorage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [agentsData, messagesData, settingsData] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.AGENTS),
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      if (agentsData) {
        setAgents(JSON.parse(agentsData));
      }
      if (messagesData) {
        setMessages(JSON.parse(messagesData));
      }
      if (settingsData) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) });
      }
    } catch (error) {
      console.error('Failed to load storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Agents
  const saveAgents = useCallback(async (newAgents: Agent[]) => {
    setAgents(newAgents);
    await SecureStore.setItemAsync(STORAGE_KEYS.AGENTS, JSON.stringify(newAgents));
  }, []);

  const addAgent = useCallback(async (agent: Agent) => {
    const newAgents = [...agents, agent];
    await saveAgents(newAgents);
    return agent;
  }, [agents, saveAgents]);

  const updateAgent = useCallback(async (agentId: string, updates: Partial<Agent>) => {
    const newAgents = agents.map(a => 
      a.id === agentId ? { ...a, ...updates } : a
    );
    await saveAgents(newAgents);
  }, [agents, saveAgents]);

  const removeAgent = useCallback(async (agentId: string) => {
    const newAgents = agents.filter(a => a.id !== agentId);
    await saveAgents(newAgents);
    
    // Also remove messages for this agent
    const newMessages = { ...messages };
    delete newMessages[agentId];
    setMessages(newMessages);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(newMessages));
  }, [agents, messages, saveAgents]);

  // Messages
  const saveMessages = useCallback(async (agentId: string, newMessages: Message[]) => {
    const updated = { ...messages, [agentId]: newMessages };
    setMessages(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
  }, [messages]);

  const addMessage = useCallback(async (agentId: string, message: Message) => {
    const agentMessages = messages[agentId] || [];
    const newMessages = [...agentMessages, message];
    await saveMessages(agentId, newMessages);
    
    // Update agent's lastMessage
    await updateAgent(agentId, { 
      lastMessage: message,
      lastActiveAt: Date.now(),
    });
  }, [messages, saveMessages, updateAgent]);

  const getMessages = useCallback((agentId: string): Message[] => {
    return messages[agentId] || [];
  }, [messages]);

  const clearMessages = useCallback(async (agentId: string) => {
    await saveMessages(agentId, []);
    await updateAgent(agentId, { lastMessage: undefined });
  }, [saveMessages, updateAgent]);

  // Settings
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  }, [settings]);

  // Clear all data (logout)
  const clearAll = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AGENTS);
    await AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES);
    setAgents([]);
    setMessages({});
  }, []);

  return {
    // State
    agents,
    messages,
    settings,
    isLoading,
    
    // Agent methods
    addAgent,
    updateAgent,
    removeAgent,
    
    // Message methods
    addMessage,
    getMessages,
    clearMessages,
    
    // Settings methods
    updateSettings,
    
    // Utility
    clearAll,
  };
}
