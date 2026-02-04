/**
 * Chat Folders Types
 * 
 * 텔레그램 스타일 채팅 폴더 시스템
 */

export interface ChatFolder {
  id: string;
  name: string;
  emoji: string;
  color: string;
  filter: FolderFilter;
  order: number;
  createdAt: number;
}

export interface FolderFilter {
  // Include filters
  agentIds?: string[];      // 특정 에이전트만 포함
  roomIds?: string[];       // 특정 채팅방만 포함
  hasUnread?: boolean;      // 읽지 않은 메시지 있는 채팅만
  isPinned?: boolean;       // 고정된 채팅만
  
  // Exclude filters
  excludeAgentIds?: string[];
  excludeRoomIds?: string[];
  excludeMuted?: boolean;   // 음소거된 채팅 제외
}

// 기본 제공 폴더
export const DEFAULT_FOLDERS: Omit<ChatFolder, 'id' | 'createdAt'>[] = [
  {
    name: 'All Chats',
    emoji: '💬',
    color: '#007AFF',
    filter: {},
    order: 0,
  },
  {
    name: 'Unread',
    emoji: '🔔',
    color: '#FF3B30',
    filter: { hasUnread: true },
    order: 1,
  },
  {
    name: 'Pinned',
    emoji: '📌',
    color: '#FF9500',
    filter: { isPinned: true },
    order: 2,
  },
];

export interface FolderState {
  folders: ChatFolder[];
  activeFolderId: string | null;
}
