import { Folder } from 'lucide-react';
import CategoryCard from './CategoryCard';

interface CategoriesSectionProps {
  categoryStats: any[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export default function CategoriesSection({ 
  categoryStats, 
  selectedCategory, 
  setSelectedCategory 
}: CategoriesSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Folder className="h-5 w-5 text-indigo-600" />
          Browse by Category
        </h2>
        <button 
          onClick={() => setSelectedCategory(null)}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryStats.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.name}
            onClick={() => setSelectedCategory(category.name)}
          />
        ))}
      </div>
    </div>
  );
} 