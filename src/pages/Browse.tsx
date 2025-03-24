import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sliders, 
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Clock,
  Filter,
  ChevronDown,
  Tag,
  CircleDollarSign,
  SlidersHorizontal,
  ArrowDownUp,
  TrendingDown,
  TrendingUp,
  Loader,
  X,
  Menu
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import ItemCard from '../components/ItemCard';
import { toast } from 'react-hot-toast';
import { searchAllContent } from '../lib/supabase/queries';
import ItemCardSkeleton from '../components/ItemCardSkeleton';
import { useFilterPersistence } from '../hooks/useFilterPersistence';
import EnhancedSearch from '../components/trade/EnhancedSearch';
import { useAuth } from '../hooks/useAuth';
import { Filters, SearchParams, SortOption, VALID_SORT_VALUES, getSortBy } from '../types/filters';
import PriceRangeSlider from '../components/trade/PriceRangeSlider';
import ViewModeToggle, { ViewMode } from '../components/trade/ViewModeToggle';
import QuickViewModal from '../components/trade/QuickViewModal';
import FilterSidebar from '../components/FilterSidebar';
import { ItemsGrid } from '../components/ItemsGrid';
import { supabase } from '../lib/supabaseClient';

// Constants for pagination
const ITEMS_PER_PAGE = 12;
const INFINITE_SCROLL_THRESHOLD = 300;

// Add debounce utility
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface FilterPreset {
  name: string;
  filters: Partial<Filters>;
}

// Add error types
type ErrorType = 'network' | 'server' | 'timeout' | 'unknown';

interface FetchError {
  type: ErrorType;
  message: string;
  retryCount: number;
}

// Add type for sort options
type SortOptionType = {
  value: SortOption;
  label: string;
  icon: any;
};

