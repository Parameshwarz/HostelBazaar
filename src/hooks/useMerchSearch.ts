import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { Product } from '../types/merch';

interface MerchSearchOptions {
  maxResults?: number;
  includeOutOfStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  category?: string[];
  priceRange?: { min: number; max: number };
  sizes?: string[];
  colors?: string[];
}

interface SearchResults {
  data: Product[];
  total: number;
  hasMore: boolean;
}

export const useMerchSearch = () => {
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's search history
  useEffect(() => {
    if (user) {
      fetchSearchHistory();
      fetchRecentlyViewed();
    }
  }, [user]);

  // Fetch popular searches
  useEffect(() => {
    fetchPopularSearches();
  }, []);

  const fetchSearchHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_search_history')
        .select('query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchHistory(data.map(item => item.query));
    } catch (err) {
      console.error('Error fetching search history:', err);
    }
  };

  const fetchRecentlyViewed = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('product_views')
        .select('product_id')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentlyViewed(data.map(item => item.product_id));
    } catch (err) {
      console.error('Error fetching recently viewed:', err);
    }
  };

  const fetchPopularSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('popular_searches')
        .select('query, count')
        .order('count', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPopularSearches(data.map(item => item.query));
    } catch (err) {
      console.error('Error fetching popular searches:', err);
    }
  };

  const searchProducts = async (
    query: string, 
    options: {
      category?: string[];
      priceRange?: { min: number; max: number };
      sortBy?: string;
      includeOutOfStock?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<SearchResults> => {
    try {
      setIsSearching(true);
      
      const {
        category,
        priceRange,
        sortBy = 'newest',
        includeOutOfStock = false,
        page = 1,
        limit = 12
      } = options;

      // Calculate offset
      const offset = (page - 1) * limit;

      let queryBuilder = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Apply filters
      if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      }

      if (category?.length) {
        queryBuilder = queryBuilder.in('category', category);
      }

      if (priceRange) {
        queryBuilder = queryBuilder
          .gte('price', priceRange.min)
          .lte('price', priceRange.max);
      }

      if (!includeOutOfStock) {
        queryBuilder = queryBuilder.gt('stock_count', 0);
      }

      // Add pagination
      queryBuilder = queryBuilder
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      return {
        data: data || [], // Ensure we always return an array
        total: count || 0,
        hasMore: Boolean(data && data.length === limit)
      };
    } catch (error) {
      console.error('Search products error:', error);
      return {
        data: [],
        total: 0,
        hasMore: false
      };
    } finally {
      setIsSearching(false);
    }
  };

  const recordSearch = async (query: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_search_history')
        .insert({
          user_id: user.id,
          query,
          created_at: new Date().toISOString()
        });

      // Update popular searches count
      await supabase.rpc('increment_search_count', {
        search_query: query
      });

      // Refresh search history
      fetchSearchHistory();
    } catch (err) {
      console.error('Error recording search:', err);
    }
  };

  const recordProductView = async (productId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('product_views')
        .insert({
          user_id: user.id,
          product_id: productId,
          viewed_at: new Date().toISOString()
        });

      // Increment product view count
      await supabase.rpc('increment_product_views', {
        product_id: productId
      });

      // Refresh recently viewed
      fetchRecentlyViewed();
    } catch (err) {
      console.error('Error recording product view:', err);
    }
  };

  const clearSearchHistory = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_search_history')
        .delete()
        .eq('user_id', user.id);

      setSearchHistory([]);
      toast.success('Search history cleared');
    } catch (err) {
      console.error('Error clearing search history:', err);
      toast.error('Failed to clear search history');
    }
  };

  return {
    searchProducts,
    recordProductView,
    clearSearchHistory,
    searchHistory,
    recentlyViewed,
    popularSearches,
    isSearching,
    error
  };
}; 