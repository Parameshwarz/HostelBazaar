import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, Star } from 'lucide-react';
import { Product } from '../../types/merch';

interface TrendingProductsProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

export default function TrendingProducts({ products, onProductClick }: TrendingProductsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trendingProducts = products.slice(0, 10);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (trendingProducts.length === 0) return null;

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
          </div>
          <div className="flex gap-2">
            <button
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="overflow-x-auto scrollbar-hide -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
            {trendingProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="w-72 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => onProductClick(product.id)}
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-50">
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center p-8"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {product.product_images?.[0]?.image_url ? (
                      <img
                        src={product.product_images[0].image_url}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-3xl text-gray-400">?</span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-violet-600">
                      ₹{product.price}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium
                        hover:bg-violet-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductClick(product.id);
                      }}
                    >
                      View
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 