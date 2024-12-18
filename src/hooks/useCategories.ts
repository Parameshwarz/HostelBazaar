import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../utils/supabase-types';

type CategoryWithCount = Database['public']['Tables']['categories']['Row'] & {
  item_count: number;
};

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            *,
            subcategories (
              id,
              name,
              category_id
            )
          `);

        if (categoriesError) throw categoriesError;

        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Error in useCategories:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}