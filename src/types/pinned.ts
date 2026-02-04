/**
 * Pinned Messages Types
 * 
 * 메시지 고정 시스템
 */

export interface PinnedMessage {
  id: string;
  messageId: string;
  roomId: string;
  agentId: string;
  content: string;
  pinnedAt: number;
  pinnedBy: 'user' | 'assistant';
  note?: string;           // 사용자가 추가한 메모
}

export interface PinnedMessagesState {
  // roomId -> PinnedMessage[]
  byRoom: Record<string, PinnedMessage[]>;
  // 최근 고정된 메시지 (빠른 접근용)
  recent: PinnedMessage[];
}

export const MAX_PINNED_PER_ROOM = 50;
export const MAX_RECENT_PINNED = 20;
