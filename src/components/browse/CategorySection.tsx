import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import ItemCard from '../ItemCard';
import type { ViewMode } from '../trade/ViewModeToggle';

interface CategorySectionProps {
  categorySlug: string;
  categoryName: string;
  subcategories: {
    [key: string]: {
      name: string;
      items: any[];
    };
  };
  viewMode: ViewMode;
  lastItemRef: (node: any) => void;
  onQuickView: (item: any) => void;
  onContact: (item: any) => void;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Only limit subcategories, not items
const INITIAL_SUBCATEGORIES = 2; // Show 2 subcategories initially

export const CategorySection = ({
  categorySlug,
  categoryName,
  subcategories,
  viewMode,
  lastItemRef,
  onQuickView,
  onContact
}: CategorySectionProps) => {
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);

  const subcategoryEntries = Object.entries(subcategories);
  const visibleSubcategories = showAllSubcategories 
    ? subcategoryEntries 
    : subcategoryEntries.slice(0, INITIAL_SUBCATEGORIES);

  return (
    <section className="space-y-8">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {categoryName}
        </h2>
      </div>

      {/* Subcategories */}
      <div className="space-y-8">
        {visibleSubcategories.map(([subSlug, subData]) => (
          <div key={subSlug} className="space-y-4">
            {/* Subcategory Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">
                {subData.name}
              </h3>
            </div>

            {/* Items Grid - Show all items */}
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {subData.items.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  variants={item}
                  ref={index === subData.items.length - 1 ? lastItemRef : null}
                  className={`group ${
                    item.condition === 'New' 
                      ? 'ring-1 ring-emerald-100' 
                      : item.condition === 'Like New'
                      ? 'ring-1 ring-blue-100'
                      : ''
                  }`}
                >
                  <ItemCard
                    item={item}
                    viewMode={viewMode}
                    onQuickView={onQuickView}
                    isWishlisted={false}
                    onWishlistToggle={() => {}}
                    onShare={() => {}}
                    onContact={() => onContact(item)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Show More Subcategories Button */}
        {subcategoryEntries.length > INITIAL_SUBCATEGORIES && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAllSubcategories(!showAllSubcategories)}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 
              text-sm font-medium text-indigo-600 flex items-center justify-center gap-2
              border border-indigo-100 rounded-xl shadow-sm hover:shadow-md
              transition-all duration-200 hover:from-indigo-100 hover:to-purple-100"
          >
            {showAllSubcategories ? (
              <>
                Show Less
                <ChevronDown 
                  className="w-4 h-4 transition-transform duration-200 rotate-180"
                />
              </>
            ) : (
              <>
                Show {subcategoryEntries.length - INITIAL_SUBCATEGORIES} More Subcategories
                <ChevronDown 
                  className="w-4 h-4 transition-transform duration-200 animate-bounce-gentle"
                />
              </>
            )}
          </motion.button>
        )}
      </div>
    </section>
  );
}; 