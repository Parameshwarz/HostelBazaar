export interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  user_id: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  price: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: string;
  is_active: boolean;
  created_at: string;
  stock_count: number;
  view_count: number;
  product_images?: {
    image_url: string;
    is_primary: boolean;
  }[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  theme: {
    bgColor: string;
    textColor: string;
    accentColor: string;
  };
  products: Product[];
}

export interface UserPreferences {
  favoriteCategories: string[];
  recentlyViewed: string[];
  purchaseHistory: string[];
  sizingPreferences?: {
    tops: string;
    bottoms: string;
    shoes: string;
  };
  colorPreferences?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  created_at: string;
  user_id: string;
  status: 'available' | 'sold' | 'reserved';
  location?: string;
  tags?: string[];
}

export interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (productId: string) => Promise<void>;
} 