const sortOptions: SortOptionType[] = [
  { value: 'relevance', label: 'Most Relevant', icon: ArrowUpDown },
  { value: 'created_at_desc', label: 'Latest First', icon: Clock },
  { value: 'price_asc', label: 'Price: Low to High', icon: TrendingUp },
  { value: 'price_desc', label: 'Price: High to Low', icon: TrendingDown }
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { categories } = useCategories();
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  
  const initialFilters: Filters = {
    categories: searchParams.getAll('category'),
    subcategories: searchParams.getAll('subcategory'),
    conditions: searchParams.getAll('condition'),
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    search: searchParams.get('search') || '',
    sortBy: getSortBy(searchParams.get('sortBy')),
    showWishlisted: false
  };

  const { filters, setFilters } = useFilterPersistence(initialFilters);
  
  // State
  const [isSearching, setIsSearching] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [hasExactMatches, setHasExactMatches] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastElementRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [fetchError, setFetchError] = useState<FetchError | null>(null);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Modified infinite scroll implementation
  const lastItemRef = useCallback((node: HTMLDivElement) => {
    if (isSearching || !hasMore) return;
    
    // Cleanup previous observer
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { 
      rootMargin: '100px', // Load earlier for smoother experience
      threshold: 0.1 
    });

    if (node) observer.current.observe(node);
  }, [isSearching, hasMore, isLoadingMore]);

  // Add cleanup
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Add scroll position restoration
  useEffect(() => {
    const scrollPosition = sessionStorage.getItem('browseScrollPosition');
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition));
      sessionStorage.removeItem('browseScrollPosition');
    }
  }, []);

  // Save scroll position before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('browseScrollPosition', window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        // Find the EnhancedSearch component and call its setShowSuggestions
        const searchInput = searchRef.current.querySelector('input');
        if (searchInput) {
          searchInput.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced fetch items function
  const fetchItems = async (retryCount = 0) => {
    setIsSearching(true);
    console.log("Fetching items with filters:", {
      categories: filters.categories,
      subcategories: filters.subcategories,
      conditions: filters.conditions,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      search: filters.search
    });
    
    try {
      const searchParams: SearchParams = {
        categories: filters.categories,
        conditions: filters.conditions,
        subcategories: filters.subcategories, // Make sure subcategories are properly passed
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        page,
        limit: ITEMS_PER_PAGE
      };

      const results = await searchAllContent(filters.search, searchParams, user?.id);
      console.log(`Search returned ${results.items.length} items`);

      if (page === 1) {
        setItems(results.items);
      } else {
        setItems(prevItems => [...prevItems, ...results.items]);
      }

      setHasExactMatches(results.hasExactMatches);
      setHasMore(results.items.length === ITEMS_PER_PAGE);
      setFetchError(null);

      if (results.type === 'no_results' && page === 1) {
        toast.error('No items found matching your criteria');
      }
    } catch (err: any) {
      console.error('Error fetching items:', err);
      
      // Determine error type
      let errorType: ErrorType = 'unknown';
      if (!navigator.onLine) errorType = 'network';
      else if (err.message?.includes('timeout')) errorType = 'timeout';
      else if (err.status >= 500) errorType = 'server';

      const error: FetchError = {
        type: errorType,
        message: getErrorMessage(errorType),
        retryCount
      };
      
      setFetchError(error);

      // Retry logic for specific error types
      if (retryCount < MAX_RETRIES && (errorType === 'network' || errorType === 'timeout')) {
        setTimeout(() => {
          fetchItems(retryCount + 1);
        }, RETRY_DELAY * (retryCount + 1));
        
        toast.error(`Retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
      } else {
        if (page === 1) setItems([]);
        toast.error(error.message);
      }
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  // Error message helper
  const getErrorMessage = (type: ErrorType): string => {
    switch (type) {
      case 'network':
        return 'Network connection lost. Please check your internet connection.';
      case 'server':
        return 'Server error. Our team has been notified.';
      case 'timeout':
        return 'Request timed out. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  };

  // Add error UI component
  const ErrorMessage = ({ error }: { error: FetchError }) => (
    <div className="w-full p-4 bg-red-50 rounded-lg text-red-700 mb-4">
      <p className="font-medium">{error.message}</p>
      {(error.type === 'network' || error.type === 'timeout') && error.retryCount < MAX_RETRIES && (
        <p className="text-sm mt-1">Retrying automatically...</p>
      )}
    </div>
  );

  // Modified fetch items function
  useEffect(() => {
    fetchItems();
  }, [filters, page, user?.id]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [filters.search, filters.categories, filters.subcategories, filters.conditions, filters.minPrice, filters.maxPrice, filters.sortBy]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.categories.length) {
      filters.categories.forEach(cat => params.append('category', cat));
    }
    
    if (filters.subcategories.length) {
      filters.subcategories.forEach(sub => params.append('subcategory', sub));
    }
    
    if (filters.conditions.length) {
      filters.conditions.forEach(cond => params.append('condition', cond));
    }
    
    if (filters.minPrice !== undefined) {
      params.set('minPrice', filters.minPrice.toString());
    }
    
    if (filters.maxPrice !== undefined) {
      params.set('maxPrice', filters.maxPrice.toString());
    }
    
    if (filters.search) {
      params.set('search', filters.search);
    }
    
    if (filters.sortBy) {
      params.set('sortBy', filters.sortBy);
    }
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

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

  // Get total active filters count
  const getActiveFiltersCount = () => {
    return filters.categories.length + 
           filters.subcategories.length + 
           filters.conditions.length + 
           (filters.minPrice ? 1 : 0) + 
           (filters.maxPrice ? 1 : 0) + 
           (filters.search ? 1 : 0);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      categories: [],
      subcategories: [],
      conditions: [],
      minPrice: undefined,
      maxPrice: undefined,
      search: '',
      sortBy: 'relevance',
      showWishlisted: false
    });
    setPage(1);
    setItems([]);
    
    // Clear search input if it exists
    const searchInput = document.querySelector('input[name="search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  };

  // Debounced search handler
  const debouncedSearch = debounce((value: string) => {
    handleFilterChange({ search: value });
  }, 500);

  // Enhanced search handler
  const handleSearch = useCallback((searchQuery: string) => {
    // Update filters with the search query
    handleFilterChange({ search: searchQuery });
  }, []);

  // Add input change handler for debounced search
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Update condition filter
  const handleConditionChange = (condition: string) => {
    handleFilterChange({ conditions: [condition] });
  };

  // Update price range
  const handlePriceChange = (min?: number, max?: number) => {
    handleFilterChange({ 
      minPrice: min,
      maxPrice: max 
    });
  };

  // Sort handler
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortOption;
    if (VALID_SORT_VALUES.includes(value)) {
      handleFilterChange({ sortBy: value });
    }
  };

  // Filter presets with proper typing
  const filterPresets: FilterPreset[] = [
    {
      name: "Study Materials",
      filters: {
        categories: ['books-and-stationery'],
        conditions: ['Like New', 'Used'],
        sortBy: 'price_asc'
      }
    },
    {
      name: "Electronics Deals",
      filters: {
        categories: ['electronics'],
        maxPrice: 15000,
        sortBy: 'price_asc'
      }
    },
    {
      name: "Room Essentials",
      filters: {
        categories: ['room-essentials'],
        conditions: ['New', 'Like New'],
        sortBy: 'created_at_desc'
      }
    }
  ];

  // Apply filter preset
  const applyPreset = (preset: FilterPreset) => {
    handleFilterChange(preset.filters);
  };

  const handleQuickView = (item: any) => {
    setSelectedItem(item);
  };

  const handleCloseQuickView = () => {
    setSelectedItem(null);
  };

  const handleContact = (item: any) => {
    if (!user) {
      toast.error('Please sign in to contact the seller');
      navigate('/login');
      return;
    }
    
    if (item.user_id === user.id) {
      toast.error("You can't chat with yourself!");
      return;
    }

    // Use supabase to check/create a chat and navigate to it
    try {
      (async () => {
        // Check if chat exists
        const { data: existingChat, error: searchError } = await supabase
          .from('chats')
          .select('id')
          .or(
            `and(participant_1.eq.${user.id},participant_2.eq.${item.user_id}),` +
            `and(participant_1.eq.${item.user_id},participant_2.eq.${user.id})`
          )
          .single();

        if (searchError && searchError.code !== 'PGRST116') {
          throw searchError;
        }

        if (existingChat) {
          navigate(`/messages/${existingChat.id}`);
          return;
        }

        // Create new chat
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert([{
            participant_1: user.id,
            participant_2: item.user_id,
            item_id: item.id,
            other_user_id: item.user_id,
            created_at: new Date().toISOString(),
            last_message: `Chat started about: ${item.title}`,
            last_message_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) throw createError;

        if (newChat) {
          navigate(`/messages/${newChat.id}`);
        }
      })();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start chat');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key closes mobile filters
      if (e.key === 'Escape' && isMobileFiltersOpen) {
        setIsMobileFiltersOpen(false);
      }

      // Arrow keys for navigating items
      if (document.activeElement?.tagName === 'BODY') {
        const itemElements = document.querySelectorAll('[data-item-card]');
        const currentIndex = Array.from(itemElements).findIndex(el => el === document.activeElement);

        if (e.key === 'ArrowRight' && currentIndex < itemElements.length - 1) {
          (itemElements[currentIndex + 1] as HTMLElement).focus();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
          (itemElements[currentIndex - 1] as HTMLElement).focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileFiltersOpen]);

  // Add a handleViewAllResults function to show all search results
  const handleViewAllResults = async () => {
    console.log("View all results clicked");
    
    // Update UI state immediately
    setIsSearching(true);
    setHasMore(false);
    
    // Create a copy of the current filters without pagination limits
    const searchAllParams = new URLSearchParams();
    
    // Set existing search term and filters
    if (filters.search) {
      searchAllParams.set('search', filters.search);
    }
    
    if (filters.categories.length) {
      filters.categories.forEach((cat: string) => searchAllParams.append('category', cat));
    }
    
    if (filters.conditions.length) {
      filters.conditions.forEach((cond: string) => searchAllParams.append('condition', cond));
    }
    
    if (filters.minPrice !== undefined) {
      searchAllParams.set('minPrice', filters.minPrice.toString());
    }
    
    if (filters.maxPrice !== undefined) {
      searchAllParams.set('maxPrice', filters.maxPrice.toString());
    }
    
    // Add a special parameter to indicate showing all results
    searchAllParams.set('viewAll', 'true');
    
    // Use the existing sortBy if present
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      searchAllParams.set('sortBy', filters.sortBy);
    }
    
    // Update URL without triggering navigation
    setSearchParams(searchAllParams);
    
    // Fetch all items directly
    await fetchAllItems();
  };

  // Add a function to fetch all items without pagination limit
  const fetchAllItems = async () => {
    setIsSearching(true);
    try {
      const searchParams: SearchParams = {
        categories: filters.categories,
        conditions: filters.conditions,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        // Set a much higher limit to get all matching items
        limit: 100,
        page: 1, // Always start from first page
        viewAll: true // Explicitly set viewAll flag
      };

      // Directly call the search function
      const results = await searchAllContent(filters.search, searchParams, user?.id);
      
      if (results && results.items) {
        // Update state with results
        setItems(results.items);
        setHasExactMatches(results.hasExactMatches || false);
        setHasMore(false); // No more pagination needed
        setFetchError(null);
        
        // Update total count for display
        if (results.total) {
          setFilters(prev => ({
            ...prev,
            totalCount: results.total
          }));
        }
        
        // Log success
        console.log(`Found ${results.items.length} total items for "${filters.search}" out of ${results.total} matches`);
      } else {
        // Handle empty results
        setItems([]);
        toast.error('No items found matching your criteria');
      }
    } catch (err: any) {
      console.error('Error fetching all items:', err);
      setFetchError({
        type: 'unknown',
        message: 'Failed to load all items. Please try again.',
        retryCount: 0
      });
      toast.error('Failed to load all items. Please try again.');
      setItems([]); // Clear items on error
    } finally {
      setIsSearching(false);
      setPage(1); // Reset to page 1
    }
  };

  // Modified useEffect to handle viewAll parameter on page load
  useEffect(() => {
    // Check if viewAll parameter is present in URL
    const viewAllParam = searchParams.get('viewAll');
    
    if (viewAllParam === 'true' && filters.search) {
      // Prevent fetchItems from running by setting isSearching
      setIsSearching(true);
      
      // Use setTimeout to ensure this runs after state updates
      setTimeout(() => {
        fetchAllItems().finally(() => {
          console.log('Finished loading all results');
        });
      }, 0);
    } else {
      fetchItems();
    }
  }, [filters.search, filters.categories, filters.conditions, filters.minPrice, filters.maxPrice, filters.sortBy]);

  // Group items by category and subcategory - but only if not in viewAll mode
  const groupedItems = items.reduce((acc: any, item) => {
    // Check if we're in viewAll mode
    const viewAllParam = searchParams.get('viewAll');
    const isViewAllMode = viewAllParam === 'true';
    
    // If in viewAll mode and searching, don't group by category to show all items
    if (isViewAllMode && filters.search) {
      // Just accumulate all items under a single category
      if (!acc['all-results']) {
        acc['all-results'] = {
          name: 'All Results',
          subcategories: {
            'all-items': {
              name: 'All Items',
              items: []
            }
          }
        };
      }
      
      acc['all-results'].subcategories['all-items'].items.push(item);
      return acc;
    }
    
    // Normal category grouping (existing code)
    if (!item.categories) return acc;
    
    const categorySlug = item.categories.slug;
    const categoryName = item.categories.name;
    const subcategorySlug = item.subcategories?.slug || 'other';
    const subcategoryName = item.subcategories?.name || 'Other';
    
    if (!acc[categorySlug]) {
      acc[categorySlug] = {
        name: categoryName,
        subcategories: {}
      };
    }
    
    if (!acc[categorySlug].subcategories[subcategorySlug]) {
      acc[categorySlug].subcategories[subcategorySlug] = {
        name: subcategoryName,
        items: []
      };
    }
    
    acc[categorySlug].subcategories[subcategorySlug].items.push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <div className="w-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200">
        <div className="w-full max-w-[1800px] mx-auto px-3 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Browse Items</h1>
              <p className="text-lg text-gray-600">Find what you need from our marketplace</p>
            </div>

            {/* Search Section */}
            <div className="relative" ref={searchRef}>
              <EnhancedSearch 
                onSearch={handleSearch}
                showHistory={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1800px] mx-auto px-3 md:px-6 lg:px-8 py-6">
        {/* Active Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          {getActiveFiltersCount() > 0 && (
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-medium text-gray-500">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.categories.map(cat => (
                    <motion.button
                      key={cat}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFilterChange({
                        categories: filters.categories.filter(c => c !== cat)
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 
                        border border-indigo-100 rounded-full text-sm font-medium text-indigo-600 
                        hover:shadow-md transition-all duration-200"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {categories.find(c => c.slug === cat)?.name}
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  ))}
                  {filters.subcategories.map(subcat => {
                    // Find the parent category and subcategory details
                    const parentCategory = categories.find(cat => 
                      cat.subcategories?.some(sub => sub.slug === subcat)
                    );
                    const subcategory = parentCategory?.subcategories?.find(sub => sub.slug === subcat);
                    
                    if (!subcategory) return null;
                    
                    return (
                      <motion.button
                        key={subcat}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFilterChange({
                          subcategories: filters.subcategories.filter(s => s !== subcat)
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 
                          border border-purple-100 rounded-full text-sm font-medium text-purple-600 
                          hover:shadow-md transition-all duration-200"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {subcategory.name}
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    );
                  })}
                  {filters.conditions.map(condition => (
                    <motion.button
                      key={condition}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFilterChange({
                        conditions: filters.conditions.filter(c => c !== condition)
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 
                        border border-green-100 rounded-full text-sm font-medium text-green-600 
                        hover:shadow-md transition-all duration-200"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      {condition}
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  ))}
                  {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                    <motion.button
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFilterChange({ minPrice: undefined, maxPrice: undefined })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-sky-50 
                        border border-blue-100 rounded-full text-sm font-medium text-blue-600 
                        hover:shadow-md transition-all duration-200"
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                  <motion.button
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-rose-50 
                      border border-red-100 rounded-full text-sm font-medium text-red-600 
                      hover:shadow-md transition-all duration-200"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear All
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsMobileFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 
                  hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-lg transition-all 
                  shadow-sm hover:shadow-md lg:hidden"
                aria-label="Open filters"
                aria-expanded={isMobileFiltersOpen}
              >
                <Filter className="w-4 h-4 text-gray-700" />
                <span className="font-medium text-gray-700">Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-semibold">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </motion.button>

              {/* Sort Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 
                    hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-lg transition-all
                    shadow-sm hover:shadow-md"
                >
                  <ArrowUpDown className="w-4 h-4 text-gray-700" />
                  <span className="font-medium text-gray-700">Sort By</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-20 bg-black/5 backdrop-blur-sm"
                        onClick={() => setIsSortOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 
                          overflow-hidden z-30"
                      >
                        {sortOptions.map(option => (
                          <motion.button
                            key={option.value}
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              handleFilterChange({ sortBy: option.value });
                              setIsSortOpen(false);
                            }}
                            className={`flex items-center gap-2.5 w-full px-4 py-3 text-sm transition-all
                              ${filters.sortBy === option.value 
                                ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 font-medium' 
                                : 'hover:bg-gray-50 text-gray-700'}`}
                          >
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </motion.button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center">
              <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pb-6 w-72 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              filterPresets={filterPresets}
              onApplyPreset={applyPreset}
            />
          </div>

          {/* Items Grid */}
          <div className="flex-1 min-w-0">
            <ItemsGrid
              items={items}
              viewMode={viewMode}
              isSearching={isSearching}
              isLoadingMore={isLoadingMore}
              hasExactMatches={hasExactMatches}
              fetchError={fetchError}
              page={page}
              filters={filters}
              lastItemRef={lastItemRef}
              onQuickView={handleQuickView}
              onContact={handleContact}
              onClearFilters={handleClearFilters}
              onViewAllResults={handleViewAllResults}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setIsMobileFiltersOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar
                  filters={filters}
                  categories={categories}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  filterPresets={filterPresets}
                  onApplyPreset={applyPreset}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedItem && (
        <QuickViewModal
          item={selectedItem}
          onClose={handleCloseQuickView}
          onWishlist={() => {
            toast.success('Wishlist feature coming soon!');
          }}
          onShare={() => {
            navigator.clipboard.writeText(window.location.origin + `/items/${selectedItem.id}`);
            toast.success('Link copied to clipboard!');
          }}
          onContact={() => handleContact(selectedItem)}
        />
      )}
    </div>
  );
} 