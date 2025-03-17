import { motion } from 'framer-motion';
import { Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemCard from '../ItemCard';

interface FeaturedItemsProps {
  items: any[];
  onQuickView: (item: any) => void;
  onContact: (item: any) => void;
}

export const FeaturedItems = ({
  items,
  onQuickView,
  onContact
}: FeaturedItemsProps) => {
  if (items.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Featured Items</h3>
          </div>
          <Link 
            to="/browse?sort=rating_desc" 
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            View all featured
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm"
            >
              <ItemCard
                item={item}
                viewMode="grid"
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
    </section>
  );
}; 