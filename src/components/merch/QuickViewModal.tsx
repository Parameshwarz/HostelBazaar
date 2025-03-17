import React from 'react';
import { Product } from '../../types/merch';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, ExternalLink, Star } from 'lucide-react';
import { PLACEHOLDER_IMAGE, getPlaceholderImage } from '../../constants/images';

export interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}

const getStockDisplay = (stockCount: number) => {
  if (stockCount === 0) return 'Out of stock';
  if (stockCount <= 10) return 'Low in stock';
  return 'In stock';  // For normal stock levels
};

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist,
  onViewDetails
}) => {
  if (!product) return null;

  const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 py-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl 
              overflow-hidden max-h-[calc(100vh-4rem)]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 
                hover:bg-gray-100 rounded-full transition-colors z-10 group"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto overscroll-contain h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden 
                    ring-1 ring-gray-200">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={product.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  {product.product_images && product.product_images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin 
                      scrollbar-thumb-gray-300 scrollbar-track-transparent">
                      {product.product_images.map((img, index) => (
                        <div
                          key={index}
                          className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden 
                            ring-1 ring-gray-200 hover:ring-2 hover:ring-violet-500 
                            cursor-pointer transition-all transform hover:scale-105"
                        >
                          <img
                            src={img.image_url}
                            alt={`${product.title} - View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">{product.title}</h3>
                    
                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-sm">{product.rating.toFixed(1)}</span>
                        {product.rating_count && (
                          <span className="text-gray-500 text-sm">
                            ({product.rating_count} reviews)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-violet-600">₹{product.price}</span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-base text-gray-500 line-through">
                          ₹{product.original_price}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-4">{product.description}</p>

                    {/* Stock Status */}
                    <div className="text-sm text-gray-600 mb-4">
                      <span className={`${
                        product.stock_count === 0 
                          ? 'text-red-600' 
                          : product.stock_count <= 10 
                            ? 'text-orange-600' 
                            : 'text-green-600'
                      } font-medium`}>
                        {getStockDisplay(product.stock_count)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-6 mt-6 border-t border-gray-100">
                    <button
                      onClick={() => onAddToCart(product.id)}
                      disabled={product.stock_count === 0}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 
                        bg-violet-600 text-white rounded-xl font-medium
                        hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed 
                        transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => onAddToWishlist(product.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 
                          bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 
                          transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="font-medium">Wishlist</span>
                      </button>

                      <button
                        onClick={() => onViewDetails(product.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 
                          bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 
                          transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="font-medium">Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal; 