import React from 'react';
import { motion } from 'framer-motion';
import { ItemFormData } from '../../pages/NewItem';
import { useCategories } from '../../hooks/useCategories';
import { Loader } from 'lucide-react';

type Props = {
  data: ItemFormData;
  onUpdate: (data: Partial<ItemFormData>) => void;
};

export default function CategorySelection({ data, onUpdate }: Props) {
  const { categories, isLoading, error } = useCategories();
  const selectedCategory = categories?.find(c => c.slug === data.category);

  console.log('Current categories:', categories);
  console.log('Selected category:', selectedCategory);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        Error loading categories. Please try again later.
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No categories available.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={data.category}
          onChange={(e) => onUpdate({ category: e.target.value, subcategory: '' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a category</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name} ({category.item_count} items)
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
            Subcategory
          </label>
          <select
            id="subcategory"
            value={data.subcategory}
            onChange={(e) => onUpdate({ subcategory: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a subcategory</option>
            {selectedCategory.subcategories.map((sub) => (
              <option key={sub.id} value={sub.slug}>
                {sub.name} ({sub.item_count} items)
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Helper text */}
      <p className="text-sm text-gray-500">
        Choose the most appropriate category for your item to help buyers find it easily.
      </p>
    </motion.div>
  );
} 