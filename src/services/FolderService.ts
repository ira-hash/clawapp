/**
 * Folder Service
 * 
 * 채팅 폴더 관리 서비스
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatFolder, FolderFilter, DEFAULT_FOLDERS } from '../types/folders';
import { ChatRoom } from '../types';
import { StoredAgent, loadAgents, loadRooms } from './storage';

const STORAGE_KEY = 'claw_folders';

// ============ Storage ============

/**
 * 폴더 목록 로드
 */
export async function loadFolders(): Promise<ChatFolder[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const folders = JSON.parse(data) as ChatFolder[];
      // 정렬 순서대로 반환
      return folders.sort((a, b) => a.order - b.order);
    }
  } catch (e) {
    console.error('[FolderService] Failed to load folders:', e);
  }
  
  // 기본 폴더 초기화
  const defaultFolders = await initializeDefaultFolders();
  return defaultFolders;
}

/**
 * 폴더 목록 저장
 */
export async function saveFolders(folders: ChatFolder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error('[FolderService] Failed to save folders:', e);
  }
}

/**
 * 기본 폴더 초기화
 */
async function initializeDefaultFolders(): Promise<ChatFolder[]> {
  const now = Date.now();
  const folders: ChatFolder[] = DEFAULT_FOLDERS.map((f, index) => ({
    ...f,
    id: `folder_${index}_${now}`,
    createdAt: now,
  }));
  
  await saveFolders(folders);
  return folders;
}

// ============ CRUD ============

/**
 * 새 폴더 생성
 */
export async function createFolder(
  name: string,
  emoji: string,
  color: string,
  filter: FolderFilter = {}
): Promise<ChatFolder> {
  const folders = await loadFolders();
  
  const newFolder: ChatFolder = {
    id: `folder_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name,
    emoji,
    color,
    filter,
    order: folders.length,
    createdAt: Date.now(),
  };
  
  folders.push(newFolder);
  await saveFolders(folders);
  
  return newFolder;
}

/**
 * 폴더 수정
 */
export async function updateFolder(
  folderId: string,
  updates: Partial<Omit<ChatFolder, 'id' | 'createdAt'>>
): Promise<void> {
  const folders = await loadFolders();
  const index = folders.findIndex(f => f.id === folderId);
  
  if (index !== -1) {
    folders[index] = { ...folders[index], ...updates };
    await saveFolders(folders);
  }
}

/**
 * 폴더 삭제
 */
export async function deleteFolder(folderId: string): Promise<void> {
  const folders = await loadFolders();
  const filtered = folders.filter(f => f.id !== folderId);
  
  // 순서 재정렬
  filtered.forEach((f, i) => f.order = i);
  
  await saveFolders(filtered);
}

/**
 * 폴더 순서 변경
 */
export async function reorderFolders(folderIds: string[]): Promise<void> {
  const folders = await loadFolders();
  
  // ID 순서대로 order 재설정
  folderIds.forEach((id, index) => {
    const folder = folders.find(f => f.id === id);
    if (folder) {
      folder.order = index;
    }
  });
  
  await saveFolders(folders);
}

// ============ Filtering ============

interface ChatWithAgent extends ChatRoom {
  agent: StoredAgent;
}

/**
 * 폴더 필터에 맞는 채팅 목록 반환
 */
export async function getChatsForFolder(folderId: string): Promise<ChatWithAgent[]> {
  const folders = await loadFolders();
  const folder = folders.find(f => f.id === folderId);
  
  if (!folder) {
    return [];
  }
  
  return filterChats(folder.filter);
}

/**
 * 필터 조건에 맞는 채팅 목록 반환
 */
export async function filterChats(filter: FolderFilter): Promise<ChatWithAgent[]> {
  const agents = await loadAgents();
  const allChats: ChatWithAgent[] = [];
  
  for (const agent of agents) {
    // 에이전트 필터
    if (filter.agentIds && !filter.agentIds.includes(agent.id)) {
      continue;
    }
    if (filter.excludeAgentIds?.includes(agent.id)) {
      continue;
    }
    
    const rooms = await loadRooms(agent.id);
    
    for (const room of rooms) {
      // 채팅방 필터
      if (filter.roomIds && !filter.roomIds.includes(room.id)) {
        continue;
      }
      if (filter.excludeRoomIds?.includes(room.id)) {
        continue;
      }
      
      // Unread 필터
      if (filter.hasUnread === true && (room.unreadCount || 0) === 0) {
        continue;
      }
      if (filter.hasUnread === false && (room.unreadCount || 0) > 0) {
        continue;
      }
      
      // Pinned 필터
      if (filter.isPinned === true && !room.isPinned) {
        continue;
      }
      if (filter.isPinned === false && room.isPinned) {
        continue;
      }
      
      allChats.push({ ...room, agent });
    }
  }
  
  // 시간순 정렬 (최신 먼저)
  allChats.sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt));
  
  return allChats;
}

/**
 * 폴더별 unread 카운트 계산
 */
export async function getFolderUnreadCounts(): Promise<Record<string, number>> {
  const folders = await loadFolders();
  const counts: Record<string, number> = {};
  
  for (const folder of folders) {
    const chats = await filterChats(folder.filter);
    counts[folder.id] = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }
  
  return counts;
}

// ============ 채팅을 폴더에 추가/제거 ============

/**
 * 채팅을 폴더에 추가
 */
export async function addChatToFolder(
  folderId: string,
  agentId: string,
  roomId: string
): Promise<void> {
  const folders = await loadFolders();
  const folder = folders.find(f => f.id === folderId);
  
  if (folder) {
    // agentIds에 추가
    if (!folder.filter.agentIds) {
      folder.filter.agentIds = [];
    }
    if (!folder.filter.agentIds.includes(agentId)) {
      folder.filter.agentIds.push(agentId);
    }
    
    // roomIds에 추가
    if (!folder.filter.roomIds) {
      folder.filter.roomIds = [];
    }
    if (!folder.filter.roomIds.includes(roomId)) {
      folder.filter.roomIds.push(roomId);
    }
    
    await saveFolders(folders);
  }
}

/**
 * 채팅을 폴더에서 제거
 */
export async function removeChatFromFolder(
  folderId: string,
  agentId: string,
  roomId: string
): Promise<void> {
  const folders = await loadFolders();
  const folder = folders.find(f => f.id === folderId);
  
  if (folder) {
    if (folder.filter.agentIds) {
      folder.filter.agentIds = folder.filter.agentIds.filter(id => id !== agentId);
    }
    if (folder.filter.roomIds) {
      folder.filter.roomIds = folder.filter.roomIds.filter(id => id !== roomId);
    }
    
    await saveFolders(folders);
  }
}
