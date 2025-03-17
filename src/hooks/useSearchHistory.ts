import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  count: number;
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchHistoryItem[]>([]);
  const { user } = useAuth();

  // Fetch search history on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchSearchHistory();
      fetchPopularSearches();
    } else {
      setSearchHistory([]);
      setPopularSearches([]);
    }
  }, [user]);

  const fetchSearchHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_search_history')
        .select('query, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setSearchHistory(
        data?.map(item => ({
          query: item.query,
          timestamp: new Date(item.created_at).getTime(),
          count: 1
        })) || []
      );
    } catch (error) {
      console.error('Error fetching search history:', error);
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

      setPopularSearches(
        data?.map(item => ({
          query: item.query,
          timestamp: Date.now(),
          count: item.count
        })) || []
      );
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const addToHistory = useCallback(async (query: string) => {
    if (!user) return;
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    try {
      // Add to user's search history
      await supabase
        .from('user_search_history')
        .insert({ 
          query: trimmedQuery,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      // Increment search count in popular searches
      await supabase.rpc('increment_search_count', {
        search_query: trimmedQuery
      });

      // Refresh the lists
      await Promise.all([
        fetchSearchHistory(),
        fetchPopularSearches()
      ]);
    } catch (error) {
      console.error('Error adding search to history:', error);
    }
  }, [user]);

  const removeFromHistory = useCallback(async (query: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_search_history')
        .delete()
        .match({ query: query });
      
      await fetchSearchHistory();
      toast.success('Search removed from history');
    } catch (error) {
      console.error('Error removing search:', error);
      toast.error('Failed to remove search');
    }
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_search_history')
        .delete()
        .neq('query', '');
      
      setSearchHistory([]);
      toast.success('Search history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    }
  }, [user]);

  const getPopularSearches = useCallback(() => {
    return popularSearches;
  }, [popularSearches]);

  const getRecentSearches = useCallback(() => {
    return searchHistory;
  }, [searchHistory]);

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getPopularSearches,
    getRecentSearches
  };
} 