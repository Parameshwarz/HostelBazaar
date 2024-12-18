import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Item } from '../types';

interface UseItemsOptions {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: 'new' | 'like_new' | 'used' | '';
  sortBy?: 'price_asc' | 'price_desc' | 'created_at_desc';
}

export function useItems(options: UseItemsOptions) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchItems() {
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('items')
          .select('*');

        // Apply filters
        if (options.category) {
          query = query.eq('category_id', options.category);
        }

        if (options.subcategory) {
          query = query.eq('subcategory_id', options.subcategory);
        }

        if (options.search) {
          query = query.ilike('title', `%${options.search}%`);
        }

        if (options.minPrice) {
          query = query.gte('price', options.minPrice);
        }

        if (options.maxPrice) {
          query = query.lte('price', options.maxPrice);
        }

        if (options.condition) {
          query = query.eq('condition', options.condition.toLowerCase());
        }

        // Apply sorting
        switch (options.sortBy) {
          case 'price_asc':
            query = query.order('price', { ascending: true, nullsLast: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false, nullsFirst: true });
            break;
          default:
            query = query.order('created_at', { ascending: false, nullsLast: true });
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (isMounted) {
          console.log('Fetched items:', data);
          setItems(data || []);
        }
      } catch (err) {
        console.error('Error fetching items:', err);
        if (isMounted) {
          setError(err as Error);
          toast.error('Failed to load items');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchItems();

    return () => {
      isMounted = false;
    };
  }, [
    options.category,
    options.subcategory,
    options.search,
    options.minPrice,
    options.maxPrice,
    options.condition,
    options.sortBy
  ]);

  return { items, isLoading, error };
}