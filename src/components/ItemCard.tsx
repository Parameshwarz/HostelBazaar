import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { 
  Eye, 
  Heart, 
  Share2, 
  MapPin, 
  Clock, 
  MessageCircle,
  Shield,
  Star,
  Tag,
  TrendingUp,
  BadgeCheck,
  Flame,
  Timer,
  Sparkles
} from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

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
    response_time?: string;
  };
  location?: string;
  views?: number;
  interested_count?: number;
  market_price?: number;
  demand_level?: 'high' | 'medium' | 'low';
  trending?: boolean;
}

interface Props {
  item: Item;
  viewMode?: 'grid' | 'list';
  onQuickView?: (item: Item) => void;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  onShare?: () => void;
  onContact?: () => void;
}

const tiltOptions = {
  reverse: false,
  max: 15,
  perspective: 1000,
  scale: 1.02,
  speed: 1000,
  transition: true,
  axis: null,
  reset: true,
  easing: "cubic-bezier(.03,.98,.52,.99)",
};

export default function ItemCard({ 
  item, 
  viewMode, 
  onQuickView, 
  isWishlisted, 
  onWishlistToggle,
  onShare,
  onContact 
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate price difference percentage
  const getPriceDifference = () => {
    if (!item.market_price) return null;
    const diff = ((item.market_price - item.price) / item.market_price) * 100;
    return diff > 0 ? Math.round(diff) : null;
  };

  // Format time ago
  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
  };

  // Handle share
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(window.location.origin + `/items/${item.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const cardContent = (
    <motion.div
      className={`group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 ${
        viewMode === 'list' ? 'flex' : 'block'
      }`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <Link 
        to={`/items/${item.id}`} 
        className={viewMode === 'list' ? 'flex flex-1' : 'block'}
        onClick={(e) => {
          if (isHovered) e.preventDefault();
        }}
      >
        {/* Image Section with Glassmorphism */}
        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'} overflow-hidden bg-gradient-to-br from-gray-50 to-white`}>
          <LazyLoadImage
            src={item.images[0]}
            alt={item.title}
            effect="blur"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            wrapperClassName="w-full h-full"
            placeholderSrc={item.images[0] + '?blur=200'}
          />

          {/* Condition Badge - Moved to top-left */}
          <div className="absolute top-2 left-2 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shadow-lg border backdrop-blur-md
                ${item.condition === 'New' 
                  ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200/50' 
                  : item.condition === 'Like New'
                  ? 'bg-blue-50/90 text-blue-700 border-blue-200/50'
                  : 'bg-gray-50/90 text-gray-700 border-gray-200/50'
                }`}
            >
              {item.condition}
            </motion.div>
          </div>
          
          {/* Status Overlay with Glassmorphism */}
          {item.status && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm z-20
                ${item.status === 'sold' ? 'bg-black/30' : 'bg-indigo-500/30'}`}
            >
              <span className="text-white font-medium px-6 py-2 rounded-full bg-black/30 backdrop-blur-md
                shadow-lg border border-white/20">
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </motion.div>
          )}

          {/* Enhanced Trending Badge - Moved below condition */}
          {item.trending && (
            <motion.div
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              className="absolute top-12 right-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500
                text-white text-xs font-medium rounded-full flex items-center gap-1.5 shadow-lg z-10"
            >
              <Sparkles className="w-3 h-3" />
              Trending
            </motion.div>
          )}

          {/* Price Badge with Glassmorphism */}
          <div className="absolute bottom-2 left-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl
            shadow-lg border border-white/50 transition-all duration-300 group-hover:bg-white/95 z-10">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 
                bg-clip-text text-transparent">₹{item.price}</span>
              {item.market_price && item.market_price > item.price && (
                <span className="text-xs text-gray-500 line-through">₹{item.market_price}</span>
              )}
            </div>
          </div>

          {/* Quick Actions with Enhanced Animation - Moved to right side */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-2 right-2 flex flex-col items-end gap-2 z-30"
              >
                {onQuickView && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      onQuickView(item);
                    }}
                    className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl
                      transition-all duration-300 hover:bg-white border border-white/50"
                    aria-label="Quick view"
                  >
                    <Eye className="w-4 h-4 text-indigo-600" />
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleShare();
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl
                    transition-all duration-300 hover:bg-white border border-white/50"
                  aria-label="Share item"
                >
                  <Share2 className="w-4 h-4 text-indigo-600" />
                </motion.button>

                {onWishlistToggle && (
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      onWishlistToggle();
                    }}
                    className={`p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                      border border-white/50 backdrop-blur-md
                      ${isWishlisted ? 'bg-red-50/90 hover:bg-red-50' : 'bg-white/90 hover:bg-white'}`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-indigo-600'}`} 
                    />
                  </motion.button>
                )}

                {onContact && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      onContact();
                    }}
                    className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl
                      transition-all duration-300 hover:bg-white border border-white/50"
                    aria-label="Contact seller"
                  >
                    <MessageCircle className="w-4 h-4 text-indigo-600" />
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rest of the card content */}
        <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 line-clamp-2 leading-snug">
              {item.title}
            </h3>
            {getPriceDifference() && (
              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg whitespace-nowrap">
                {getPriceDifference()}% off
              </span>
            )}
          </div>

          {viewMode === 'list' && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
          )}

          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{item.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{getTimeAgo()}</span>
            </div>
          </div>

          {item.profiles && (
            <div className="mt-3 flex items-center gap-2">
              {item.profiles.avatar_url ? (
                <img 
                  src={item.profiles.avatar_url} 
                  alt={item.profiles.username}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
              <span className="text-sm text-gray-600 flex items-center gap-1">
                {item.profiles.username}
                {item.profiles.verified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                )}
              </span>
              {item.profiles.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-600">{item.profiles.rating}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );

  return viewMode === 'grid' ? (
    <Tilt options={tiltOptions}>
      {cardContent}
    </Tilt>
  ) : cardContent;
}