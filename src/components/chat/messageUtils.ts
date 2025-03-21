import { Message } from '../../types';
import { DatabaseMessage } from './chatTypes';

// Message validation constants
export const MIN_MESSAGE_LENGTH = 2;
export const MAX_MESSAGE_LENGTH = 1000;

// Add timestamp validation
export const validateTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  return date > now ? now.toISOString() : timestamp;
};

// Add message content validation
export const isValidMessageContent = (content: string): boolean => {
  const trimmed = content.trim();
  return trimmed.length >= MIN_MESSAGE_LENGTH && trimmed.length <= MAX_MESSAGE_LENGTH;
};

export const validateMessage = (msg: DatabaseMessage): Message => {
  // Ensure all required properties exist with fallbacks
  return {
    id: msg.id || '',
    chat_id: msg.chat_id || '',
    sender_id: msg.sender_id || '',
    content: msg.content || '',
    content_type: msg.content_type || 'text',
    status: msg.status || 'sent',
    created_at: msg.created_at || new Date().toISOString(),
    read_at: msg.read_at,
    reply_to_id: msg.reply_to_id || null,
    reply_to: msg.reply_to ? validateMessage(msg.reply_to) : null,
    sender: msg.sender || {
      id: msg.sender_id || '',
      username: 'Unknown User',
      avatar_url: null
    },
    reactions: msg.reactions || []
  };
};

export const removeDuplicateMessages = (messages: Message[]): Message[] => {
  const seen = new Set();
  return messages.filter(message => {
    const duplicate = seen.has(message.id);
    seen.add(message.id);
    return !duplicate;
  });
};

export const groupMessagesByDate = (messages: Message[]): Record<string, Message[]> => {
  return messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);
};

export const formatMessageTime = (date: string) => {
  try {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatMessageTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    console.error('Error formatting timestamp:', e);
    return '';
  }
};

export const shouldShowSender = (message: Message, index: number, messages: Message[], userId?: string): boolean => {
  if (message.sender_id === userId) return false; // Never show for own messages
  if (index === 0) return true; // Always show for first message
  const prevMessage = messages[index - 1];
  // Show if sender changed or time gap > 5 minutes
  return prevMessage.sender_id !== message.sender_id || 
    new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000;
};

export const shouldShowTimestamp = (message: Message, index: number, messages: Message[]): boolean => {
  if (index === 0) return true; // Always show for first message
  
  const prevMessage = messages[index - 1];
  const timeGap = new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime();
  const senderChanged = prevMessage.sender_id !== message.sender_id;
  
  // Show timestamp if:
  // 1. Sender changed OR
  // 2. Time gap is more than 15 minutes
  return senderChanged || timeGap > 15 * 60 * 1000;
};

export const getInitialAvatar = (username: string) => {
  const initial = username?.charAt(0)?.toUpperCase() || '?';
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];
  const colorIndex = username?.length ? username.length % colors.length : 0;
  return { initial, bgColor: colors[colorIndex] };
}; 