import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Sparkles, Tag, Zap, Trophy, Star, Search, Filter, TrendingUp, Gift } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import FeaturedProducts from '../components/merch/FeaturedProducts';
import TrendingProducts from '../components/merch/TrendingProducts';
import CampusCollections from '../components/merch/collections/CampusCollections';
import CampusStyleFeed from '../components/merch/social/CampusStyleFeed';
import CampusRewards from '../components/merch/gamification/CampusRewards';
import { toast } from 'react-hot-toast';
import QuickFilters from '../components/merch/filters/QuickFilters';
import TrendingSection from '../components/merch/sections/TrendingSection';
import MerchCard from '../components/merch/MerchCard';
import { useCart } from '../hooks/useCart';
import { Product } from '../types/merch';  // Add this import

export default function MerchPage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('trending');
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  // Fetch initial products
  useEffect(() => {
    fetchProducts('trending');
  }, []);

  const fetchProducts = async (filterType: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price,
          category,
          type,
          is_active,
          created_at,
          stock_count,
          view_count,
          product_images (
            image_url,
            is_primary
          )
        `)
        .eq('is_active', true);

      console.log('Initial query:', query);

      // Apply different filters based on type
      switch (filterType) {
        case 'trending':
          query = query.order('created_at', { ascending: false });
          break;
        case 'new':
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          query = query.gte('created_at', sevenDaysAgo.toISOString());
          break;
        case 'premium':
          query = query.eq('category', 'premium');
          break;
        case 'deals':
          query = query.order('price', { ascending: true });
          break;
      }

      console.log('Query after filters:', query);

      const { data, error } = await query.limit(8);
      
      console.log('Fetched products:', data);
      console.log('Error if any:', error);

      if (error) throw error;
      setProducts(data || []);

      // Fetch featured products separately
      if (filterType === 'trending') {
        const { data: featuredData, error: featuredError } = await supabase
          .from('products')
          .select(`
            id,
            title,
            description,
            price,
            category,
            type,
            is_active,
            created_at,
            stock_count,
            view_count,
            product_images (
              image_url,
              is_primary
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(4);

        console.log('Fetched featured products:', featuredData);
        console.log('Featured error if any:', featuredError);

        if (featuredError) throw featuredError;
        setFeaturedProducts(featuredData || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    fetchProducts(tabId);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse-merch?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Quick filters for popular categories
  const quickFilters = [
    { id: 'trending', label: 'Trending Now', icon: TrendingUp },
    { id: 'new', label: 'Just Dropped', icon: Zap },
    { id: 'premium', label: 'Premium', icon: Trophy },
    { id: 'deals', label: 'Best Deals', icon: Tag },
  ];

  // Sample stats - replace with real data
  const stats = [
    { label: 'Active Users', value: '5K+' },
    { label: 'Products Sold', value: '10K+' },
    { label: 'Avg Rating', value: '4.8★' },
    { label: 'Delivery Time', value: '2-3d' },
  ];

  // Add this before the return statement
  const rewardsData = {
    userPoints: 750,
    nextReward: 1000,
    rewards: [
      {
        id: 1,
        name: 'Free Shipping',
        points: 500,
        icon: ShoppingBag,
        isUnlocked: true
      },
      {
        id: 2,
        name: '10% Discount',
        points: 1000,
        icon: Tag,
        isUnlocked: false
      },
      {
        id: 3,
        name: 'Premium Status',
        points: 2000,
        icon: Trophy,
        isUnlocked: false
      },
      {
        id: 4,
        name: 'Special Gifts',
        points: 5000,
        icon: Gift,
        isUnlocked: false
      }
    ],
    recentActivity: [
      { action: 'Purchase', points: 50, date: '2024-02-20' },
      { action: 'Review', points: 20, date: '2024-02-19' },
      { action: 'Share', points: 10, date: '2024-02-18' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Hero Section */}
      <div className="relative bg-gradient-to-br from-violet-600 to-violet-900 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '32px 32px' 
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Discover Our Latest Collection</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Campus Style, Redefined
            </h1>
            
            <p className="text-lg sm:text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Explore our curated collection of premium college merchandise, designed for the modern student
            </p>

            {/* Brand Theme Search Experience */}
            <div className="relative max-w-2xl mx-auto mb-14">
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex items-center">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-14 pr-4 py-4 rounded-l-xl bg-white text-gray-900 
                          placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500
                          text-base shadow-lg"
                      />
                      <Search className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button 
                      type="submit"
                      className="bg-violet-700 hover:bg-violet-800 text-white px-8 py-4 rounded-r-xl
                        font-medium transition-colors shadow-lg flex items-center gap-2"
                    >
                      Search
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Enhanced Popular Search Terms */}
                <div className="absolute left-14 right-0 -bottom-12">
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="font-semibold text-white/70">Popular:</span>
                    <div className="flex items-center">
                      {['Hoodies', 'T-Shirts', 'Accessories'].map((term, index) => (
                        <React.Fragment key={term}>
                          <button
                            onClick={() => setSearchQuery(term)}
                            className="text-gray-400 hover:text-[#FFA500] transition-colors px-3 py-1
                              hover:underline underline-offset-4"
                          >
                            {term}
                          </button>
                          {index < 2 && (
                            <span className="text-gray-600 last:hidden">•</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <QuickFilters activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <button
                onClick={() => navigate('/browse-merch')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 rounded-xl
                  font-medium hover:bg-gray-50 transition-colors shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Collection
              </button>
              <button
                onClick={() => navigate('/merch/new-arrivals')}
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 text-white 
                  rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                <Star className="w-5 h-5" />
                New Arrivals
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-violet-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <button 
                onClick={() => navigate('/browse-merch?featured=true')}
                className="text-violet-600 hover:text-violet-700"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <MerchCard
                  key={product.id}
                  product={{
                    ...product,
                    // Don't try to generate placeholder images, just show a simple no-image state
                    product_images: product.product_images?.length ? product.product_images : undefined
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
      )}

      {/* Main Products Section */}
      <TrendingSection 
        products={products} 
        loading={loading} 
        activeTab={activeTab}
        addToCart={addToCart}
      />

      {/* Campus Collections */}
      <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Campus Collections</h2>
            <p className="text-gray-600 mt-2">Curated collections for every campus vibe</p>
          </div>
          <CampusCollections />
        </div>
      </div>

      {/* Campus Style Feed */}
      <div className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Style Feed</h2>
            <p className="text-gray-600 mt-2">Get inspired by what others are wearing</p>
          </div>
          <CampusStyleFeed onProductClick={(id) => navigate(`/merch/${id}`)} />
        </div>
      </div>

      {/* Campus Rewards */}
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <CampusRewards />
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-violet-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to explore our full collection?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/browse-merch')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 rounded-full
                font-medium hover:bg-violet-50 transition-colors shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/merch/style-guide')}
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full
                font-medium hover:bg-white/10 transition-colors"
            >
              <Star className="w-5 h-5" />
              Style Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 