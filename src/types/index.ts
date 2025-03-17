// Message Types
export interface MessageSender {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface MessageReactionUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'error' | 'deleted';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  username: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  content_type: string;
  sender_id: string;
  created_at: string;
  status: MessageStatus;
  read_at: string | null;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  reply_to_id: string | null;
  reply_to: Message | null;
  reactions: MessageReaction[];
  edited_at?: string;
}

export interface ReactionGroup {
  count: number;
  users: string[];
}

// Database Types
export interface DatabaseMessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user: MessageReactionUser | null;
}

export interface DatabaseMessage {
  id: string;
  chat_id: string;
  content: string;
  content_type: 'text' | 'image' | 'file';
  sender_id: string;
  created_at: string;
  status: 'sending' | 'sent' | 'delivered' | 'seen' | 'error' | 'deleted';
  read_at: string | null;
  sender: MessageSender | null;
  reply_to: DatabaseMessage[] | null;
  reactions: DatabaseMessageReaction[] | null;
}

// Chat Types
export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  participants: string[];
  last_message?: Message;
  unread_count?: number;
  other_user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  user_metadata?: {
    username: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
}

// Item Types
export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  images: string[];
  category_id: string;
  subcategory_id: string;
  hostel_name: string;
  room_number: string;
  is_negotiable: boolean;
  is_anonymous: boolean;
  user_id: string;
  created_at: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

// Other Types
export interface Category {
  id: string;
  name: string;
  item_count: number;
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

export type SortBy = 'price_asc' | 'price_desc' | 'created_at_desc' | 'relevance';

export interface Filters {
  categories: string[];
  subcategories: string[];
  conditions: string[];
  minPrice?: number;
  maxPrice?: number;
  search: string;
  sortBy: 'price_asc' | 'price_desc' | 'created_at_desc' | 'relevance';
  showWishlisted: boolean;
}

export interface SearchParams {
  categories?: string[];
  subcategories?: string[];
  conditions?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
  page?: number;
  limit?: number;
}

export interface FilterPreset {
  name: string;
  filters: Partial<Filters>;
}

export interface FilterSidebarProps {
  filters: Filters;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    subcategories?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
  onFilterChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
  filterPresets: FilterPreset[];
  onApplyPreset: (preset: FilterPreset) => void;
}