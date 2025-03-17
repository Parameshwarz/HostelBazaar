export interface CartItem {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  created_at: string;
}

export interface CartHook {
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
} 