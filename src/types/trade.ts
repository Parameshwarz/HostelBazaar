export interface TradingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  condition: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  user_id: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  status?: 'available' | 'sold' | 'reserved';
}

export interface MeetupLocation {
  id: string;
  name: string;
  description: string;
  isOfficial: boolean;
  openingHours: string;
  safetyRating: number;
}

export interface MeetupData {
  itemId: string;
  sellerId: string;
  buyerId: string;
  locationId: string;
  meetupTime: string;
}

export interface Seller {
  id: string;
  username: string;
  avatar_url?: string;
  department: string;
  rating: number;
  trades: number;
}

export interface StatItem {
  label: string;
  value: number | string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high';
export type RequestStatus = 'open' | 'matched' | 'fulfilled' | 'closed';

export interface RequestItem {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  user_id: string;
  min_budget?: number;
  max_budget?: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  images: string[];
  matches_count: number;
  created_at: string;
  updated_at: string;
  
  // Join fields
  profiles?: {
    username: string;
    avatar_url?: string;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface RequestMatch {
  id: string;
  request_id: string;
  user_id: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  item_id?: string;
  items?: {
    id: string;
    title: string;
    images: string[];
    condition: string;
    price: number;
  }[];
  item_details?: {
    title: string;
    condition: string;
    price: number;
    item_id?: string;
    images?: string[];
  };
}

export interface RequestFilters {
  categories?: string[];
  urgency?: UrgencyLevel[];
  status?: RequestStatus[];
  budget_min?: number;
  budget_max?: number;
  search?: string;
  sortBy?: 'urgency' | 'created_at' | 'budget' | 'matches';
  timeframe?: 'today' | 'week' | 'month' | 'all';
} 