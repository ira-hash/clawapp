/**
 * Pinned Messages Service
 * 
 * 메시지 고정 서비스
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PinnedMessage, MAX_PINNED_PER_ROOM, MAX_RECENT_PINNED } from '../types/pinned';

const STORAGE_KEY = 'claw_pinned_messages';

interface PinnedStorage {
  byRoom: Record<string, PinnedMessage[]>;
  recent: PinnedMessage[];
}

let pinnedData: PinnedStorage = {
  byRoom: {},
  recent: [],
};

// ============ Storage ============

/**
 * 고정 메시지 로드
 */
export async function loadPinnedMessages(): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      pinnedData = JSON.parse(data);
    }
  } catch (e) {
    console.error('[PinnedService] Failed to load pinned messages:', e);
  }
}

/**
 * 고정 메시지 저장
 */
async function savePinnedMessages(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedData));
  } catch (e) {
    console.error('[PinnedService] Failed to save pinned messages:', e);
  }
}

// ============ CRUD ============

/**
 * 메시지 고정
 */
export async function pinMessage(
  messageId: string,
  roomId: string,
  agentId: string,
  content: string,
  pinnedBy: 'user' | 'assistant' = 'user',
  note?: string
): Promise<PinnedMessage> {
  // 이미 고정되어 있는지 확인
  const existing = getPinnedMessage(messageId, roomId);
  if (existing) {
    return existing;
  }
  
  const pinned: PinnedMessage = {
    id: `pin_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    messageId,
    roomId,
    agentId,
    content,
    pinnedAt: Date.now(),
    pinnedBy,
    note,
  };
  
  // byRoom에 추가
  if (!pinnedData.byRoom[roomId]) {
    pinnedData.byRoom[roomId] = [];
  }
  
  // 최대 개수 제한
  if (pinnedData.byRoom[roomId].length >= MAX_PINNED_PER_ROOM) {
    // 가장 오래된 것 제거
    pinnedData.byRoom[roomId].shift();
  }
  
  pinnedData.byRoom[roomId].push(pinned);
  
  // recent에 추가
  pinnedData.recent = [pinned, ...pinnedData.recent].slice(0, MAX_RECENT_PINNED);
  
  await savePinnedMessages();
  
  return pinned;
}

/**
 * 메시지 고정 해제
 */
export async function unpinMessage(messageId: string, roomId: string): Promise<void> {
  // byRoom에서 제거
  if (pinnedData.byRoom[roomId]) {
    pinnedData.byRoom[roomId] = pinnedData.byRoom[roomId].filter(
      p => p.messageId !== messageId
    );
  }
  
  // recent에서 제거
  pinnedData.recent = pinnedData.recent.filter(
    p => !(p.messageId === messageId && p.roomId === roomId)
  );
  
  await savePinnedMessages();
}

/**
 * 고정 메시지 노트 업데이트
 */
export async function updatePinnedNote(
  messageId: string,
  roomId: string,
  note: string
): Promise<void> {
  const pinned = pinnedData.byRoom[roomId]?.find(p => p.messageId === messageId);
  if (pinned) {
    pinned.note = note;
    
    // recent에서도 업데이트
    const recentPinned = pinnedData.recent.find(
      p => p.messageId === messageId && p.roomId === roomId
    );
    if (recentPinned) {
      recentPinned.note = note;
    }
    
    await savePinnedMessages();
  }
}

// ============ Query ============

/**
 * 특정 메시지가 고정되어 있는지 확인
 */
export function isMessagePinned(messageId: string, roomId: string): boolean {
  return pinnedData.byRoom[roomId]?.some(p => p.messageId === messageId) || false;
}

/**
 * 특정 메시지의 고정 정보 가져오기
 */
export function getPinnedMessage(messageId: string, roomId: string): PinnedMessage | null {
  return pinnedData.byRoom[roomId]?.find(p => p.messageId === messageId) || null;
}

/**
 * 채팅방의 고정 메시지 목록 가져오기
 */
export function getPinnedMessagesForRoom(roomId: string): PinnedMessage[] {
  return pinnedData.byRoom[roomId] || [];
}

/**
 * 채팅방의 고정 메시지 개수 가져오기
 */
export function getPinnedCountForRoom(roomId: string): number {
  return pinnedData.byRoom[roomId]?.length || 0;
}

/**
 * 최근 고정된 메시지 가져오기
 */
export function getRecentPinnedMessages(): PinnedMessage[] {
  return pinnedData.recent;
}

/**
 * 에이전트의 모든 고정 메시지 가져오기
 */
export function getPinnedMessagesForAgent(agentId: string): PinnedMessage[] {
  const all: PinnedMessage[] = [];
  
  for (const roomPinned of Object.values(pinnedData.byRoom)) {
    all.push(...roomPinned.filter(p => p.agentId === agentId));
  }
  
  return all.sort((a, b) => b.pinnedAt - a.pinnedAt);
}

/**
 * 전체 고정 메시지 개수
 */
export function getTotalPinnedCount(): number {
  return Object.values(pinnedData.byRoom).reduce(
    (sum, room) => sum + room.length,
    0
  );
}

/**
 * 채팅방의 고정 메시지 전체 삭제
 */
export async function clearPinnedForRoom(roomId: string): Promise<void> {
  delete pinnedData.byRoom[roomId];
  pinnedData.recent = pinnedData.recent.filter(p => p.roomId !== roomId);
  await savePinnedMessages();
}

/**
 * 에이전트의 고정 메시지 전체 삭제
 */
export async function clearPinnedForAgent(agentId: string): Promise<void> {
  // byRoom에서 해당 에이전트 메시지 제거
  for (const roomId of Object.keys(pinnedData.byRoom)) {
    pinnedData.byRoom[roomId] = pinnedData.byRoom[roomId].filter(
      p => p.agentId !== agentId
    );
    // 빈 배열이면 키 삭제
    if (pinnedData.byRoom[roomId].length === 0) {
      delete pinnedData.byRoom[roomId];
    }
  }
  
  // recent에서 제거
  pinnedData.recent = pinnedData.recent.filter(p => p.agentId !== agentId);
  
  await savePinnedMessages();
}

// 앱 시작 시 로드
loadPinnedMessages();
