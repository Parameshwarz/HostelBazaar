import { Message, MessageStatus, MessageReaction } from '../../types';

export interface DatabaseMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  content_type: 'text' | 'image' | 'file';
  status: MessageStatus;
  created_at: string;
  read_at: string | null;
  reply_to_id: string | null;
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  reactions?: MessageReaction[];
  edited_at?: string;
  reply_to?: DatabaseMessage | null;
}

export { Message, MessageStatus, MessageReaction }; 