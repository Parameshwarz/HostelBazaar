export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  chat_id: string;
  sender_id: string;
  reply_to_id: string | null;
  status: 'error' | 'delivered' | 'seen' | 'sending' | 'sent' | 'deleted';
  content_type: 'text' | 'image' | 'file';
  edited_at?: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  reply_to?: Message | null;
  message_reactions?: MessageReaction[];
}

export type User = {
  id: string;
  username: string;
  avatar_url?: string;
};

export type Item = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  images: string[];
  created_at: string;
  category_id: string;
  subcategory_id: string;
  user_id: string;
  is_negotiable: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string;
    hostel_name?: string;
    room_number?: string;
  };
};

export type TypingStatus = {
  user_id: string;
  is_typing: boolean;
  last_typed: string;
};

export type Chat = {
  id: string;
  participant_1: string;
  participant_2: string;
  item_id?: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at?: string;
  is_pinned: boolean;
  meeting_scheduled: boolean;
  location_agreed: boolean;
  deal_completed: boolean;
  other_user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

export type ChatParticipant = {
  id: string;
  username: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen?: string;
  about?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  subcategories?: Subcategory[];
  item_count: number;
  items?: { count: number }[];
};

export const CATEGORY_NAMES = {
  'books-and-stationery': 'Books and Stationery',
  'electronics': 'Electronics',
  'furniture': 'Furniture',
  'clothing': 'Clothing',
  'kitchen': 'Kitchen',
  'appliances': 'Appliances',
  'sports': 'Sports',
  'other': 'Other'
} as const;

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
};

export interface UserTrustInfo {
  user_id: string;
  trust_score: number;
  avg_response_time?: string;
  completed_deals: number;
  positive_ratings_percentage: number;
  created_at: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  awarded_at: string;
}