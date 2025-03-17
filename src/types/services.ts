export interface ServiceLevel {
  id?: string;
  service_id?: string;
  name: string;
  price: number;
  description: string;
  delivery_time: string;
  revisions: number;
  features: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  short_description: string;
  provider_id: string;
  category_id: string;
  price_type: 'fixed' | 'hourly' | 'project';
  starting_price: number;
  delivery_time: string;
  experience_level: 'beginner' | 'intermediate' | 'expert';
  skills: string[];
  portfolio_links: string[];
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  total_orders: number;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  provider?: {
    id: string;
    username: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  service_levels?: ServiceLevel[];
  reviews?: ServiceReview[];
  trust_score?: TrustScore;
  ai_summary?: {
    strengths: string[];
    popular_with: string[];
    best_suited_for: string[];
    success_rate: number;
    trending_score: number;
  };
}

export interface ServiceReview {
  id: string;
  service_id: string;
  client_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface ServiceOrder {
  id: string;
  service_id: string;
  client_id: string;
  provider_id: string;
  service_level: 'basic' | 'standard' | 'premium';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requirements: string;
  price: number;
  delivery_date: string;
  created_at: string;
  updated_at: string;
  milestones?: {
    id: string;
    title: string;
    description: string;
    due_date: string;
    price: number;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
}

export interface TrustScore {
  id: string;
  provider_id: string;
  overall_score: number;
  delivery_speed_score: number;
  communication_score: number;
  quality_score: number;
  revision_responsiveness: number;
  total_completed_orders: number;
  on_time_delivery_rate: number;
  repeat_client_rate: number;
  avg_response_time: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_categories: string[];
  preferred_price_range: [number, number];
  preferred_delivery_time: string;
  preferred_experience_levels: string[];
  preferred_languages: string[];
  interests: string[];
  created_at: string;
  updated_at: string;
}

export interface ServiceCompatibility {
  id: string;
  service_id: string;
  user_id: string;
  compatibility_score: number;
  match_reasons: Array<{
    type: 'category_match' | 'price_match' | 'experience_match' | 'skills_match';
    weight: number;
    details?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface UserBehaviorLog {
  id: string;
  user_id: string;
  service_id: string;
  action_type: 'view' | 'bookmark' | 'contact' | 'order' | 'review';
  action_details: Record<string, any>;
  created_at: string;
} 