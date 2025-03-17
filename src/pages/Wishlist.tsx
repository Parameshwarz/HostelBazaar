import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import ItemCard from '../components/ItemCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Item } from '../types';

export default function Wishlist() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('wishlists')
          .select(`
            items (
              *,
              profiles (
                id,
                username,
                avatar_url
              ),
              category:categories (
                id,
                name,
                slug
              ),
              subcategory:subcategories (
                id,
                name,
                slug
              )
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Filter out any null items and map to the items array
        const validItems = data
          ?.map(w => w.items)
          .filter((item): item is Item => item !== null);
        
        setItems(validItems || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] mt-16">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Wishlist</h1>
        <p className="text-gray-500 mb-6">Please login to view your wishlist</p>
        <Link
          to="/login"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Your Wishlist</h1>
        <span className="text-gray-500">({items.length} items)</span>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-4">
              <div className="bg-gray-200 h-48 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500">
            Start adding items you like to your wishlist!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
} 