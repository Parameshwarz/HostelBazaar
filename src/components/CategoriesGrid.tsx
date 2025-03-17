import { motion } from 'framer-motion';
import { CategoryCard } from './CategoryCard';
import { Search } from 'lucide-react';

interface CategoriesGridProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon?: string;
    item_count: number;
  }>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const CategoriesGrid = ({ categories }: CategoriesGridProps) => {
  return (
    <div className="space-y-8">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search in all categories..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-medium
            hover:bg-indigo-100 transition-colors">
            New Arrivals
          </button>
          <button className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium
            hover:bg-emerald-100 transition-colors">
            Best Deals
          </button>
          <button className="px-4 py-2 rounded-xl bg-amber-50 text-amber-600 text-sm font-medium
            hover:bg-amber-100 transition-colors">
            Trending
          </button>
        </div>
      </div>

      {/* Featured Category */}
      {categories.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Featured Category</h2>
            <p className="text-lg opacity-90 mb-4">
              {categories[0].name} - Discover amazing deals!
            </p>
            <button className="px-6 py-2 rounded-xl bg-white text-indigo-600 font-medium
              hover:bg-opacity-90 transition-colors">
              Explore Now
            </button>
          </div>
          <div className="absolute inset-0 bg-black opacity-20" />
        </div>
      )}

      {/* Categories Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {categories.map((category) => (
          <motion.div key={category.id} variants={item}>
            <CategoryCard
              name={category.name}
              slug={category.slug}
              icon={category.icon || 'MoreHorizontal'}
              itemCount={category.item_count}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No categories found</p>
        </div>
      )}
    </div>
  );
}; 