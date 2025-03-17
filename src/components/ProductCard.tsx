import React from 'react';
import { Star, Clock, ShoppingCart } from 'lucide-react';
import { Product } from '../types/merch';
import { motion } from 'framer-motion';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=800&q=80';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const primaryImage = product.product_images?.find(img => img.is_primary);
  const avgRating = product.product_reviews?.length 
    ? product.product_reviews.reduce((acc, review) => acc + review.rating, 0) / product.product_reviews.length 
    : 0;

  return (
    <motion.div
      className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow relative group"
      whileHover={{ y: -4 }}
      onClick={onClick}
    >
      {/* Quick View Button - Shows on Hover */}
      <button className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
        Quick View
      </button>

      {/* Image */}
      <div className="aspect-square mb-4 overflow-hidden rounded-md">
        <img
          src={primaryImage?.image_url || PLACEHOLDER_IMAGE}
          alt={product.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = PLACEHOLDER_IMAGE;
          }}
        />
      </div>

      {/* Content */}
      <div>
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            ({product.product_reviews?.length || 0})
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
          {product.price > 499 && (
            <span className="ml-2 text-sm text-green-600">Free Delivery</span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock_quantity > 0 ? (
          <div className="text-sm text-green-600 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Get it by Tomorrow
          </div>
        ) : (
          <div className="text-sm text-red-600">
            Out of Stock
          </div>
        )}

        {/* Add to Cart Button */}
        <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
} 