import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  SlidersHorizontal, 
  CircleDollarSign, 
  ArrowUpDown,
  ChevronDown,
  Sparkles,
  X,
  Search,
  BookOpen,
  Laptop,
  Shirt,
  Home,
  Gamepad
} from 'lucide-react';
import type { Filters, SortOption } from '../types/filters';
import PriceRangeSlider from './trade/PriceRangeSlider';

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  item_count?: number;
}

interface FilterPreset {
  name: string;
  filters: Partial<Filters>;
}

interface FilterSidebarProps {
  filters: Filters;
  categories: Category[];
  onFilterChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
  filterPresets: FilterPreset[];
  onApplyPreset: (preset: FilterPreset) => void;
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'books-and-stationery': <BookOpen className="w-4 h-4" />,
  'electronics': <Laptop className="w-4 h-4" />,
  'clothing': <Shirt className="w-4 h-4" />,
  'room-essentials': <Home className="w-4 h-4" />,
  'gaming': <Gamepad className="w-4 h-4" />
};

const FilterSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: number;
}> = ({ title, icon, children, defaultOpen = true, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
        aria-expanded={isOpen}
        aria-controls={`filter-section-${title}`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-700">{title}</span>
          {badge !== undefined && badge > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`filter-section-${title}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FilterSidebar({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
  filterPresets,
  onApplyPreset
}: FilterSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Get total active filters count
  const getActiveFiltersCount = () => {
    return filters.categories.length + 
           filters.subcategories.length + 
           filters.conditions.length + 
           (filters.minPrice ? 1 : 0) + 
           (filters.maxPrice ? 1 : 0);
  };

  // Filter categories based on search
  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories?.some(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => (b.item_count || 0) - (a.item_count || 0));

  // Handle category selection
  const handleCategoryChange = (category: Category, isChecked: boolean) => {
    const newCategories = isChecked
      ? [...filters.categories, category.slug]
      : filters.categories.filter(c => c !== category.slug);

    // When unchecking a category, remove its subcategories from filters
    const subcategoriesToRemove = category.subcategories?.map(sub => sub.slug) || [];
    const newSubcategories = isChecked
      ? filters.subcategories
      : filters.subcategories.filter(sub => !subcategoriesToRemove.includes(sub));

    onFilterChange({ 
      categories: newCategories,
      subcategories: newSubcategories
    });
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (categorySlug: string, subSlug: string, isChecked: boolean) => {
    let newCategories = [...filters.categories];
    if (isChecked && !newCategories.includes(categorySlug)) {
      newCategories.push(categorySlug);
      setExpandedCategories(prev => [...prev, categorySlug]);
    }

    const category = categories.find(c => c.slug === categorySlug);
    const newSubcategories = isChecked
      ? [...filters.subcategories, subSlug]
      : filters.subcategories.filter(s => s !== subSlug);
    
    if (!isChecked && category?.subcategories) {
      const remainingSubcategories = category.subcategories
        .map(sub => sub.slug)
        .filter(slug => newSubcategories.includes(slug));
      
      if (remainingSubcategories.length === 0) {
        newCategories = newCategories.filter(c => c !== categorySlug);
      }
    }

    // Create a new filter object with the updated values
    const updatedFilters = { 
      categories: newCategories,
      subcategories: newSubcategories
    };
    
    onFilterChange(updatedFilters);
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categorySlug: string) => {
    setExpandedCategories(prev => 
      prev.includes(categorySlug)
        ? prev.filter(slug => slug !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearFilters}
          className={`text-sm font-medium transition-colors ${
            getActiveFiltersCount() > 0 
              ? 'text-indigo-600 hover:text-indigo-700' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={getActiveFiltersCount() === 0}
          aria-label="Clear all filters"
        >
          Clear All
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Categories */}
      <FilterSection 
        title="Categories" 
        icon={<Tag className="w-4 h-4 text-indigo-600" />}
        badge={filters.categories.length}
      >
        <div className="space-y-2 pl-2">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.slug)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {category.name}
                </span>
                {category.item_count !== undefined && (
                  <span className="text-xs text-gray-500">
                    ({category.item_count})
                  </span>
                )}
              </label>
              
              {/* Only show subcategories when parent category is selected */}
              {filters.categories.includes(category.slug) && category.subcategories && category.subcategories.length > 0 && (
                <div className="pl-6 space-y-1 mt-2">
                  {category.subcategories.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.subcategories.includes(sub.slug)}
                        onChange={(e) => handleSubcategoryChange(category.slug, sub.slug, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">
                        {sub.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection 
        title="Price Range" 
        icon={<CircleDollarSign className="w-4 h-4 text-emerald-600" />}
        badge={(filters.minPrice || filters.maxPrice) ? 1 : 0}
      >
        <div className="px-2">
          <PriceRangeSlider
            min={0}
            max={50000}
            step={100}
            value={[filters.minPrice || 0, filters.maxPrice || 50000]}
            onChange={([min, max]) => onFilterChange({ minPrice: min, maxPrice: max })}
          />
        </div>
      </FilterSection>

      {/* Sort */}
      <FilterSection 
        title="Sort By" 
        icon={<ArrowUpDown className="w-4 h-4 text-purple-600" />}
      >
        <div className="space-y-2 pl-2">
          {[
            { value: 'created_at_desc', label: 'Latest First' },
            { value: 'price_asc', label: 'Price: Low to High' },
            { value: 'price_desc', label: 'Price: High to Low' },
            { value: 'relevance', label: 'Most Relevant' }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="sortBy"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
                className="rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection 
        title="Condition" 
        icon={<Sparkles className="w-4 h-4 text-amber-500" />}
        badge={filters.conditions.length}
      >
        <div className="space-y-2 pl-2">
          {[
            { value: 'New', label: 'New', color: 'text-emerald-600' },
            { value: 'Like New', label: 'Like New', color: 'text-blue-600' },
            { value: 'Used', label: 'Used', color: 'text-gray-600' }
          ].map((condition) => (
            <label key={condition.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.conditions.includes(condition.value)}
                onChange={(e) => {
                  const newConditions = e.target.checked
                    ? [...filters.conditions, condition.value]
                    : filters.conditions.filter(c => c !== condition.value);
                  onFilterChange({ conditions: newConditions });
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className={`text-sm ${condition.color} group-hover:text-gray-900`}>
                {condition.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </motion.div>
  );
} 