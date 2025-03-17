import React, { useState, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Star, 
  ArrowRight,
  BookOpen,
  Laptop,
  Sofa,
  Shirt,
  UtensilsCrossed,
  Trophy,
  MoreHorizontal,
  Sparkles,
  Tag,
  Clock,
  Flame,
  Share2,
  Heart,
  MessageCircle,
  Shield,
  Zap,
  BarChart3,
  History,
  ThumbsUp,
  Gift,
  Users,
  MapPin,
  Users2,
  Clock3,
  BookMarked,
  Building2,
  CalendarClock,
  Map,
  GraduationCap,
  Scale,
  Timer,
  Building,
  Bell,
  CircleDot,
  BadgeCheck,
  School2,
  UserCircle2,
  Gauge,
  CalendarDays,
  Bookmark,
  Award,
  CheckCircle,
  Lightbulb,
  LineChart,
  ArrowLeftRight,
  AlertTriangle,
  MessageSquarePlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCategories } from '../hooks/useCategories';
import { useItems } from '../hooks/useItems';
import ItemCard from '../components/ItemCard';
import QuickViewModal from '../components/trade/QuickViewModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Helmet } from 'react-helmet';
import SafetyFeatures from '../components/trade/SafetyFeatures';
import EnhancedSearch from '../components/trade/EnhancedSearch';
import SmartFeatures from '../components/trade/SmartFeatures';
import { Tilt } from 'react-tilt';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../lib/supabase';
import ItemCardSkeleton from '../components/skeletons/ItemCardSkeleton';
import SellerCardSkeleton from '../components/skeletons/SellerCardSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import { toast } from 'react-hot-toast';

interface TradingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  condition: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  user_id: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  status?: 'available' | 'sold' | 'reserved';
}

type StatValue = number | string;

interface AnimatedStat {
  label: string;
  value: StatValue;
  icon: React.FC<{ className?: string }>;
  color: string;
}

interface Seller {
  id: string;
  username: string;
  avatar_url?: string;
  department: string;
  rating: number;
  trades: number;
}

// First, update the observer options near the top of the file where other constants are defined
const observerOptions = {
  triggerOnce: true,
  threshold: 0,  // Trigger as soon as any part of element is visible
  rootMargin: '50px 0px'  // Start loading slightly before element enters viewport
};

