import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Tag, DollarSign, Star } from 'lucide-react';

interface MerchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    rating: number;
    inStock: boolean;
    onSale: boolean;
  };
  onFilterChange: (filters: any) => void;
}

const categories = [
  'All',
  'Clothing',
  'Accessories',
  'Stationery',
  'Electronics',
  'Books',
  'Others'
];

export default function MerchFilters({ isOpen, onClose, filters, onFilterChange }: MerchFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Filters Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Categories */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-violet-600" />
                  <h3 className="font-medium">Categories</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => updateFilter('category', category === 'All' ? '' : category.toLowerCase())}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        (category === 'All' && !filters.category) || 
                        filters.category === category.toLowerCase()
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-violet-600" />
                  <h3 className="font-medium">Price Range</h3>
                </div>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={filters.maxPrice || 10000}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full accent-violet-600"
                  />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
                      <input
                        type="number"
                        placeholder="₹0"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
                      <input
                        type="number"
                        placeholder="₹10000"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-violet-600" />
                  <h3 className="font-medium">Minimum Rating</h3>
                </div>
                <div className="flex gap-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => updateFilter('rating', rating)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm transition-all ${
                        filters.rating === rating
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rating}★ & up
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-600/20"
                  />
                  <span className="text-gray-700">In Stock Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => updateFilter('onSale', e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-600/20"
                  />
                  <span className="text-gray-700">On Sale</span>
                </label>
              </div>
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white border-t p-4">
              <button
                onClick={onClose}
                className="w-full py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 