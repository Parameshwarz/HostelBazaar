import { useState } from "react";
import { Eye, Heart, ShoppingCart, Star, ShoppingBag } from "lucide-react";
import { Product } from '../../types/merch';
import { useNavigate } from "react-router-dom";
import { getPlaceholderImage, PLACEHOLDER_IMAGE } from '../../constants/images';

interface MerchCardProps {
  product: Product;
  onAddToCart?: (id: string) => void;
  onAddToWishlist?: () => void;
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
}

export default function MerchCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist,
  onClick,
  viewMode = 'grid'
}: MerchCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate();

  const getStockDisplay = (stockCount: number) => {
    if (stockCount === 0) return null;
    if (stockCount <= 10) return 'Low in stock';
    return null;
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden transition-all duration-500 ease-out
      hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      {/* Image Container */}
      <div 
        onClick={() => navigate(`/merch/${product.id}`)}
        className="relative aspect-square overflow-hidden cursor-pointer"
      >
        <img
          src={product.product_images?.[0]?.image_url}
          alt={product.title}
          className="w-full h-full object-cover transition-all duration-700 ease-out
            group-hover:scale-110"
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Use picsum with product ID as seed for consistent images
            target.src = `https://picsum.photos/seed/${product.id}/400/400`;
          }}
        />
        
        {/* Show loading state */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 
          transition-all duration-500 ease-out">
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToWishlist?.();
              }}
              className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg 
                transform translate-x-12 opacity-0
                group-hover:translate-x-0 group-hover:opacity-100
                transition-all duration-500 ease-out hover:scale-110"
              aria-label="Add to Wishlist"
            >
              <Heart className="w-5 h-5 text-gray-700 hover:text-rose-500 
                transition-colors duration-300" />
            </button>
          </div>

          {/* Quick View Button */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="w-full py-2.5 px-4 bg-white/95 backdrop-blur-sm rounded-lg 
                shadow-lg hover:bg-white
                transform translate-y-12 opacity-0
                group-hover:translate-y-0 group-hover:opacity-100
                transition-all duration-500 ease-out
                flex items-center justify-center gap-2 font-medium
                text-gray-700 hover:text-violet-600"
            >
              <Eye className="w-4 h-4" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.stock_count === 0 && (
            <div className="px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white 
              text-sm font-medium rounded-lg shadow-lg">
              Out of Stock
            </div>
          )}
          {product.on_sale && (
            <div className="px-3 py-1.5 bg-green-500/90 backdrop-blur-sm text-white 
              text-sm font-medium rounded-lg shadow-lg">
              Sale
            </div>
          )}
          {product.is_new && (
            <div className="px-3 py-1.5 bg-violet-500/90 backdrop-blur-sm text-white 
              text-sm font-medium rounded-lg shadow-lg">
              New
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-gray-900 group-hover:text-violet-600 
            transition-colors duration-300 line-clamp-1">
            {product.title}
          </h3>
          <div className="flex flex-col items-end">
            {product.on_sale && (
              <span className="text-sm line-through text-gray-400">₹{product.original_price}</span>
            )}
            <span className={`font-semibold ${product.on_sale ? 'text-green-600' : 'text-violet-600'}`}>
              ₹{product.price}
            </span>
          </div>
        </div>

        {/* Rating & Stock in one line */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          )}
          {getStockDisplay(product.stock_count) && (
            <span className="text-orange-600 font-medium">
              {getStockDisplay(product.stock_count)}
            </span>
          )}
        </div>

        {/* Tags/Categories */}
        <div className="flex flex-wrap gap-1">
          {product.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}