// Update the containerVariants to have a better initial state
const containerVariants = {
  hidden: { opacity: 0.8, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Keep the optimized animation transitions
const floatingElementTransition = {
  duration: 1.5,
  ease: "easeOut"
};

const backgroundPatternAnimation = {
  opacity: [0.3, 0.4],
  transition: {
    duration: 2,
    ease: "linear"
  }
};

// Add this near the top with other animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Add this before the Trade component
interface SectionHeaderProps {
  icon: React.FC<{ className?: string }>;
  title: string;
  viewAllLink?: string;
  iconColor: string;
  bgColor: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  icon: Icon, 
  title, 
  viewAllLink, 
  iconColor, 
  bgColor 
}) => (
  <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-3">
      <div className={`p-2 ${bgColor} rounded-lg`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">
        {title}
      </h2>
    </div>
    {viewAllLink && (
      <Link
        to={viewAllLink}
        className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      >
        View all
        <ArrowRight className="h-4 w-4" />
      </Link>
    )}
  </motion.div>
);

// Update the GridSectionProps interface
interface GridSectionProps {
  items: TradingItem[];
  isLoading?: boolean;
  error?: string | null;  // Keep this as string | null
  renderItem: (item: TradingItem) => React.ReactNode;
}

const GridSection: React.FC<GridSectionProps> = ({ 
  items, 
  isLoading, 
  error, 
  renderItem 
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {isLoading ? (
      [...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          className="transform transition-all duration-200"
        >
          <ItemCardSkeleton />
        </motion.div>
      ))
    ) : error ? (
      <div className="col-span-full text-center py-8">
        <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    ) : items?.length === 0 ? (
      <div className="col-span-full text-center py-8 text-gray-500">
        No items found
      </div>
    ) : (
      items?.map((item) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          className="transform transition-all duration-200"
        >
          {renderItem(item)}
        </motion.div>
      ))
    )}
  </div>
);

// Add this before the Trade component
const SellerGrid: React.FC<{ sellers: Seller[] }> = ({ sellers }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {sellers.map((seller) => (
      <motion.div
        key={seller.id}
        variants={itemVariants}
        className="transform transition-all duration-200"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={seller.avatar_url || '/default-avatar.png'}
              alt={seller.username}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{seller.username}</h3>
              <p className="text-sm text-gray-500">{seller.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500" />
              <span>{seller.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{seller.trades} trades</span>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default function Trade() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TradingItem | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parallax effect
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Animated stats
  const [stats] = useState([
    { label: 'Active Listings', value: 1200, icon: Tag, color: 'from-blue-500 to-indigo-500' },
    { label: 'Items Traded', value: 5000, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Active Users', value: 800, icon: Star, color: 'from-amber-500 to-orange-500' },
    { label: 'Response Time', value: '< 30 mins', icon: Clock, color: 'from-purple-500 to-pink-500' }
  ]);

  const [animatedStats, setAnimatedStats] = useState<StatValue[]>(
    stats.map(stat => typeof stat.value === 'number' ? 0 : stat.value)
  );

  // Optimized stats animation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const animateStats = () => {
      setAnimatedStats(prev => 
        prev.map((value, i) => {
          if (typeof stats[i].value === 'number' && typeof value === 'number') {
            const target = stats[i].value as number;
            const increment = Math.ceil(target / 5); // Faster animation with fewer steps
            return Math.min(value + increment, target);
          }
          return value;
        })
      );
    };

    // Run animation only once with faster intervals
    const interval = setInterval(animateStats, 100);
    
    // Clear animation after 1 second
    timeout = setTimeout(() => {
      clearInterval(interval);
      // Set final values
      setAnimatedStats(stats.map(stat => stat.value));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [stats]);

  // Only fetch trending items
  const filters = useMemo(() => ({
    category: '',
    subcategory: '',
    condition: '',
    search: '',
    sortBy: 'created_at_desc' as const,
    limit: 4,
    showWishlisted: false
  }), []);

  const { items: trendingItems, isLoading: itemsLoading, error: itemsError } = useItems(filters);

  // Persistent storage for saved searches and wishlisted items
  const [savedSearches, setSavedSearches] = useLocalStorage<string[]>('saved_searches', []);
  const [wishlistedItems, setWishlistedItems] = useLocalStorage<string[]>('wishlisted_items', []);

  // New state for additional sections
  const [recentItems, setRecentItems] = useState<TradingItem[]>([]);
  const [bestDeals, setBestDeals] = useState<TradingItem[]>([]);
  const [essentialItems, setEssentialItems] = useState<TradingItem[]>([]);
  const [exchangeItems, setExchangeItems] = useState<TradingItem[]>([]);
  const [featuredSellers, setFeaturedSellers] = useState<Seller[]>([]);

  // Create separate refs for each section
  const [trendingRef, trendingInView] = useInView({ ...observerOptions, initialInView: true });
  const [recentRef, recentInView] = useInView({ ...observerOptions, initialInView: true });
  const [dealsRef, dealsInView] = useInView({ ...observerOptions, initialInView: true });
  const [essentialsRef, essentialsInView] = useInView({ ...observerOptions, initialInView: true });
  const [exchangeRef, exchangeInView] = useInView({ ...observerOptions, initialInView: true });
  const [sellersRef, sellersInView] = useInView({ ...observerOptions, initialInView: true });
  const [featuresRef, featuresInView] = useInView({ ...observerOptions, initialInView: true });
  const [collectionsRef, collectionsInView] = useInView({ ...observerOptions, initialInView: true });

  // Add these new refs with the other section refs
  const [popularRef, popularInView] = useInView({ ...observerOptions, initialInView: true });
  const [storiesRef, storiesInView] = useInView({ ...observerOptions, initialInView: true });
  const [joinRef, joinInView] = useInView({ ...observerOptions, initialInView: true });

  // Optimized data fetching
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const [
          recentResponse,
          dealsResponse,
          essentialsResponse,
          exchangeResponse,
          sellersResponse
        ] = await Promise.all([
          supabase.from('items').select('*').order('created_at', { ascending: false }).limit(4),
          supabase.from('items').select('*').order('price', { ascending: true }).limit(4),
          supabase.from('items').select('*').eq('category', 'essentials').limit(4),
          supabase.from('items').select('*').eq('type', 'exchange').limit(4),
          supabase.from('profiles').select('*').order('rating', { ascending: false }).limit(4)
        ]);

        if (recentResponse.data) setRecentItems(recentResponse.data);
        if (dealsResponse.data) setBestDeals(dealsResponse.data);
        if (essentialsResponse.data) setEssentialItems(essentialsResponse.data);
        if (exchangeResponse.data) setExchangeItems(exchangeResponse.data);
        if (sellersResponse.data) setFeaturedSellers(sellersResponse.data);
      } catch (error) {
        console.error('Error fetching section data:', error);
      }
    };

    fetchSectionData();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Save search to history if not already present
      if (!savedSearches.includes(query)) {
        setSavedSearches(prev => [query, ...prev].slice(0, 10)); // Keep last 10 searches
      }
      
      navigate(`/browse?search=${encodeURIComponent(query)}`);
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSearch = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Implement image search functionality
      console.log('Image search with file:', file);
      
      // For now, just navigate to browse with a placeholder query
      navigate('/browse?type=image');
    } catch (err) {
      setError('Failed to perform image search. Please try again.');
      console.error('Image search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = (itemId: string) => {
    setWishlistedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      return [...prev, itemId];
    });
  };

  // Pass wishlist state to ItemCard
  const renderItemCard = (item: TradingItem) => (
    <ItemCard
      key={item.id}
      item={item}
      onQuickView={handleQuickView}
      isWishlisted={wishlistedItems.includes(item.id)}
      onWishlistToggle={() => toggleWishlist(item.id)}
    />
  );

  const handleQuickView = (item: TradingItem) => {
    setSelectedItem(item);
    setShowQuickView(true);
  };

  const handleCloseQuickView = () => {
    setShowQuickView(false);
    setSelectedItem(null);
  };

  const handleWishlist = async (itemId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Toggle wishlist
    const isWishlisted = wishlistedItems.includes(itemId);
    if (isWishlisted) {
      setWishlistedItems(prev => prev.filter(id => id !== itemId));
    } else {
      setWishlistedItems(prev => [...prev, itemId]);
    }
  };

  const handleShare = async (itemId: string) => {
    const url = `${window.location.origin}/items/${itemId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleContact = (itemId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/chat/${itemId}`);
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/browse?category=${slug}`);
  };

  // Replace hardcoded image paths with proper imports or public URLs
  const TESTIMONIAL_IMAGES = {
    alex: '/images/testimonials/default-user.png',
    sarah: '/images/testimonials/default-user.png',
    mike: '/images/testimonials/default-user.png'
  };

  const COLLECTION_IMAGES = {
    semesterEnd: '/images/collections/default-collection.png',
    studyGroup: '/images/collections/default-collection.png',
    dorm: '/images/collections/default-collection.png'
  };

  // Error boundary fallback
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Student Trading Hub | HostelBazaar</title>
        <meta name="description" content="Buy, sell, rent, or share used items with fellow students. Save money and help your campus community." />
        <meta name="keywords" content="student marketplace, campus trading, used items, student community, hostel bazaar" />
        <meta property="og:title" content="Student Trading Hub | HostelBazaar" />
        <meta property="og:description" content="Your campus marketplace for buying, selling, renting, or sharing used items with fellow students" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Student Trading Hub | HostelBazaar" />
        <meta name="twitter:description" content="Your campus marketplace for buying, selling, renting, or sharing used items with fellow students" />
        
        {/* Structured Data for Rich Results */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Student Trading Hub",
            "description": "Your campus marketplace for buying, selling, renting, or sharing used items with fellow students",
            "provider": {
              "@type": "Organization",
              "name": "HostelBazaar",
              "description": "Campus marketplace platform"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50" style={{ position: 'relative' }}>
        {/* Hero Section */}
        <motion.div
          style={{ y }}
          className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 py-20 overflow-hidden w-full"
          role="banner"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Existing Background Patterns */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10" />
            <motion.div
              animate={backgroundPatternAnimation}
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.1) 100%)',
                backgroundSize: '200% 200%'
              }}
            />
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={floatingElementTransition}
            className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={floatingElementTransition}
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block mb-8"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight flex items-center justify-center gap-4">
                  Student Trading Hub
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative inline-flex"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                    <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-full">
                      <Share2 className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-white/90 mb-6 max-w-3xl mx-auto"
              >
                Your campus marketplace for buying, selling, renting, or sharing used items with fellow students
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
              >
                Save money, reduce waste, and help your campus community
              </motion.p>

              {/* Enhanced Search Bar - Single Instance */}
              <div className="max-w-2xl mx-auto relative z-[100]">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-xl p-1">
                  <EnhancedSearch
                    onSearch={handleSearch}
                    onImageSearch={handleImageSearch}
                  />
                </div>
              </div>

              {/* Action Buttons with Consistent Spacing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap justify-center gap-6 mt-12"
              >
                {user?.id ? (
                  <div className="flex gap-5">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/items/new?type=sell"
                        className="inline-flex items-center px-6 py-3 rounded-full bg-white text-indigo-600 
                          font-medium hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Tag className="h-5 w-5 mr-2" />
                        Sell Item
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/items/new?type=rent"
                        className="inline-flex items-center px-6 py-3 rounded-full bg-emerald-500 text-white 
                          font-medium hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Clock className="h-5 w-5 mr-2" />
                        Rent Out
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/items/new?type=request"
                        className="inline-flex items-center px-6 py-3 rounded-full bg-amber-500 text-white 
                          font-medium hover:bg-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <MessageSquarePlus className="h-5 w-5 mr-2" />
                        Request Item
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/items/new?type=free"
                        className="inline-flex items-center px-6 py-3 rounded-full bg-rose-500 text-white 
                          font-medium hover:bg-rose-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Gift className="h-5 w-5 mr-2" />
                        Give Away
                      </Link>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="inline-flex items-center px-8 py-4 rounded-full bg-white text-indigo-600 
                        font-medium hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Get Started with Student Email
                    </Link>
                  </motion.div>
                )}
                {/* Browse Requests button - Always visible */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/requests"
                    className="inline-flex items-center px-6 py-3 rounded-full bg-purple-500 text-white 
                      font-medium hover:bg-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Browse Requests
                  </Link>
                </motion.div>
                {/* Browse Items button - Clean & Professional */}
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <Link
                    to="/browse"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-white/10 
                      backdrop-blur-sm border border-white/20 text-white font-medium 
                      transition-all duration-200 hover:bg-white/20 group"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Browse Marketplace
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Quick Stats with Consistent Spacing */}
              <div className="flex justify-center gap-8 mt-12 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <Shield className="w-6 h-6" />
                  <span className="text-base md:text-lg">Student Verified</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-base md:text-lg">Campus Chat</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <ThumbsUp className="w-6 h-6" />
                  <span className="text-base md:text-lg">Safe Meetup Spots</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Curved bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50" style={{
            clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 50% 100%, 0 0)'
          }} />
        </motion.div>

        {/* Stats Cards - Keep them above hero but below search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative" style={{ zIndex: 2 }}>
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="bg-white rounded-xl p-6"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {typeof animatedStats[stats.indexOf(stat)] === 'number' 
                        ? `${animatedStats[stats.indexOf(stat)]}+`
                        : animatedStats[stats.indexOf(stat)]}
                    </motion.p>
                    <motion.p 
                      className="text-sm text-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {stat.label}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Browse Categories - Full Width */}
        <div className="w-full bg-gray-50 mt-16 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              ref={collectionsRef}
              initial="hidden"
              animate={collectionsInView ? "visible" : "hidden"}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="text-center mb-10">
                <motion.h2 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-4"
                >
                  <Sparkles className="h-8 w-8 text-indigo-600" />
                  Browse Categories
                </motion.h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Find what you need across our diverse range of categories
                </p>
              </motion.div>

              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {[
                  { name: 'Textbooks', icon: BookOpen, slug: 'textbooks', color: 'from-blue-500 to-cyan-500' },
                  { name: 'Electronics', icon: Laptop, slug: 'electronics', color: 'from-purple-500 to-pink-500' },
                  { name: 'Dorm Essentials', icon: Sofa, slug: 'dorm-essentials', color: 'from-amber-500 to-orange-500' },
                  { name: 'Study Materials', icon: Bookmark, slug: 'study-materials', color: 'from-emerald-500 to-teal-500' },
                  { name: 'Room Decor', icon: UtensilsCrossed, slug: 'room-decor', color: 'from-rose-500 to-red-500' },
                  { name: 'Sports & Fitness', icon: Trophy, slug: 'sports-fitness', color: 'from-indigo-500 to-violet-500' },
                  { name: 'Lab Equipment', icon: School2, slug: 'lab-equipment', color: 'from-teal-500 to-emerald-500' },
                  { name: 'Other', icon: MoreHorizontal, slug: 'other', color: 'from-gray-500 to-slate-500' }
                ].map((category) => {
                  const categoryData = categories?.find(c => c.slug === category.slug);
                  const itemCount = categoryData?.item_count || 0;

                  return (
                    <Tilt
                      key={category.slug}
                      options={{
                        max: 25,
                        scale: 1.05,
                        speed: 1000,
                        glare: true,
                        "max-glare": 0.5
                      }}
                    >
                      <motion.button
                        onClick={() => handleCategoryClick(category.slug)}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative w-full"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 
                          transition-opacity duration-300 blur-xl" />
                        <div className="relative p-6 rounded-xl border border-gray-100 bg-white 
                          transition-all duration-300 group-hover:shadow-xl backdrop-blur-sm"
                        >
                          <div className="flex flex-col items-center">
                            <div className={`p-4 rounded-xl bg-gradient-to-r ${category.color} 
                              group-hover:scale-110 transition-transform duration-300`}
                            >
                              <category.icon className="h-8 w-8 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 mt-4">
                              {category.name}
                            </span>
                            <span className="text-sm text-gray-500 mt-1">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    </Tilt>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Main Content Container - Reordered Sections */}
        <div className="relative bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 1. Trending Now Section */}
            <motion.div
              ref={trendingRef}
              initial="hidden"
              animate={trendingInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="mb-12"
            >
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" aria-labelledby="trending-heading">
                <SectionHeader
                  icon={Flame}
                  title="Trending Now"
                  viewAllLink="/trending"
                  iconColor="text-rose-500"
                  bgColor="bg-rose-50"
                />
                <GridSection
                  items={trendingItems}
                  isLoading={itemsLoading}
                  error={itemsError instanceof Error ? itemsError.message : itemsError}
                  renderItem={renderItemCard}
                />
              </section>
            </motion.div>

            {/* 2. Recently Listed Section */}
            <ErrorBoundary>
              <motion.div
                ref={recentRef}
                initial="hidden"
                animate={recentInView ? "visible" : "hidden"}
                variants={containerVariants}
                className="mb-12"
              >
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <SectionHeader
                    icon={Clock}
                    title="Recently Listed"
                    viewAllLink="/recent"
                    iconColor="text-blue-500"
                    bgColor="bg-blue-50"
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                      // Loading State
                      [...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          variants={itemVariants}
                          className="transform transition-all duration-200"
                        >
                          <ItemCardSkeleton />
                        </motion.div>
                      ))
                    ) : error ? (
                      // Error State
                      <div className="col-span-full text-center py-8">
                        <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                          <AlertTriangle className="w-5 h-5" />
                          <p>Failed to load recent items</p>
                        </div>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium
                            hover:bg-red-200 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : recentItems?.length === 0 ? (
                      // Empty State
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No items listed recently
                      </div>
                    ) : (
                      // Content
                      recentItems?.map((item) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          className="transform transition-all duration-200"
                        >
                          {renderItemCard(item)}
                        </motion.div>
                      ))
                    )}
                  </div>
                </section>
              </motion.div>
            </ErrorBoundary>

            {/* 3. Best Deals Section */}
            <motion.div 
              ref={dealsRef}
              initial="hidden"
              animate={dealsInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="mb-12"
            >
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <SectionHeader
                  icon={Tag}
                  title="Best Deals"
                  viewAllLink="/deals"
                  iconColor="text-green-500"
                  bgColor="bg-green-50"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bestDeals?.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="transform transition-all duration-200"
                    >
                      {renderItemCard(item)}
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>

            {/* Semester Essentials Section */}
            <motion.div
              ref={essentialsRef}
              initial="hidden"
              animate={essentialsInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="mb-12"
            >
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <SectionHeader
                  icon={GraduationCap}
                  title="Semester Essentials"
                  viewAllLink="/essentials"
                  iconColor="text-purple-500"
                  bgColor="bg-purple-50"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {essentialItems?.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="transform transition-all duration-200"
                    >
                      {renderItemCard(item)}
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>

            {/* Exchange Corner Section */}
            <motion.div 
              ref={exchangeRef}
              initial="hidden"
              animate={exchangeInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="mb-12"
            >
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <SectionHeader
                  icon={ArrowLeftRight}
                  title="Exchange Corner"
                  viewAllLink="/exchange"
                  iconColor="text-amber-500"
                  bgColor="bg-amber-50"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {exchangeItems?.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="transform transition-all duration-200"
                    >
                      {renderItemCard(item)}
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>

            {/* Featured Sellers Section */}
            <motion.div 
              ref={sellersRef}
              initial="hidden"
              animate={sellersInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="mb-12"
            >
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <SectionHeader
                  icon={Users}
                  title="Featured Sellers"
                  viewAllLink="/sellers"
                  iconColor="text-rose-500"
                  bgColor="bg-rose-50"
                />
                <SellerGrid sellers={featuredSellers} />
              </section>
            </motion.div>

            {/* Featured Collections */}
            <motion.div
              ref={popularRef}
              initial="hidden"
              animate={popularInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="mb-16"
            >
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold text-gray-900 flex items-center gap-2"
                >
                  <Award className="h-6 w-6 text-amber-500" />
                  Popular on Campus
                </motion.h2>
              </motion.div>

              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  {
                    id: '1',
                    title: 'End of Semester',
                    description: 'Graduating students selling their essentials',
                    image: '/images/collections/semester-end.jpg',
                    gradient: 'from-emerald-500 to-teal-500'
                  },
                  {
                    id: '2',
                    title: 'Study Groups',
                    description: 'Share or rent textbooks with your study group',
                    image: '/images/collections/study-group.jpg',
                    gradient: 'from-blue-500 to-indigo-500'
                  },
                  {
                    id: '3',
                    title: 'Dorm Room Setup',
                    description: 'Find everything you need for your dorm',
                    image: '/images/collections/dorm.jpg',
                    gradient: 'from-purple-500 to-pink-500'
                  }
                ].map((collection) => (
                  <motion.div
                    key={collection.id}
                    variants={itemVariants}
                    className="group relative h-64 rounded-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                    <div 
                      className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 
                        transition-opacity duration-300"
                      style={{ 
                        backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`,
                        '--tw-gradient-from': `var(--tw-${collection.gradient.split(' ')[0]})`,
                        '--tw-gradient-to': `var(--tw-${collection.gradient.split(' ')[2]})`
                      } as React.CSSProperties}
                    />
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover transition-transform duration-300 
                        group-hover:scale-110"
                    />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-xl font-semibold text-white mb-2">{collection.title}</h3>
                      <p className="text-white/80">{collection.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Trading Features */}
            <motion.div
              ref={featuresRef}
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="mb-16"
            >
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold text-gray-900 flex items-center gap-2"
                >
                  <School2 className="h-6 w-6 text-violet-500" />
                  Trading Features
                </motion.h2>
              </motion.div>

              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                {[
                  {
                    id: '1',
                    title: 'Study Group Share',
                    description: 'Split costs with your study group members',
                    icon: Users,
                    gradient: 'from-violet-500 to-purple-500'
                  },
                  {
                    id: '2',
                    title: 'Semester Rental',
                    description: 'Rent items for the entire semester',
                    icon: CalendarDays,
                    gradient: 'from-rose-500 to-pink-500'
                  },
                  {
                    id: '3',
                    title: 'Campus Verification',
                    description: 'Trade safely with verified students only',
                    icon: CheckCircle,
                    gradient: 'from-emerald-500 to-teal-500'
                  },
                  {
                    id: '4',
                    title: 'Quick Campus Meetup',
                    description: 'Safe designated spots for item exchange',
                    icon: Zap,
                    gradient: 'from-amber-500 to-orange-500'
                  }
                ].map((feature) => (
                  <motion.div
                    key={feature.id}
                    variants={itemVariants}
                    className="relative group"
                  >
                    <div 
                      className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 
                        transition-opacity duration-300 blur-xl"
                      style={{ 
                        backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`,
                        '--tw-gradient-from': `var(--tw-${feature.gradient.split(' ')[0]})`,
                        '--tw-gradient-to': `var(--tw-${feature.gradient.split(' ')[2]})`
                      } as React.CSSProperties}
                    />
                    <div className="relative bg-white rounded-xl p-6 shadow-lg transition-all duration-300
                      group-hover:shadow-xl border border-gray-100"
                    >
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Student Testimonials */}
            <motion.div
              ref={storiesRef}
              initial="hidden"
              animate={storiesInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="mb-16"
            >
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Stories</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  See how students are helping each other through campus trading
                </p>
              </motion.div>

              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {[
                  {
                    id: '1',
                    name: 'Alex Johnson',
                    course: 'Computer Science, Year 3',
                    message: 'Saved over ₹5000 on textbooks by buying from seniors!',
                    avatar: TESTIMONIAL_IMAGES.alex
                  },
                  {
                    id: '2',
                    name: 'Sarah Chen',
                    course: 'Business Administration, Year 2',
                    message: 'Rented a calculator for the semester instead of buying new',
                    avatar: TESTIMONIAL_IMAGES.sarah
                  },
                  {
                    id: '3',
                    name: 'Mike Patel',
                    course: 'Engineering, Year 4',
                    message: 'Sold my old lab equipment to juniors - eco-friendly and helpful!',
                    avatar: TESTIMONIAL_IMAGES.mike
                  }
                ].map((testimonial) => (
                  <motion.div
                    key={testimonial.id}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={testimonial.avatar || '/images/default-user.png'}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                        <p className="text-sm text-gray-600">{testimonial.course}</p>
                      </div>
                    </div>
                    <p className="text-gray-600">{testimonial.message}</p>
                    <div className="mt-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Keep only one SmartFeatures section that combines both insights */}
            <div className="mb-12">
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <SmartFeatures
                  itemId="sample-item"
                  category="textbooks"
                />
              </section>
            </div>

            {/* Safety Features */}
            <div className="mb-12">
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <SafetyFeatures
                  itemId="sample-item"
                  sellerId="sample-seller"
                />
              </section>
            </div>

            {/* Join Community Section */}
            <motion.div
              ref={joinRef}
              initial="hidden"
              animate={joinInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="mb-16"
            >
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Your Campus Trading Community</h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Help fellow students save money while reducing waste. Start trading today!
                </p>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r 
                      from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 
                      hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Get Started with Student Email
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* QuickView Modal */}
        {selectedItem && (
          <QuickViewModal
            item={selectedItem}
            onClose={handleCloseQuickView}
            onWishlist={() => handleWishlist(selectedItem.id)}
            onShare={() => handleShare(selectedItem.id)}
            onContact={() => handleContact(selectedItem.id)}
            isWishlisted={wishlistedItems.includes(selectedItem.id)}
          />
        )}
      </div>
    </>
  );
} 