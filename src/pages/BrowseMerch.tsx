import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, ShoppingBag, Star, RefreshCw, Filter, ArrowUpCircle, SlidersHorizontal, X, Tag, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MerchFilters from '../components/merch/filters/MerchFilters';
import QuickViewModal from '../components/merch/QuickViewModal';
import ImageMagnifier from '../components/merch/ImageMagnifier';
import StockCounter from '../components/merch/StockCounter';
import SmartRecommendations from '../components/merch/shopping/SmartRecommendations';
import EnhancedMerchSearch from '../components/merch/search/EnhancedMerchSearch';
import { useMerchSearch } from '../hooks/useMerchSearch';
import { Product } from '../types/merch';
import { useCart } from '../hooks/useCart';
import MerchCard from '../components/merch/MerchCard';
import { MerchFiltersRef } from '../components/merch/filters/MerchFilters';

// Add these constants at the top of the file, after imports
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
] as const;

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
] as const;

// Also add types for better type safety
type Department = typeof DEPARTMENTS[number];
type Category = typeof CATEGORIES[number];

// Add this component for quick filters
const QuickFilterChip = ({ label, onClick, isActive = false }: { 
  label: string; 
  onClick: () => void; 
  isActive?: boolean 
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
      ${isActive 
        ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' 
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } shadow-sm border border-gray-100 hover:border-gray-200`}
  >
    {label}
  </button>
);

// Quick sort options component
const QuickSortDropdown = ({ currentSort, onSort }: { 
  currentSort: string; 
  onSort: (value: string) => void;
}) => (
  <select
    value={currentSort}
    onChange={(e) => onSort(e.target.value)}
    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 
      text-gray-600 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 
      focus:ring-violet-500 focus:border-transparent"
  >
    <option value="newest">Newest First</option>
    <option value="price_low">Price: Low to High</option>
    <option value="price_high">Price: High to Low</option>
    <option value="popularity">Most Popular</option>
    <option value="rating">Highest Rated</option>
  </select>
);

export default function BrowseMerch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { 
    searchProducts, 
    recordProductView,
    isSearching 
  } = useMerchSearch();

  const { addToCart } = useCart();

  // Get initial search parameters
  const initialQuery = searchParams.get('search') || '';
  const initialCategory = searchParams.getAll('category');
  const initialPriceRange = {
    min: Number(searchParams.get('minPrice')) || 0,
    max: Number(searchParams.get('maxPrice')) || 5000
  };
  const initialSortBy = searchParams.get('sortBy') as any || 'newest';

  // Add new state for scroll position
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [isQuickFilterOpen, setIsQuickFilterOpen] = useState(false);

  // Add these new states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 12;

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    // Count category filters
    count += searchParams.getAll('category').length;
    
    // Count department filters
    count += searchParams.getAll('department').length;
    
    // Count tag filters
    count += searchParams.getAll('tag').length;
    
    // Count price filter
    if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
      count += 1;
    }
    
    // Count sort (if not default)
    if (searchParams.get('sortBy') && searchParams.get('sortBy') !== 'newest') {
      count += 1;
    }
    
    // Count availability
    if (searchParams.get('availability')) {
      count += 1;
    }
    
    // Count sale status
    if (searchParams.get('onSale') === 'true') {
      count += 1;
    }
    
    // Count new arrivals
    if (searchParams.get('newArrivals') === 'true') {
      count += 1;
    }
    
    return count;
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const filterBarPosition = document.getElementById('quickAccessBar')?.offsetTop || 0;
      setShowFloatingBar(scrollPosition > filterBarPosition + 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modify fetchProducts to handle pagination
  const fetchProducts = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      if (pageNum > 1) setIsLoadingMore(true);
      
      const results = await searchProducts(initialQuery, {
        category: initialCategory,
        priceRange: initialPriceRange,
        sortBy: initialSortBy,
        includeOutOfStock: false,
        page: pageNum,
        limit: ITEMS_PER_PAGE
      });

      // Sort results based on sortBy parameter if needed
      let sortedResults = [...results.data];
      switch (initialSortBy) {
        case 'price_low':
          sortedResults.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          sortedResults.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          sortedResults.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          break;
        case 'popularity':
          sortedResults.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
          break;
        case 'rating':
          sortedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
      }

      // Update products based on page
      setProducts(prev => pageNum === 1 ? sortedResults : [...prev, ...sortedResults]);
      setHasMore(results.hasMore);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearch = async (query: string) => {
    console.log('BrowseMerch - Handling search:', query);
    const newSearchParams = new URLSearchParams(searchParams);
    if (query) {
      newSearchParams.set('search', query);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);
  };

  const handleImageSearch = async (file: File) => {
    console.log('BrowseMerch - Image search requested with file:', file);
    toast.error('Image search coming soon!');
  };

  const handleFilterChange = (filters: any) => {
    // Create new URLSearchParams (don't preserve old params)
    const newSearchParams = new URLSearchParams();
    
    // Preserve search query if exists
    const currentSearch = searchParams.get('search');
    if (currentSearch) {
      newSearchParams.set('search', currentSearch);
    }

    // Only add active filters
    if (filters.categories?.length > 0) {
      filters.categories.forEach((cat: string) => {
        newSearchParams.append('category', cat);
      });
    }

    if (filters.department?.length > 0) {
      filters.department.forEach((dept: string) => {
        newSearchParams.append('department', dept);
      });
    }

    if (filters.tags?.length > 0) {
      filters.tags.forEach((tag: string) => {
        newSearchParams.append('tag', tag);
      });
    }

    // Only add price range if different from default
    if (filters.price?.min !== 0 || filters.price?.max !== 5000) {
      if (filters.price?.min !== 0) {
        newSearchParams.set('minPrice', filters.price.min.toString());
      }
      if (filters.price?.max !== 5000) {
        newSearchParams.set('maxPrice', filters.price.max.toString());
      }
    }

    // Only add these if they're explicitly true
    if (filters.onSale) {
      newSearchParams.set('onSale', 'true');
    }
    if (filters.newArrivals) {
      newSearchParams.set('newArrivals', 'true');
    }

    // Add sort handling
    if (filters.sortBy && filters.sortBy !== 'newest') {
      newSearchParams.set('sortBy', filters.sortBy);
    }

    // Replace all params instead of merging
    setSearchParams(newSearchParams);
  };

  const handleClearFilters = () => {
    // Only preserve search query
    const newSearchParams = new URLSearchParams();
    const currentSearch = searchParams.get('search');
    if (currentSearch) {
      newSearchParams.set('search', currentSearch);
    }
    setSearchParams(newSearchParams);
  };

  // Add these improvements while keeping existing code

  // 1. Add proper type checking for product images
  const getProductImage = (product: Product) => {
    return product.product_images && product.product_images.length > 0
      ? product.product_images[0].image_url
      : 'https://via.placeholder.com/400x300?text=No+Image';
  };

  // 2. Add proper type checking for rating and rating_count
  const getRatingDisplay = (product: Product) => {
    const rating = product.rating || 0;
    const ratingCount = product.rating_count || 0;
    
    return rating > 0 ? (
      <div className="flex items-center gap-1 text-amber-500">
        <Star className="w-4 h-4 fill-current" />
        <span className="text-sm">{rating}</span>
        {ratingCount > 0 && (
          <span className="text-xs text-gray-500">({ratingCount})</span>
        )}
      </div>
    ) : null;
  };

  // 3. Add loading skeleton component
  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );

  // Add this function for product click handling
  const handleProductClick = async (product: Product) => {
    try {
      await recordProductView(product.id);
      setQuickViewProduct(product);
    } catch (error) {
      console.error('Error recording product view:', error);
    }
  };

  // Add this function for cart handling
  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Add this to check if a quick filter is active
  const isQuickFilterActive = (type: string, value: string) => {
    switch(type) {
      case 'category':
        return searchParams.getAll('category').includes(value);
      case 'price':
        const min = Number(searchParams.get('minPrice'));
        const max = Number(searchParams.get('maxPrice'));
        return min === Number(value.split('-')[0]) && max === Number(value.split('-')[1]);
      case 'tag':
        return searchParams.getAll('tag').includes(value);
      default:
        return false;
    }
  };

  // Update handleQuickFilter to handle sort
  const handleQuickFilter = (type: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (type === 'sort') {
      // Handle sort differently - always replace the current sort
      if (value === 'newest') {
        newSearchParams.delete('sortBy');
      } else {
        newSearchParams.set('sortBy', value);
      }
    } else if (isQuickFilterActive(type, value)) {
      // Remove filter if active
      switch(type) {
        case 'category':
          const categories = newSearchParams.getAll('category')
            .filter(cat => cat !== value);
          newSearchParams.delete('category');
          categories.forEach(cat => newSearchParams.append('category', cat));
          break;
        case 'price':
          newSearchParams.delete('minPrice');
          newSearchParams.delete('maxPrice');
          break;
        case 'tag':
          const tags = newSearchParams.getAll('tag')
            .filter(tag => tag !== value);
          newSearchParams.delete('tag');
          tags.forEach(tag => newSearchParams.append('tag', tag));
          break;
      }
    } else {
      // Add new filter
      switch(type) {
        case 'category':
          newSearchParams.append('category', value);
          break;
        case 'price':
          const [min, max] = value.split('-');
          newSearchParams.set('minPrice', min);
          newSearchParams.set('maxPrice', max);
          break;
        case 'tag':
          newSearchParams.append('tag', value);
          break;
      }
    }
    
    setSearchParams(newSearchParams);
  };

  // Find the MerchFilters component in the JSX and add a ref to access its state
  const filterRef = useRef<MerchFiltersRef>(null);

  // Add intersection observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loading]);

  // Fetch when page changes
  useEffect(() => {
    fetchProducts(page);
  }, [page, searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-violet-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-6">Browse College Merch</h1>
            <EnhancedMerchSearch
              onSearch={handleSearch}
              onImageSearch={handleImageSearch}
              initialQuery={initialQuery}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Quick Access Bar */}
      <div id="quickAccessBar" className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top Row - Categories and Sort */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-sm font-medium text-gray-500">Categories:</span>
              <QuickFilterChip
                label="All Products"
                onClick={() => handleClearFilters()}
                isActive={initialCategory.length === 0}
              />
              <QuickFilterChip
                label="T-Shirts"
                onClick={() => handleQuickFilter('category', 't-shirts')}
                isActive={isQuickFilterActive('category', 't-shirts')}
              />
              <QuickFilterChip
                label="Hoodies"
                onClick={() => handleQuickFilter('category', 'hoodies')}
                isActive={isQuickFilterActive('category', 'hoodies')}
              />
              <QuickFilterChip
                label="Accessories"
                onClick={() => handleQuickFilter('category', 'accessories')}
                isActive={isQuickFilterActive('category', 'accessories')}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Sort by:</span>
              <QuickSortDropdown
                currentSort={initialSortBy}
                onSort={(value) => handleQuickFilter('sort', value)}
              />
            </div>
          </div>

          {/* Bottom Row - Smart Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm font-medium text-gray-500">Quick Filters:</span>
            <QuickFilterChip
              label="Under ₹500"
              onClick={() => handleQuickFilter('price', '0-500')}
              isActive={isQuickFilterActive('price', '0-500')}
            />
            <QuickFilterChip
              label="₹500 - ₹1000"
              onClick={() => handleQuickFilter('price', '500-1000')}
              isActive={isQuickFilterActive('price', '500-1000')}
            />
            <QuickFilterChip
              label="In Stock"
              onClick={() => handleQuickFilter('availability', 'in_stock')}
              isActive={searchParams.get('availability') === 'in_stock'}
            />
            <QuickFilterChip
              label="New Arrivals"
              onClick={() => handleQuickFilter('tag', 'New Arrival')}
              isActive={isQuickFilterActive('tag', 'New Arrival')}
            />
            <QuickFilterChip
              label="Best Sellers"
              onClick={() => handleQuickFilter('tag', 'Bestseller')}
              isActive={isQuickFilterActive('tag', 'Bestseller')}
            />
            <QuickFilterChip
              label="On Sale"
              onClick={() => handleQuickFilter('onSale', 'true')}
              isActive={searchParams.get('onSale') === 'true'}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 mx-auto bg-white rounded-full shadow-lg z-50 
              px-6 py-3 border border-gray-200 flex items-center gap-4 max-w-fit"
          >
            {/* Quick Sort */}
            <div className="hidden md:block">
              <QuickSortDropdown
                currentSort={initialSortBy}
                onSort={(value) => handleQuickFilter('sort', value)}
              />
            </div>

            {/* Most Used Filters */}
            <div className="flex items-center gap-2">
              <QuickFilterChip
                label="Under ₹500"
                onClick={() => handleQuickFilter('price', '0-500')}
                isActive={isQuickFilterActive('price', '0-500')}
              />
              <QuickFilterChip
                label="New Arrivals"
                onClick={() => handleQuickFilter('tag', 'New Arrival')}
                isActive={isQuickFilterActive('tag', 'New Arrival')}
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => filterRef.current?.setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-full
                hover:bg-violet-700 transition-colors whitespace-nowrap"
            >
              <Filter className="w-4 h-4" />
              <span>All Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Scroll to Top */}
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUpCircle className="w-5 h-5 text-gray-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and View Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <MerchFilters
              ref={filterRef}
              onFilterChange={handleFilterChange}
              availableFilters={{
                colors: ['red', 'blue', 'green', 'yellow', 'purple', 'black', 'white', 'gray', 'brown', 'pink', 'orange'],
                sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
                categories: ['t-shirts', 'hoodies', 'caps', 'accessories'],
                departments: ['men', 'women', 'kids'],
                tags: ['new', 'sale', 'limited', 'exclusive'],
                priceRange: { min: 0, max: 100000 },
              }}
            />
            
            {/* Clear Filters Button */}
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-violet-600 hover:text-violet-700 
                hover:bg-violet-50 rounded-lg transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${
                viewMode === 'grid' ? 'text-violet-600 bg-violet-50' : 'text-gray-400'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 rounded-lg transition-colors hover:bg-gray-100 ${
                viewMode === 'list' ? 'text-violet-600 bg-violet-50' : 'text-gray-400'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Show Active Filters */}
        {(initialCategory.length > 0 || initialQuery || 
          initialPriceRange.min !== 0 || initialPriceRange.max !== 5000 || 
          initialSortBy !== 'newest' || searchParams.has('onSale') || 
          searchParams.has('newArrivals') || searchParams.getAll('department').length > 0 ||
          searchParams.getAll('tag').length > 0) && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              <button
                onClick={handleClearFilters}
                className="text-sm text-violet-600 hover:text-violet-700 hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {initialQuery && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm flex items-center gap-2 group"
                >
                  <span>Search: {initialQuery}</span>
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('search');
                      setSearchParams(newParams);
                    }}
                    className="hover:bg-violet-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              )}
              
              {initialCategory.map((category) => (
                <motion.span
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2 group"
                >
                  <span>Category: {category}</span>
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      const categories = newParams.getAll('category').filter(c => c !== category);
                      newParams.delete('category');
                      categories.forEach(c => newParams.append('category', c));
                      setSearchParams(newParams);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              ))}

              {searchParams.getAll('department').map((dept) => (
                <motion.span
                  key={dept}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2 group"
                >
                  <span>Department: {dept}</span>
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      const departments = newParams.getAll('department').filter(d => d !== dept);
                      newParams.delete('department');
                      departments.forEach(d => newParams.append('department', d));
                      setSearchParams(newParams);
                    }}
                    className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              ))}

              {searchParams.getAll('tag').map((tag) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center gap-2 group"
                >
                  <span>Tag: {tag}</span>
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      const tags = newParams.getAll('tag').filter(t => t !== tag);
                      newParams.delete('tag');
                      tags.forEach(t => newParams.append('tag', t));
                      setSearchParams(newParams);
                    }}
                    className="hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              ))}

              {(initialPriceRange.min !== 0 || initialPriceRange.max !== 5000) && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2 group"
                >
                  <span>Price: ₹{initialPriceRange.min} - ₹{initialPriceRange.max}</span>
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('minPrice');
                      newParams.delete('maxPrice');
                      setSearchParams(newParams);
                    }}
                    className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              )}

              {searchParams.has('onSale') && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2 group"
                >
                  <span>On Sale</span>
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('onSale');
                      setSearchParams(newParams);
                    }}
                    className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              )}

              {searchParams.has('newArrivals') && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm flex items-center gap-2 group"
                >
                  <span>New Arrivals</span>
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('newArrivals');
                      setSearchParams(newParams);
                    }}
                    className="hover:bg-teal-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              )}

              {initialSortBy !== 'newest' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2 group"
                >
                  <span>Sort: {initialSortBy}</span>
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('sortBy');
                      setSearchParams(newParams);
                    }}
                    className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              )}
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        <div className={`${loading ? 'opacity-60' : ''} transition-opacity duration-200`}>
          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <ShoppingBag className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg
                  hover:bg-violet-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 
                'space-y-6'
              }>
                <AnimatePresence>
                  {products.map((product) => (
                    <MerchCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onClick={() => handleProductClick(product)}
                      onAddToCart={() => handleAddToCart(product.id)}
                      onAddToWishlist={() => {
                        toast.success('Added to wishlist');
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Loading More Indicator */}
              <div 
                ref={observerTarget} 
                className="h-20 flex items-center justify-center mt-6"
              >
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-violet-600 rounded-full animate-spin" />
                    <span>Loading more...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={handleAddToCart}
            onAddToWishlist={(productId) => {
              toast.success('Added to wishlist');
              setQuickViewProduct(null);
            }}
            onViewDetails={(productId) => {
              navigate(`/merch/${productId}`);
              setQuickViewProduct(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 