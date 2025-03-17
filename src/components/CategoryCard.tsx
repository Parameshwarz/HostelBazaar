import { motion } from 'framer-motion';
import { Book, Laptop, Sofa, Bookmark, Utensils, Trophy, Building2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: string;
  itemCount: number;
  className?: string;
}

const iconMap = {
  'Book': Book,
  'Laptop': Laptop,
  'Sofa': Sofa,
  'Bookmark': Bookmark,
  'Utensils': Utensils,
  'Trophy': Trophy,
  'Building2': Building2,
  'MoreHorizontal': MoreHorizontal,
};

const colorMap = {
  'textbooks': 'bg-blue-50 text-blue-600',
  'electronics': 'bg-purple-50 text-purple-600',
  'dorm-essentials': 'bg-orange-50 text-orange-600',
  'study-materials': 'bg-emerald-50 text-emerald-600',
  'room-decor': 'bg-red-50 text-red-600',
  'sports-fitness': 'bg-indigo-50 text-indigo-600',
  'lab-equipment': 'bg-teal-50 text-teal-600',
  'other': 'bg-gray-50 text-gray-600',
};

export const CategoryCard = ({ name, slug, icon, itemCount, className = '' }: CategoryCardProps) => {
  const Icon = iconMap[icon as keyof typeof iconMap] || MoreHorizontal;
  const colorClass = colorMap[slug as keyof typeof colorMap] || 'bg-gray-50 text-gray-600';

  return (
    <Link href={`/browse?category=${slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`relative group rounded-2xl p-6 transition-all duration-300 
          ${colorClass} hover:shadow-lg ${className}`}
      >
        {/* Icon */}
        <div className="mb-4">
          <Icon className="w-8 h-8" />
        </div>

        {/* Category Name */}
        <h3 className="font-semibold text-lg mb-1">
          {name}
        </h3>

        {/* Item Count */}
        <p className="text-sm opacity-75">
          {itemCount === 0 ? 'No items yet' : 
            `${itemCount} item${itemCount === 1 ? '' : 's'}`}
        </p>

        {/* Hover Effect Overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: 0 }}
          whileHover={{ opacity: 0.1 }}
          className="absolute inset-0 bg-black rounded-2xl"
        />

        {/* Arrow indicator on hover */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.div>
      </motion.div>
    </Link>
  );
}; 