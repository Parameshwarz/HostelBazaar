import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Shirt, Crown, Wind, Star, Leaf, ShoppingBag, Trophy, GraduationCap as GradCap } from 'lucide-react';
import { CampusCollection, getFiltersForCollection } from '../../../utils/collectionMappings';

interface CollectionCard {
  title: CampusCollection;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

const collections: CollectionCard[] = [
  {
    title: 'Campus Essentials',
    description: 'Must-have basics for everyday campus life - tees, caps, and more',
    icon: <Shirt className="w-6 h-6" />,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Premium Collection',
    description: 'High-end apparel featuring premium materials and exclusive designs',
    icon: <Crown className="w-6 h-6" />,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    title: 'Winter Wear',
    description: 'Cozy hoodies, sweatshirts, and jackets for the cold season',
    icon: <Wind className="w-6 h-6" />,
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600'
  },
  {
    title: 'Limited Edition',
    description: 'Special releases and collaboration collections',
    icon: <Star className="w-6 h-6" />,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600'
  },
  {
    title: 'Eco-Friendly',
    description: 'Sustainable and eco-conscious merchandise options',
    icon: <Leaf className="w-6 h-6" />,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    title: 'Accessories',
    description: 'Bags, stickers, pins, and other campus accessories',
    icon: <ShoppingBag className="w-6 h-6" />,
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600'
  },
  {
    title: 'Sports & Athletics',
    description: 'Athletic wear and sports merchandise',
    icon: <Trophy className="w-6 h-6" />,
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600'
  },
  {
    title: 'Graduation Collection',
    description: 'Special merchandise for graduation and alumni',
    icon: <GradCap className="w-6 h-6" />,
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600'
  }
];

export default function CampusCollections() {
  const navigate = useNavigate();

  const handleCollectionClick = (collection: CampusCollection) => {
    const filters = getFiltersForCollection(collection);
    const searchParams = new URLSearchParams();

    // Add categories to search params
    if (filters.categories?.length) {
      filters.categories.forEach(cat => searchParams.append('category', cat));
    }

    // Add departments to search params
    if (filters.department?.length) {
      filters.department.forEach(dept => searchParams.append('department', dept));
    }

    // Add tags to search params
    if (filters.tags?.length) {
      filters.tags.forEach(tag => searchParams.append('tag', tag));
    }

    // Add price range
    if (filters.price?.min !== undefined) {
      searchParams.set('minPrice', filters.price.min.toString());
    }
    if (filters.price?.max !== undefined) {
      searchParams.set('maxPrice', filters.price.max.toString());
    }

    // Add sort
    if (filters.sortBy) {
      searchParams.set('sortBy', filters.sortBy);
    }

    // Add collection name for reference
    searchParams.set('collection', collection);

    // Navigate to browse page with filters
    navigate(`/browse-merch?${searchParams.toString()}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Campus Collections</h3>
              <p className="text-gray-600">Discover department-specific merchandise</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <motion.div
              key={collection.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${collection.bgColor} rounded-xl p-6 cursor-pointer transition-shadow hover:shadow-lg`}
              onClick={() => handleCollectionClick(collection.title)}
            >
              <div className={`${collection.iconColor} mb-4`}>
                {collection.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{collection.title}</h3>
              <p className="text-sm text-gray-600">{collection.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 