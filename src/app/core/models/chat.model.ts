export interface ChatMessage {
  id: number;
  senderId: number;
  senderUsername: string;
  recipientId: number;
  recipientUsername: string;
  content: string;
  isRead: boolean;
  createdAt: string; // ISO 8601
}

export interface ConversationSummary {
  userId: number;
  username: string;
  lastMessage: string | null;
  unreadCount: number;
  updatedAt: string | null;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page
}
