import { supabase } from '../lib/supabaseClient';

interface Category {
  id: string;
  name: string;
  icon?: string;
  itemCount: number;
}

const fetchCategories = async () => {
  try {
    // First get all categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    console.log('Raw categories:', categoriesData); // Debug log

    if (categoriesError) throw categoriesError;

    // Debug: Check the first few items and their structure
    const { data: sampleItems, error: sampleError } = await supabase
      .from('items')
      .select('*')
      .limit(5);

    console.log('Sample items to check structure:', sampleItems); // This will show us the actual column names

    // Then get count for each category with detailed logging
    const categoriesWithCounts = await Promise.all(
      categoriesData.map(async (category) => {
        // Try both possible column names
        const { count: count1, error: error1 } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        const { count: count2, error: error2 } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('category', category.id);

        console.log(`Counts for ${category.name}:`, {
          usingCategoryId: count1,
          usingCategory: count2,
          error1,
          error2
        });

        return {
          ...category,
          itemCount: count1 || count2 || 0
        };
      })
    );

    console.log('Final categories with counts:', categoriesWithCounts);
    setCategories(categoriesWithCounts);

  } catch (error) {
    console.error('Error in fetchCategories:', error);
  }
}; 