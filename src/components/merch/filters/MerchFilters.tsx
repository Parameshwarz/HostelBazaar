import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Star, Percent, Tag, Clock, TrendingUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface FilterOptions {
  price: {
    min: number;
    max: number;
  };
  colors: string[];
  sizes: string[];
  categories: string[];
  rating: number | null;
  sortBy: 'popularity' | 'price_low' | 'price_high' | 'newest' | 'rating' | 'trending' | null;
  availability: 'all' | 'in_stock' | 'out_of_stock';
  department: string[];
  tags: string[];
  onSale: boolean;
  newArrivals: boolean;
}

interface MerchFiltersProps {
  onFilterChange: (filters: any) => void;
  availableFilters: {
    colors: string[];
    sizes: string[];
    categories: string[];
    departments: string[];
    tags: string[];
    priceRange: { min: number; max: number };
  };
}

// Add this interface for the ref
export interface MerchFiltersRef {
  setIsOpen: (value: boolean) => void;
}

const DEPARTMENTS = [
  'Computer Science',
  'Engineering',
  'Business',
  'Arts',
  'Science',
  'Medicine',
  'Law',
  'Architecture',
  'Design',
  'Sports'
];

const CATEGORIES = [
  't-shirts',
  'hoodies',
  'sweatshirts',
  'caps',
  'jackets',
  'pants',
  'shorts',
  'socks',
  'bags',
  'accessories',
  'stationery',
  'electronics',
  'books',
  'drinkware',
  'gifts',
  'limited-edition'
];

const TAGS = [
  'Bestseller',
  'New Arrival',
  'Limited Edition',
  'Eco-Friendly',
  'Premium',
  'Sale',
  'Custom',
  'Trending',
  'Staff Pick',
  'Award Winner'
];

