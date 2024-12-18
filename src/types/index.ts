export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: 'New' | 'Like New' | 'Used' | 'Damaged';
  category: string;
  images: string[];
  uploader_id: string;
  created_at: string;
  is_negotiable: boolean;
}

export interface Category {
  id: string;
  name: string;
  item_count: number;
}

export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  participant_1: string;
  participant_2: string;
  last_message?: string;
  last_message_at?: string;
  other_user: {
    id: string;
    username: string;
    avatar_url?: string;
    is_online?: boolean;
  };
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  content_type: string;
  file_url?: string;
  created_at: string;
  updated_at?: string;
  status: 'sent' | 'delivered' | 'read';
  reactions?: any[];
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  is_online?: boolean;
}

export interface TypingStatus {
  userId: string;
  username: string;
  isTyping: boolean;
}