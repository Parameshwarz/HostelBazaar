import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../../types/merch';
import { Calendar, Clock } from 'lucide-react';

interface SeasonalCollectionsProps {
  collections: {
    id: string;
    name: string;
    description: string;
    endDate: Date;
    products: Product[];
    theme: {
      bgColor: string;
      textColor: string;
      accentColor: string;
    };
  }[];
  onProductClick: (productId: string) => void;
}

export default function SeasonalCollections({
  collections,
  onProductClick
}: SeasonalCollectionsProps) {
  const calculateTimeLeft = (endDate: Date) => {
    const difference = endDate.getTime() - new Date().getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-8">
      {collections.map((collection) => (
        <motion.div
          key={collection.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: collection.theme.bgColor }}
        >
          {/* Collection Header */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{ color: collection.theme.textColor }}
                >
                  {collection.name}
                </h2>
                <p 
                  className="text-sm opacity-80"
                  style={{ color: collection.theme.textColor }}
                >
                  {collection.description}
                </p>
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: collection.theme.accentColor }}
              >
                <Clock className="w-4 h-4" style={{ color: collection.theme.textColor }} />
                <span 
                  className="text-sm font-medium"
                  style={{ color: collection.theme.textColor }}
                >
                  {calculateTimeLeft(collection.endDate)} days left
                </span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {collection.products.map((product) => (
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
        </motion.div>
      ))}
    </div>
  );
} 