import { useState, useEffect } from 'react';
import { getCategoriesWithCount } from '../lib/supabase/queries';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  item_count?: number;
  subcategories?: Array<{
    id: string;
    name: string;
    slug: string;
    item_count?: number;
  }>;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await getCategoriesWithCount();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, fetchCategories };
};