const MerchFilters = forwardRef<MerchFiltersRef, MerchFiltersProps>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const [customPriceInput, setCustomPriceInput] = useState({
    min: '0',
    max: '5000'
  });

  const [activeFilters, setActiveFilters] = useState({
    categories: searchParams.getAll('category'),
    department: searchParams.getAll('department'),
    tags: searchParams.getAll('tag'),
    colors: [] as string[],
    sizes: [] as string[],
    price: { 
      min: Number(searchParams.get('minPrice')) || 0, 
      max: Number(searchParams.get('maxPrice')) || 5000 
    },
    sortBy: searchParams.get('sortBy') as string || 'newest',
    availability: 'all',
    onSale: searchParams.get('onSale') === 'true',
    newArrivals: searchParams.get('newArrivals') === 'true'
  });

  useEffect(() => {
    const newFilters = {
      categories: searchParams.getAll('category'),
      department: searchParams.getAll('department'),
      tags: searchParams.getAll('tag'),
      colors: [] as string[],
      sizes: [] as string[],
      price: { 
        min: Number(searchParams.get('minPrice')) || 0, 
        max: Number(searchParams.get('maxPrice')) || 5000 
      },
      sortBy: searchParams.get('sortBy') as string || 'newest',
      availability: 'all',
      onSale: searchParams.get('onSale') === 'true',
      newArrivals: searchParams.get('newArrivals') === 'true'
    };

    setActiveFilters(newFilters);
    
    setCustomPriceInput({
      min: String(newFilters.price.min),
      max: String(newFilters.price.max)
    });
  }, [searchParams]);

  const updateFilters = useCallback((newFilters: Partial<typeof activeFilters>) => {
    setActiveFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters };
      props.onFilterChange(updatedFilters);
      return updatedFilters;
    });
  }, [props.onFilterChange]);

  const handleCustomPriceChange = useCallback((value: string, type: 'min' | 'max') => {
    setCustomPriceInput(prev => ({ ...prev, [type]: value }));
  }, []);

  const applyCustomPrice = useCallback(() => {
    const min = Math.max(0, parseInt(customPriceInput.min) || 0);
    const max = Math.max(min, parseInt(customPriceInput.max) || 100000);
    updateFilters({ price: { min, max } });
  }, [customPriceInput, updateFilters]);

  const handlePricePreset = useCallback((min: number, max: number) => {
    setCustomPriceInput({ min: min.toString(), max: max.toString() });
    updateFilters({ price: { min, max } });
  }, [updateFilters]);

  const removeFilter = (type: string, value?: string) => {
    let newFilters = { ...activeFilters };
    
    switch (type) {
      case 'category':
        newFilters.categories = newFilters.categories.filter(cat => cat !== value);
        break;
      case 'department':
        newFilters.department = newFilters.department.filter(dept => dept !== value);
        break;
      case 'tag':
        newFilters.tags = newFilters.tags.filter(tag => tag !== value);
        break;
      case 'price':
        newFilters.price = { min: 0, max: 5000 };
        break;
      case 'sort':
        newFilters.sortBy = 'newest';
        break;
      case 'sale':
        newFilters.onSale = false;
        break;
      case 'new':
        newFilters.newArrivals = false;
        break;
      case 'all':
        newFilters = {
          categories: [],
          department: [],
          tags: [],
          colors: [],
          sizes: [],
          price: { min: 0, max: 5000 },
          sortBy: 'newest',
          availability: 'all',
          onSale: false,
          newArrivals: false
        };
        break;
    }
    
    updateFilters(newFilters);
  };

  // Expose setIsOpen method through ref
  useImperativeHandle(ref, () => ({
    setIsOpen: (value: boolean) => setIsOpen(value)
  }));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed left-4 top-24 w-96 bg-white rounded-xl shadow-xl p-6 z-50 max-h-[85vh] overflow-y-auto border border-gray-100"
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Price Range
              </h4>
              
              {/* Quick Price Presets */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => handlePricePreset(0, 500)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    activeFilters.price.max === 500 ? 'bg-violet-100 text-violet-700' : 'bg-gray-100'
                  }`}
                >
                  Under ₹500
                </button>
                <button
                  onClick={() => handlePricePreset(500, 1000)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    activeFilters.price.min === 500 && activeFilters.price.max === 1000 ? 'bg-violet-100 text-violet-700' : 'bg-gray-100'
                  }`}
                >
                  ₹500 - ₹1000
                </button>
                <button
                  onClick={() => handlePricePreset(1000, 2000)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    activeFilters.price.min === 1000 && activeFilters.price.max === 2000 ? 'bg-violet-100 text-violet-700' : 'bg-gray-100'
                  }`}
                >
                  ₹1000 - ₹2000
                </button>
                <button
                  onClick={() => handlePricePreset(2000, 100000)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    activeFilters.price.min === 2000 ? 'bg-violet-100 text-violet-700' : 'bg-gray-100'
                  }`}
                >
                  Above ₹2000
                </button>
              </div>

              {/* Custom Price Input */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Min Price (₹)</label>
                  <input
                    type="number"
                    value={customPriceInput.min}
                    onChange={(e) => handleCustomPriceChange(e.target.value, 'min')}
                    className="w-full px-3 py-1 border rounded-md text-sm"
                    min="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Max Price (₹)</label>
                  <input
                    type="number"
                    value={customPriceInput.max}
                    onChange={(e) => handleCustomPriceChange(e.target.value, 'max')}
                    className="w-full px-3 py-1 border rounded-md text-sm"
                    min="0"
                  />
                </div>
                <button
                  onClick={applyCustomPrice}
                  className="self-end px-3 py-1 bg-violet-600 text-white rounded-md text-sm hover:bg-violet-700"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Department Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Department
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      const newDepts = activeFilters.department.includes(dept)
                        ? activeFilters.department.filter((d) => d !== dept)
                        : [...activeFilters.department, dept];
                      updateFilters({ department: newDepts });
                    }}
                    className={`px-3 py-1 rounded-md text-sm text-left ${
                      activeFilters.department.includes(dept)
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      const newCategories = activeFilters.categories.includes(category)
                        ? activeFilters.categories.filter((c) => c !== category)
                        : [...activeFilters.categories, category];
                      updateFilters({ categories: newCategories });
                    }}
                    className={`px-3 py-1 rounded-md text-sm text-left ${
                      activeFilters.categories.includes(category)
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = activeFilters.tags.includes(tag)
                        ? activeFilters.tags.filter((t) => t !== tag)
                        : [...activeFilters.tags, tag];
                      updateFilters({ tags: newTags });
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeFilters.tags.includes(tag)
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Quick Filters</h4>
              <div className="space-y-2">
                <button
                  onClick={() => updateFilters({ onSale: !activeFilters.onSale })}
                  className={`w-full px-3 py-2 rounded-md text-sm text-left flex items-center gap-2 ${
                    activeFilters.onSale ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  On Sale
                </button>
                <button
                  onClick={() => updateFilters({ newArrivals: !activeFilters.newArrivals })}
                  className={`w-full px-3 py-2 rounded-md text-sm text-left flex items-center gap-2 ${
                    activeFilters.newArrivals ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  New Arrivals
                </button>
              </div>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Sort By</h4>
              <select
                value={activeFilters.sortBy || ''}
                onChange={(e) => updateFilters({ sortBy: e.target.value as FilterOptions['sortBy'] })}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="">Default</option>
                <option value="trending">Trending</option>
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Availability</h4>
              <select
                value={activeFilters.availability}
                onChange={(e) => updateFilters({ availability: e.target.value as FilterOptions['availability'] })}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="all">All Items</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {props.availableFilters.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      const newColors = activeFilters.colors.includes(color)
                        ? activeFilters.colors.filter((c) => c !== color)
                        : [...activeFilters.colors, color];
                      updateFilters({ colors: newColors });
                    }}
                    className={`w-8 h-8 rounded-full border-2 ${
                      activeFilters.colors.includes(color)
                        ? 'border-violet-600'
                        : 'border-transparent'
                    } hover:scale-110 transition-transform`}
                    style={{ backgroundColor: color }}
                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {props.availableFilters.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      const newSizes = activeFilters.sizes.includes(size)
                        ? activeFilters.sizes.filter((s) => s !== size)
                        : [...activeFilters.sizes, size];
                      updateFilters({ sizes: newSizes });
                    }}
                    className={`px-3 py-1 rounded-md border ${
                      activeFilters.sizes.includes(size)
                        ? 'border-violet-600 bg-violet-50 text-violet-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default MerchFilters; 