import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../../types/merch';
import { Sparkles } from 'lucide-react';

interface PersonalizedRecommendationsProps {
  userPreferences: {
    favoriteCategories: string[];
    recentlyViewed: string[];
    purchaseHistory: string[];
  };
  products: Product[];
  onProductClick: (productId: string) => void;
}

export default function PersonalizedRecommendations({
  userPreferences,
  products,
  onProductClick
}: PersonalizedRecommendationsProps) {
  // Filter products based on user preferences
  const recommendedProducts = products.filter(product => {
    return (
      userPreferences.favoriteCategories.includes(product.category_id) ||
      userPreferences.recentlyViewed.includes(product.id) ||
      userPreferences.purchaseHistory.includes(product.id)
    );
  }).slice(0, 4); // Show top 4 recommendations

  if (recommendedProducts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <h2 className="text-xl font-semibold text-gray-900">Picked for You</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendedProducts.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
            onClick={() => onProductClick(product.id)}
          >
            <div className="aspect-square relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1 truncate">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-violet-600 font-semibold">₹{product.price}</span>
                {product.stock < 10 && (
                  <span className="text-xs text-amber-600">
                    Only {product.stock} left
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 