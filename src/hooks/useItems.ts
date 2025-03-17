import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Item } from '../types';
import { calculateSimilarity } from '../utils/searchUtils';
import { useAuthStore } from '../store/authStore';

type Filters = {
  category: string;
  subcategory: string;
  minPrice?: number;
  maxPrice?: number;
  condition: string;
  search: string;
  sortBy: 'price_asc' | 'price_desc' | 'created_at_desc';
  showWishlisted: boolean;
  limit?: number;
};

export const useItems = (filters: Filters) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      try {
        setIsLoading(true);
        
        // Simple query to get latest items
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(filters.limit || 4);  // Default to 4 items if no limit specified

        if (error) throw error;

        if (isMounted && data) {
          setItems(data);
          setTotalCount(data.length);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        if (isMounted) {
          setError(error as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return { items, isLoading, error, totalCount };
};