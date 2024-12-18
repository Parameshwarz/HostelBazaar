import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sliders, 
  Search, 
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Clock,
  Filter,
  ChevronDown,
  Tag,
  CircleDollarSign,
  SlidersHorizontal
} from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useCategories } from '../hooks/useCategories';
import ItemCard from '../components/ItemCard';
import { toast } from 'react-hot-toast';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    condition: searchParams.get('condition') || '',
    search: searchParams.get('search') || '',
    sortBy: (searchParams.get('sortBy') as 'price_asc' | 'price_desc' | 'created_at_desc') || 'created_at_desc'
  });

  const { items, isLoading, error } = useItems(filters);
  const { categories } = useCategories();

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    setSearchParams(params);
  };

  const handleApplyFilters = () => {
    toast.success('Filters applied');
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      minPrice: undefined,
      maxPrice: undefined,
      condition: '',
      search: '',
      sortBy: 'created_at_desc'
    });
    setSearchParams(new URLSearchParams());
  };

  const inputClassName = `
    w-full 
    px-4 
    py-3 
    bg-white 
    border 
    border-[#cccccc] 
    rounded-[8px] 
    text-sm 
    transition-all 
    focus:outline-none 
    focus:border-[#4A90E2] 
    focus:shadow-[0_0_4px_rgba(74,144,226,0.4)]
  `;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters Section */}
      <div className="bg-white border border-[#E0E0E0] rounded-[10px] shadow-[0px_2px_6px_rgba(0,0,0,0.1)] p-6 mb-5">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-800">Filters</h2>
        </div>

        {/* Filters Grid - Updated spacing and alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Each filter item gets consistent spacing */}
          <div className="flex flex-col gap-3">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              Category
            </label>
            <div className="relative">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange({ category: e.target.value })}
                className={`${inputClassName} appearance-none`}
                aria-label="Filter by category"
                id="category-filter"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {filters.category && (
            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-gray-700">Subcategory</label>
              <select
                value={filters.subcategory}
                onChange={(e) => handleFilterChange({ subcategory: e.target.value })}
                className={inputClassName}
              >
                <option value="">All Subcategories</option>
                {categories
                  .find(c => c.id === filters.category)
                  ?.subcategories?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              Condition
            </label>
            <div className="relative">
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange({ condition: e.target.value as typeof filters.condition })}
                className={`${inputClassName} appearance-none`}
                aria-label="Filter by condition"
                id="condition-filter"
              >
                <option value="">All Conditions</option>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="used">Used</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              Sort By
            </label>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as typeof filters.sortBy })}
                className={`${inputClassName} appearance-none`}
              >
                <option value="created_at_desc">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Price Range - now with better spacing */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-gray-500" />
              Price Range
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className={inputClassName}
                aria-label="Minimum price"
                id="min-price"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-6 py-3 bg-[#4A90E2] hover:bg-[#3A7BCD] text-white rounded-[8px] 
            font-medium text-sm transition-colors focus:outline-none focus:ring-2 
            focus:ring-[#4A90E2] focus:ring-offset-2 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Items Grid with improved layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {isLoading ? (
          // Loading skeleton grid
          <>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-[10px] shadow-[0px_4px_8px_rgba(0,0,0,0.1)] p-3 animate-pulse">
                <div className="aspect-square w-full bg-gray-200 rounded-lg mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </>
        ) : error ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Error loading items
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No items found
          </div>
        ) : (
          // Actual items grid
          items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
} 