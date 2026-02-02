/**
 * Message Queue Service
 * 
 * 오프라인 메시지 큐
 * Features:
 * - 연결 끊김 시 메시지 저장
 * - 재연결 시 자동 전송
 * - 로컬 저장소 영속성
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@clawapp/message_queue';

export interface QueuedMessage {
  id: string;
  roomId: string;
  text: string;
  image?: string;
  timestamp: number;
  retryCount: number;
}

class MessageQueueService {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;
  private sendCallback?: (msg: QueuedMessage) => Promise<boolean>;

  async init() {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load message queue:', error);
    }
  }

  setSendCallback(callback: (msg: QueuedMessage) => Promise<boolean>) {
    this.sendCallback = callback;
  }

  async enqueue(roomId: string, text: string, image?: string): Promise<QueuedMessage> {
    const message: QueuedMessage = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      text,
      image,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(message);
    await this.save();
    
    return message;
  }

  async processQueue(): Promise<number> {
    if (this.isProcessing || !this.sendCallback) return 0;
    if (this.queue.length === 0) return 0;

    this.isProcessing = true;
    let sentCount = 0;

    try {
      const toProcess = [...this.queue];
      
      for (const message of toProcess) {
        try {
          const success = await this.sendCallback(message);
          
          if (success) {
            this.queue = this.queue.filter(m => m.id !== message.id);
            sentCount++;
          } else {
            // Increment retry count
            const idx = this.queue.findIndex(m => m.id === message.id);
            if (idx >= 0) {
              this.queue[idx].retryCount++;
              
              // Remove after too many retries
              if (this.queue[idx].retryCount > 5) {
                this.queue.splice(idx, 1);
              }
            }
          }
        } catch (error) {
          console.error('Failed to send queued message:', error);
        }
      }

      await this.save();
    } finally {
      this.isProcessing = false;
    }

    return sentCount;
  }

  getQueuedMessages(roomId?: string): QueuedMessage[] {
    if (roomId) {
      return this.queue.filter(m => m.roomId === roomId);
    }
    return [...this.queue];
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  async removeMessage(id: string): Promise<void> {
    this.queue = this.queue.filter(m => m.id !== id);
    await this.save();
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.save();
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save message queue:', error);
    }
  }
}

export const messageQueue = new MessageQueueService();
