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
  const selectedSubcategory = selectedCategory?.subcategories?.find(s => s.slug === data.subcategory);

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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = categories.find(c => c.slug === e.target.value);
    onUpdate({ 
      category: e.target.value,
      category_id: category?.id,
      subcategory: '',
      subcategory_id: undefined
    });
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategory = selectedCategory?.subcategories?.find(s => s.slug === e.target.value);
    onUpdate({ 
      subcategory: e.target.value,
      subcategory_id: subcategory?.id
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Category
        </label>
        <div className="grid grid-cols-2 gap-3">
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange({ target: { value: category.slug } } as any)}
              className={`flex items-center p-4 rounded-lg border-2 transition-all
                ${data.category === category.slug 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-gray-500">
                  {category.subcategories?.length} subcategories
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Subcategory
          </label>
          <div className="grid grid-cols-2 gap-3">
            {selectedCategory.subcategories?.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubcategoryChange({ target: { value: sub.slug } } as any)}
                className={`flex items-center p-4 rounded-lg border-2 transition-all
                  ${data.subcategory === sub.slug 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
              >
                <span className="font-medium">{sub.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Helper text */}
      <p className="text-sm text-gray-500">
        Choose the most appropriate category for your item to help buyers find it easily.
      </p>
    </motion.div>
  );
} 