import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../../types/merch';
import MerchCard from '../MerchCard';
import { toast } from 'react-hot-toast';
import { getPlaceholderImage } from '../../../constants/images';

interface TrendingSectionProps {
  products: Product[];
  loading: boolean;
  activeTab: string;
  addToCart: (id: string) => void;
}

export default function TrendingSection({ products, loading, activeTab, addToCart }: TrendingSectionProps) {
  const navigate = useNavigate();

  console.log('TrendingSection - Products:', products);
  console.log('TrendingSection - Loading:', loading);
  console.log('TrendingSection - Active Tab:', activeTab);

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'trending':
        return 'Trending Now';
      case 'new':
        return 'Just Dropped';
      case 'premium':
        return 'Premium Collection';
      case 'deals':
        return 'Best Deals';
      default:
        return 'Products';
    }
  };

  const getSectionDescription = () => {
    switch (activeTab) {
      case 'trending':
        return 'Most popular items this season';
      case 'new':
        return 'Fresh arrivals from this week';
      case 'premium':
        return 'High-quality premium merchandise';
      case 'deals':
        return 'Best prices on popular items';
      default:
        return 'Explore our collection';
    }
  };

  const getViewAllLink = () => {
    switch (activeTab) {
      case 'trending':
        return '/browse-merch?sort=trending';
      case 'new':
        return '/browse-merch?filter=new';
      case 'premium':
        return '/browse-merch?category=premium';
      case 'deals':
        return '/browse-merch?sort=price_asc';
      default:
        return '/browse-merch';
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    console.log('TrendingSection - No products found');
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="mb-4">
              <img
                src="/empty-box.svg"
                alt="No products"
                className="w-24 h-24 mx-auto opacity-50"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-500">
              We couldn't find any products matching your criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-grow">
            <h2 className="text-2xl font-bold text-gray-900">{getSectionTitle()}</h2>
            <p className="text-gray-600 mt-2">{getSectionDescription()}</p>
          </div>
          {products.length >= 8 && (
            <button
              onClick={() => navigate(getViewAllLink())}
              className="flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors ml-4"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <MerchCard
              key={product.id}
              product={{
                ...product,
                product_images: product.product_images?.length ? product.product_images : [{
                  image_url: `https://picsum.photos/seed/${product.id}/400/400`,
                  is_primary: true
                }]
              }}
              onClick={() => navigate(`/merch/${product.id}`)}
              onAddToWishlist={() => toast.success('Added to wishlist')}
              onAddToCart={(id) => {
                addToCart(id);
                toast.success('Added to cart');
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 