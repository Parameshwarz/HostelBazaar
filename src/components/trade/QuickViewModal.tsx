import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, MessageCircle, MapPin, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  condition: string;
  created_at: string;
  user_id: string;
  status?: 'available' | 'sold' | 'reserved';
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string;
    rating?: number;
    verified?: boolean;
  };
  location?: string;
  views?: number;
  interested_count?: number;
  market_price?: number;
}

interface Props {
  item: Item | null;
  onClose: () => void;
  onWishlist?: () => void;
  onShare?: () => void;
  onContact?: () => void;
  isWishlisted?: boolean;
}

export default function QuickViewModal({
  item,
  onClose,
  onWishlist,
  onShare,
  onContact,
  isWishlisted
}: Props) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Image Gallery */}
            <div className="md:w-1/2 p-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {item.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={image}
                        alt={`${item.title} - Image ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-4 space-y-4">
              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">₹{item.price}</div>
                  {item.market_price && item.market_price > item.price && (
                    <div className="text-sm text-gray-500">
                      <span className="line-through">₹{item.market_price}</span>
                      <span className="ml-2 text-green-600">
                        {Math.round(((item.market_price - item.price) / item.market_price) * 100)}% off
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {onWishlist && (
                    <button
                      onClick={onWishlist}
                      className={`p-2 rounded-lg ${
                        isWishlisted
                          ? 'bg-red-50 text-red-500'
                          : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={isWishlisted ? 'fill-current' : ''} />
                    </button>
                  )}
                  {onShare && (
                    <button
                      onClick={onShare}
                      className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg"
                      aria-label="Share item"
                    >
                      <Share2 />
                    </button>
                  )}
                  {onContact && (
                    <button
                      onClick={onContact}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Seller
                    </button>
                  )}
                </div>
              </div>

              {/* Item Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Condition</h3>
                  <p className="mt-1 text-sm text-gray-900">{item.condition}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Description</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                </div>

                {item.category && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Category</h3>
                    <p className="mt-1 text-sm text-gray-900">{item.category.name}</p>
                  </div>
                )}
              </div>

              {/* Seller Info */}
              {item.profiles && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Seller Information</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.profiles.avatar_url ? (
                        <img
                          src={item.profiles.avatar_url}
                          alt={item.profiles.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-600">
                            {item.profiles.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{item.profiles.username}</div>
                        {item.profiles.rating && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{item.profiles.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <div className="flex items-center gap-4">
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </div>
                </div>
                {(item.views || item.interested_count) && (
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {item.views && (
                      <span>{item.views} views</span>
                    )}
                    {item.interested_count && (
                      <span>{item.interested_count} interested</span>
                    )}
                  </div>
                )}
              </div>

              {/* View Full Details Link */}
              <Link
                to={`/items/${item.id}`}
                className="block text-center mt-4 text-indigo-600 hover:text-indigo-700"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 