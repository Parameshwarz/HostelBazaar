export interface MessageReaction {
  id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
  username?: string;
}

export interface Message {
  id: string;
  content: string;
  content_type: 'text' | 'image' | 'voice' | 'file';
  chat_id: string;
  sender_id: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  reactions: MessageReaction[];
  profiles: {
    id: string;
    username: string;
    avatar_url?: string;
  }[];
  message_reactions?: {
    id: string;
    user_id: string;
    reaction_type: string;
    created_at: string;
  }[];
  sender?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  deleted_at?: string;
  edited_at?: string;
  reply_to?: {
    id: string;
    content: string;
    sender_id: string;
    content_type?: 'text' | 'image' | 'video' | 'voice' | 'file';
  };
}

export type User = {
  id: string;
  username: string;
  avatar_url?: string;
};

export type Item = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  condition: string;
  category_id: string;
  subcategory_id: string | null;
  images: string[];
  uploader_id: string;
  hostel_name: string;
  room_number: string;
  is_negotiable: boolean;
  created_at: string;
  uploader_username: string;
  uploader_avatar_url: string | null;
};

export type TypingStatus = {
  userId: string;
  username: string;
};

export type Chat = {
  id: string;
  participant_1: string;
  participant_2: string;
  item_id?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  other_user: ChatParticipant;
  item: Item;
  typing_status?: TypingStatus;
};

export type ChatParticipant = {
  id: string;
  username: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen?: string;
  about?: string;
};