import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { TradingItem, RequestItem } from '../../types/trade';
import { Loader2, ArrowRight } from 'lucide-react';

interface SimilarItemsSectionProps {
  request: RequestItem;
  onSelectItem?: (item: TradingItem) => void;
}

export default function SimilarItemsSection({ request, onSelectItem }: SimilarItemsSectionProps) {
  const [similarItems, setSimilarItems] = useState<TradingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarItems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build a search query based on the request title and description
        const searchTerms = `${request.title} ${request.description || ''}`.toLowerCase();
        const keywords = searchTerms
          .split(/\s+/)
          .filter(word => word.length > 3) // Only use words longer than 3 chars
          .slice(0, 5) // Limit to 5 keywords
          .join(' | '); // OR operator for text search

        // Query for similar items
        let query = supabase
          .from('items')
          .select('*')
          .eq('status', 'available')
          .not('user_id', 'eq', request.user_id); // Don't show requester's own items

        // If we have a category, filter by it
        if (request.category_id) {
          query = query.eq('category_id', request.category_id);
        }

        // If we have keywords, use text search
        if (keywords) {
          query = query.textSearch('title', keywords, { 
            config: 'english',
            type: 'websearch'
          });
        }

        // If we have a budget range, filter by price
        if (request.min_budget && request.max_budget) {
          query = query
            .gte('price', request.min_budget * 0.8) // 20% below min budget
            .lte('price', request.max_budget * 1.2); // 20% above max budget
        }

        // Limit results and order by relevance
        const { data, error } = await query.limit(4);

        if (error) throw error;
        setSimilarItems(data || []);
      } catch (err) {
        console.error('Error fetching similar items:', err);
        setError('Failed to load similar items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarItems();
  }, [request]);

  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
        <p className="mt-2 text-sm text-gray-600">Finding similar items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (similarItems.length === 0) {
    return (
      <div className="py-6 text-center border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-600">No similar items found</p>
        <p className="text-sm text-gray-500 mt-1">Check back later or browse all items</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">Similar Items</h3>
        <Link to="/items" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {similarItems.map((item) => (
          <div 
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectItem?.(item)}
          >
            {item.images && item.images.length > 0 ? (
              <div className="aspect-[4/3] relative">
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 text-xs">No image</p>
              </div>
            )}
            
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</h4>
              <p className="text-sm font-semibold text-indigo-600 mt-1">₹{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 