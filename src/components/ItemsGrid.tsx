import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from 'lucide-react';
import type { ViewMode } from './trade/ViewModeToggle';
import { FeaturedItems } from './browse/FeaturedItems';
import { CategorySection } from './browse/CategorySection';
import { ResultsSummary } from './browse/ResultsSummary';
import ItemCardSkeleton from './ItemCardSkeleton';
import { Search } from 'lucide-react';

interface ItemsGridProps {
  items: any[];
  viewMode: ViewMode;
  isSearching: boolean;
  isLoadingMore: boolean;
  hasExactMatches: boolean;
  fetchError: any;
  page: number;
  filters: any;
  lastItemRef: (node: any) => void;
  onQuickView: (item: any) => void;
  onContact: (item: any) => void;
  onClearFilters: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const ItemsGrid = ({
  items,
  viewMode,
  isSearching,
  isLoadingMore,
  hasExactMatches,
  fetchError,
  page,
  filters,
  lastItemRef,
  onQuickView,
  onContact,
  onClearFilters
}: ItemsGridProps) => {
  if (fetchError) {
    return (
      <div className="text-center text-red-500 mt-8">
        <p className="text-xl font-semibold mb-2">Error</p>
        <p>{fetchError.message || 'Something went wrong while fetching items. Please try again.'}</p>
      </div>
    );
  }

  if (!isSearching && !isLoadingMore && items.length === 0) {
    if (filters.search) {
      return (
        <div className="text-center mt-8 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-xl font-semibold mb-2">No results found for "{filters.search}"</p>
            <p className="text-gray-600 mb-4">
              We couldn't find any items matching your search. Try:
            </p>
            <ul className="text-gray-600 text-sm space-y-2 mb-6">
              <li>• Checking for typos or misspellings</li>
              <li>• Using more general keywords</li>
              <li>• Removing filters to broaden your search</li>
            </ul>
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
                transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      );
    } else if (Object.keys(filters).some(key => filters[key] && filters[key].length > 0)) {
      return (
        <div className="text-center mt-8">
          <p className="text-xl font-semibold mb-2">No items match your filters</p>
          <p className="text-gray-600 mb-4">Try adjusting your filters to see more items.</p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
              transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      );
    } else {
      return (
        <div className="text-center mt-8">
          <p className="text-xl font-semibold mb-2">No items available</p>
          <p className="text-gray-600">Check back later for new items!</p>
        </div>
      );
    }
  }

  // Group items by condition for stats
  const newItems = items.filter(item => item.condition === 'New');
  const likeNewItems = items.filter(item => item.condition === 'Like New');
  const usedItems = items.filter(item => item.condition === 'Used');

  // Get featured items (only if not searching)
  const featuredItems = !filters.search ? items.filter(item => 
    item.images?.length > 0 && 
    item.rating >= 4
  ).slice(0, 4) : [];

  // Group items by category and subcategory
  const groupedItems = items.reduce((acc: any, item) => {
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

  // If no categories are found, create an "Other" category
  if (Object.keys(groupedItems).length === 0 && items.length > 0) {
    groupedItems['other'] = {
      name: 'Other',
      subcategories: {
        'uncategorized': {
          name: 'Uncategorized',
          items: items
        }
      }
    };
  }

  return (
    <div className="space-y-12">
      {/* Results Summary */}
      <ResultsSummary
        totalItems={items.length}
        newItemsCount={newItems.length}
        likeNewItemsCount={likeNewItems.length}
        usedItemsCount={usedItems.length}
        hasExactMatches={hasExactMatches}
        isSearching={isSearching}
        searchQuery={filters.search}
      />

      {/* Featured Items - Only show when not searching */}
      {!filters.search && featuredItems.length > 0 && (
        <FeaturedItems
          items={featuredItems}
          onQuickView={onQuickView}
          onContact={onContact}
        />
      )}

      {/* Main Items Grid - Grouped by Category/Subcategory */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        <AnimatePresence mode="wait">
          {isSearching && page === 1 ? (
            // Skeleton Loading State
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i} variants={item}>
                  <ItemCardSkeleton viewMode={viewMode} />
                </motion.div>
              ))}
            </div>
          ) : (
            // Actual Items Grouped
            Object.entries(groupedItems).map(([categorySlug, categoryData]: [string, any]) => (
              <CategorySection
                key={categorySlug}
                categorySlug={categorySlug}
                categoryName={categoryData.name}
                subcategories={categoryData.subcategories}
                viewMode={viewMode}
                lastItemRef={lastItemRef}
                onQuickView={onQuickView}
                onContact={onContact}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div 
          className="flex justify-center mt-8"
          role="status"
          aria-label="Loading more items"
        >
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Empty State */}
      {!isSearching && items.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
        >
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any items matching your criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl
                hover:from-indigo-600 hover:to-indigo-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {fetchError && (
        <div className="bg-red-50 rounded-xl p-4 text-red-600 border border-red-100">
          <p className="text-sm font-medium">{fetchError.message}</p>
        </div>
      )}
    </div>
  );
}; 