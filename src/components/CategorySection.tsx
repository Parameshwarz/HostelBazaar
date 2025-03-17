import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ItemCard from './ItemCard';
import type { ViewMode } from './trade/ViewModeToggle';

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

const ITEMS_PER_ROW = 3; // Number of items to show in one row
const INITIAL_SUBCATEGORIES = 2; // Number of subcategories to show initially

export const CategorySection = ({
  categorySlug,
  categoryName,
  subcategories,
  viewMode,
  lastItemRef,
  onQuickView,
  onContact
}: CategorySectionProps) => {
  const navigate = useNavigate();
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);

  const handleViewAllCategory = () => {
    navigate(`/browse?category=${categorySlug}`);
  };

  const handleViewAllSubcategory = (subSlug: string) => {
    navigate(`/browse?category=${categorySlug}&subcategory=${subSlug}`);
  };

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
        <button 
          onClick={handleViewAllCategory}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          View all in {categoryName}
          <ChevronRight className="w-4 h-4" />
        </button>
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
              <button 
                onClick={() => handleViewAllSubcategory(subSlug)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                View all
              </button>
            </div>

            {/* Items Grid - Limited to one row */}
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {subData.items.slice(0, ITEMS_PER_ROW).map((item: any, index: number) => (
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

        {/* Show More Button - Only if there are more subcategories */}
        {subcategoryEntries.length > INITIAL_SUBCATEGORIES && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowAllSubcategories(!showAllSubcategories)}
            className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg 
              text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
          >
            {showAllSubcategories ? 'Show Less' : 'Show More Subcategories'}
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${showAllSubcategories ? 'rotate-180' : ''}`}
            />
          </motion.button>
        )}
      </div>
    </section>
  );
} 