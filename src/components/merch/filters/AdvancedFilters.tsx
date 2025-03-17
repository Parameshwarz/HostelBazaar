import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Star, DollarSign, Palette } from 'lucide-react';

interface FilterOptions {
  price: {
    min: number;
    max: number;
  };
  colors: string[];
  sizes: string[];
  categories: string[];
  rating: number | null;
  sortBy: 'popularity' | 'price_low' | 'price_high' | 'newest' | null;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableFilters: {
    colors: string[];
    sizes: string[];
    categories: string[];
    priceRange: { min: number; max: number };
  };
}

export default function AdvancedFilters({ onFilterChange, availableFilters }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    price: { min: availableFilters.priceRange.min, max: availableFilters.priceRange.max },
    colors: [],
    sizes: [],
    categories: [],
    rating: null,
    sortBy: null,
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const colorOptions = [
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Black', value: 'black', class: 'bg-black' },
    { name: 'White', value: 'white', class: 'bg-white border border-gray-200' },
  ];

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700
          transition-colors flex items-center gap-2"
      >
        <Filter className="w-5 h-5" />
        Advanced Filters
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl
              border border-gray-100 z-50"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <button
                    onClick={() => setActiveSection(activeSection === 'price' ? null : 'price')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-violet-600" />
                      <span className="font-medium">Price Range</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeSection === 'price' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === 'price' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-4">
                          <div className="flex gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Min</label>
                              <input
                                type="number"
                                value={filters.price.min}
                                onChange={(e) => handleFilterChange({
                                  price: { ...filters.price, min: Number(e.target.value) }
                                })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2
                                  focus:ring-violet-500 focus:border-violet-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Max</label>
                              <input
                                type="number"
                                value={filters.price.max}
                                onChange={(e) => handleFilterChange({
                                  price: { ...filters.price, max: Number(e.target.value) }
                                })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2
                                  focus:ring-violet-500 focus:border-violet-500"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Colors */}
                <div>
                  <button
                    onClick={() => setActiveSection(activeSection === 'colors' ? null : 'colors')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-violet-600" />
                      <span className="font-medium">Colors</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeSection === 'colors' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === 'colors' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <div className="flex flex-wrap gap-3">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => {
                                  const newColors = filters.colors.includes(color.value)
                                    ? filters.colors.filter((c) => c !== color.value)
                                    : [...filters.colors, color.value];
                                  handleFilterChange({ colors: newColors });
                                }}
                                className={`w-8 h-8 rounded-full ${color.class} ${
                                  filters.colors.includes(color.value)
                                    ? 'ring-2 ring-violet-600 ring-offset-2'
                                    : ''
                                }`}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sizes */}
                <div>
                  <button
                    onClick={() => setActiveSection(activeSection === 'sizes' ? null : 'sizes')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="font-medium">Sizes</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeSection === 'sizes' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === 'sizes' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <div className="flex flex-wrap gap-2">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                              <button
                                key={size}
                                onClick={() => {
                                  const newSizes = filters.sizes.includes(size)
                                    ? filters.sizes.filter((s) => s !== size)
                                    : [...filters.sizes, size];
                                  handleFilterChange({ sizes: newSizes });
                                }}
                                className={`px-4 py-2 rounded-lg border transition-colors ${
                                  filters.sizes.includes(size)
                                    ? 'bg-violet-600 text-white border-violet-600'
                                    : 'border-gray-200 hover:border-violet-600'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Rating */}
                <div>
                  <button
                    onClick={() => setActiveSection(activeSection === 'rating' ? null : 'rating')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-violet-600" />
                      <span className="font-medium">Rating</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeSection === 'rating' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === 'rating' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <div className="space-y-2">
                            {[4, 3, 2, 1].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => handleFilterChange({ rating })}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg
                                  transition-colors ${
                                    filters.rating === rating
                                      ? 'bg-violet-50 text-violet-600'
                                      : 'hover:bg-gray-50'
                                  }`}
                              >
                                <div className="flex items-center">
                                  {Array.from({ length: rating }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className="w-4 h-4 text-yellow-400 fill-current"
                                    />
                                  ))}
                                  {Array.from({ length: 5 - rating }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className="w-4 h-4 text-gray-300"
                                    />
                                  ))}
                                </div>
                                <span>& Up</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sort By */}
                <div>
                  <button
                    onClick={() => setActiveSection(activeSection === 'sort' ? null : 'sort')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="font-medium">Sort By</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeSection === 'sort' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === 'sort' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <div className="space-y-2">
                            {[
                              { id: 'popularity', label: 'Most Popular' },
                              { id: 'price_low', label: 'Price: Low to High' },
                              { id: 'price_high', label: 'Price: High to Low' },
                              { id: 'newest', label: 'Newest First' },
                            ].map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleFilterChange({
                                  sortBy: option.id as FilterOptions['sortBy']
                                })}
                                className={`w-full text-left px-3 py-2 rounded-lg
                                  transition-colors ${
                                    filters.sortBy === option.id
                                      ? 'bg-violet-50 text-violet-600'
                                      : 'hover:bg-gray-50'
                                  }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700
                    transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 