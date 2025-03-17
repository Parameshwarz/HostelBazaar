import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Clock, 
  Award, 
  CheckCircle, 
  DollarSign, 
  Calendar,
  MessageSquare,
  FileText,
  Briefcase,
  ChevronRight,
  Share2,
  Heart,
  Shield,
  Users,
  Zap,
  TrendingUp,
  ThumbsUp,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  BarChart,
  Target,
  Repeat,
  Gift,
  Video,
  Image as ImageIcon,
  Play,
  Pause,
  X,
  ChevronLeft,
  ChevronDown,
  Info
} from 'lucide-react';
import { supabase } from "../lib/supabaseClient";
import { Service, ServiceLevel, ServiceReview } from '../types/services';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

interface ExtendedService extends Service {
  images?: string[];
  features?: string[];
  active_orders?: number;
  provider?: {
    id: string;
    username: string;
    avatar_url?: string;
    is_verified?: boolean;
    bio?: string;
    rating?: number;
    total_orders?: number;
    member_since?: string;
    languages?: string[];
    skills?: string[];
    portfolio?: {
      title: string;
      image: string;
      description: string;
    }[];
    availability?: {
      status: 'available' | 'busy' | 'away';
      next_available?: string;
    };
  };
  analytics?: {
    views: number;
    conversion_rate: number;
    avg_response_time: string;
    completion_rate: number;
  };
  similar_services?: {
    id: string;
    title: string;
    image: string;
    price: number;
    rating: number;
  }[];
}

// One-time animation variants
const reviewVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ratingBarVariants = {
  hidden: { width: 0 },
  visible: (width: number) => ({
    width: `${width}%`,
    transition: { duration: 0.5 }
  })
};

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [service, setService] = useState<ExtendedService | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ServiceLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'portfolio'>('overview');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
    if (user) {
      checkWishlistStatus();
    }
  }, [id, user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories!services_category_id_fkey (
            id,
            name,
            slug
          ),
          service_levels (*),
          provider:profiles!services_provider_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform the data to match our ExtendedService interface
      const transformedData: ExtendedService = {
        ...data,
        images: [], // Fallback empty array for now
        features: data.skills || [], // Use skills array as features
        active_orders: 0, // Fallback value
        provider: {
          ...data.provider,
          bio: 'Service provider', // Fallback bio
          rating: data.rating || 4.5, // Use service rating or fallback
          total_orders: data.total_orders || 0, // Use service total_orders or fallback
          member_since: data.created_at, // Use service creation date
          is_verified: false // Default to false
        }
      };

      setService(transformedData);
      setSelectedLevel(transformedData.service_levels?.[0] || null);
    } catch (error) {
      console.error('Error fetching service details:', error);
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      // Since wishlist table doesn't exist yet, always return false
      setIsWishlisted(false);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    toast.error('Wishlist feature coming soon!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service?.title,
          text: service?.short_description,
          url: window.location.href,
        });
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/50 rounded-lg w-1/4 backdrop-blur-sm" />
            <div className="aspect-video bg-white/50 rounded-lg backdrop-blur-sm" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-white/50 rounded-lg w-3/4 backdrop-blur-sm" />
                <div className="h-4 bg-white/50 rounded-lg w-1/2 backdrop-blur-sm" />
              </div>
              <div className="h-64 bg-white/50 rounded-lg backdrop-blur-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900">Service not found</h2>
            <p className="mt-2 text-gray-600">The service you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/services')}
              className="mt-4 inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 hover:scale-105"
            >
              Back to Services
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: isScrolled ? 0 : -100 }}
        className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-md z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 truncate max-w-xl">
              {service?.title}
            </h2>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleWishlist}
                className={`p-2 rounded-full ${
                  isWishlisted 
                    ? 'bg-pink-100 text-pink-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                } transition-all duration-200`}
              >
                <Heart className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </motion.button>
              {selectedLevel && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    // Handle order creation
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium
                    shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-300"
                >
                  Order Now (₹{selectedLevel.price})
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">{service.category?.name}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-700 font-medium">{service.title}</span>
          </div>
          <div className="flex items-start justify-between">
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {service.title}
            </h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleWishlist}
              className={`p-3 rounded-full ${
                isWishlisted 
                  ? 'bg-pink-50 text-pink-600 shadow-lg shadow-pink-100' 
                  : 'bg-white text-gray-400 hover:text-pink-600 hover:bg-pink-50 shadow-lg hover:shadow-pink-100'
              } transition-all duration-300`}
            >
              <Heart className="h-6 w-6" fill={isWishlisted ? 'currentColor' : 'none'} />
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4">
              <div className="flex items-center gap-8 border-b">
                {(['overview', 'reviews', 'portfolio'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === tab
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-4 gap-4"
                >
                  {[
                    { icon: Award, label: 'Experience', value: service.experience_level || 'Professional' },
                    { icon: TrendingUp, label: 'Success Rate', value: '98%' },
                    { icon: ThumbsUp, label: 'Satisfaction', value: '4.9/5' },
                    { icon: Zap, label: 'Quick Delivery', value: '95%' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <stat.icon className="h-6 w-6 text-indigo-600 mb-2" />
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="font-semibold text-gray-900">{stat.value}</p>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
                >
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Service</h2>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{service.description}</p>
                </motion.div>

                {service.features && service.features.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
                  >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">What You'll Get</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {service.features.map((feature, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-indigo-600" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-start gap-8">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0"
                    >
                      {service.provider?.avatar_url ? (
                        <img
                          src={service.provider.avatar_url}
                          alt={service.provider.username}
                          className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-lg">
                          <span className="text-3xl font-medium bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {service.provider?.username ? service.provider.username[0].toUpperCase() : 'U'}
                          </span>
                        </div>
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {service.provider?.username || 'Anonymous Provider'}
                        </h3>
                        {service.provider?.is_verified && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="p-1 bg-blue-100 rounded-full"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-gray-600 mt-2">{service.provider?.bio || 'Service provider'}</p>
                      <div className="grid grid-cols-3 gap-6 mt-6">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Member since</p>
                          <p className="font-semibold text-gray-900">
                            {service.provider?.member_since ? 
                              new Date(service.provider.member_since).getFullYear() : 
                              new Date(service.created_at).getFullYear()}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Total orders</p>
                          <p className="font-semibold text-gray-900">
                            {service.provider?.total_orders || service.total_orders || 0}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Rating</p>
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <span className="font-semibold text-gray-900">
                              {(service.provider?.rating || service.rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {service.reviews && service.reviews.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
                  >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      Reviews 
                      <span className="text-sm font-normal text-gray-500">({service.reviews.length})</span>
                    </h2>
                    <div className="space-y-6">
                      {service.reviews.map((review, index) => (
                        <motion.div 
                          key={review.id}
                          variants={reviewVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: index * 0.1 }}
                          className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm"
                        >
                          <div className="flex items-start gap-4">
                            {review.reviewer?.avatar_url ? (
                              <img
                                src={review.reviewer.avatar_url}
                                alt={review.reviewer.username}
                                className="w-12 h-12 rounded-xl object-cover shadow-md"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-md">
                                <span className="text-xl font-medium bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                  {review.reviewer?.username ? review.reviewer.username[0].toUpperCase() : 'U'}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900">{review.reviewer?.username || 'Anonymous'}</p>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center mt-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-600">{review.comment}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {activeTab === 'reviews' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8"
              >
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-900">Rating Summary</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold text-gray-900">
                        {service.rating?.toFixed(1) || '0.0'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(service.rating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">
                          Based on {service.total_reviews || 0} reviews
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-8">{rating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            variants={ratingBarVariants}
                            initial="hidden"
                            animate="visible"
                            custom={(service.reviews?.filter(r => r.rating === rating).length || 0) / (service.total_reviews || 1) * 100}
                            className="h-full bg-yellow-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {service.reviews?.map((review, index) => (
                    <motion.div 
                      key={review.id}
                      variants={reviewVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        {review.reviewer?.avatar_url ? (
                          <img
                            src={review.reviewer.avatar_url}
                            alt={review.reviewer.username}
                            className="w-12 h-12 rounded-xl object-cover shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-md">
                            <span className="text-xl font-medium bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {review.reviewer?.username ? review.reviewer.username[0].toUpperCase() : 'U'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{review.reviewer?.username || 'Anonymous'}</p>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'portfolio' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Interactive Preview</h3>
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowVideoPreview(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl"
                      >
                        <Video className="h-5 w-5" />
                        Watch Demo
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-xl"
                      >
                        <ImageIcon className="h-5 w-5" />
                        View Gallery
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <img
                      src={service.images?.[currentImageIndex] || 'https://source.unsplash.com/random/1200x800'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                            >
                              <ChevronLeft className="h-5 w-5 text-white" />
                            </button>
                            <button
                              onClick={() => setCurrentImageIndex(prev => Math.min((service.images?.length || 1) - 1, prev + 1))}
                              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                            >
                              <ChevronRight className="h-5 w-5 text-white" />
                            </button>
                          </div>
                          <span className="text-white/80 text-sm">
                            {currentImageIndex + 1} / {service.images?.length || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Provider Portfolio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {service.provider?.portfolio?.map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="group relative rounded-xl overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h4 className="text-white font-medium mb-2">{item.title}</h4>
                            <p className="text-white/80 text-sm">{item.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Service Analytics</h3>
                    <button
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { 
                        icon: Users, 
                        label: 'Total Views',
                        value: service.analytics?.views || 0,
                        color: 'text-blue-600',
                        bg: 'bg-blue-100'
                      },
                      {
                        icon: Target,
                        label: 'Conversion Rate',
                        value: `${service.analytics?.conversion_rate || 0}%`,
                        color: 'text-green-600',
                        bg: 'bg-green-100'
                      },
                      {
                        icon: Clock,
                        label: 'Avg. Response',
                        value: service.analytics?.avg_response_time || '2h',
                        color: 'text-purple-600',
                        bg: 'bg-purple-100'
                      },
                      {
                        icon: CheckCircle,
                        label: 'Completion Rate',
                        value: `${service.analytics?.completion_rate || 0}%`,
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-100'
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-md"
                      >
                        <div className={`p-3 ${stat.bg} rounded-xl w-fit mb-4`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8"
                >
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Similar Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {service.similar_services?.map((similar, index) => (
                      <motion.div
                        key={similar.id}
                        whileHover={{ scale: 1.05 }}
                        className="group relative rounded-xl overflow-hidden shadow-md"
                      >
                        <img
                          src={similar.image}
                          alt={similar.title}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h4 className="text-white font-medium mb-2 line-clamp-2">{similar.title}</h4>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-white text-sm">{similar.rating}</span>
                              </div>
                              <span className="text-white font-medium">₹{similar.price}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 space-y-6"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                    <Users className="h-5 w-5 text-indigo-600 mb-2" />
                    <p className="text-sm text-gray-500">Active Orders</p>
                    <p className="font-semibold text-gray-900">{service.active_orders || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                    <Clock className="h-5 w-5 text-indigo-600 mb-2" />
                    <p className="text-sm text-gray-500">Avg. Response</p>
                    <p className="font-semibold text-gray-900">2 hours</p>
                  </div>
                </div>

                {service.service_levels && service.service_levels.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      {service.service_levels.map((level) => (
                        <motion.button
                          key={level.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedLevel(level)}
                          className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300
                            ${selectedLevel?.name === level.name
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {level.name}
                        </motion.button>
                      ))}
                    </div>

                    {selectedLevel && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Price</span>
                          <span className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ₹{selectedLevel.price}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Delivery Time</span>
                          <span className="text-gray-900 font-medium">{selectedLevel.delivery_time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Revisions</span>
                          <span className="text-gray-900 font-medium">{selectedLevel.revisions}</span>
                        </div>
                        <div className="space-y-3">
                          {selectedLevel.features.map((feature, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-3 text-sm"
                            >
                              <div className="p-1 bg-green-100 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="text-gray-600">{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (!user) {
                              navigate('/login');
                              return;
                            }
                            // Handle order creation
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium
                            shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-300
                            flex items-center justify-center gap-2"
                        >
                          Continue (₹{selectedLevel.price})
                          <ChevronRight className="h-5 w-5" />
                        </motion.button>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Shield className="h-4 w-4" />
                          <span>Money Back Guarantee</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }

                      try {
                        // Check if chat already exists
                        const { data: existingChat, error: chatError } = await supabase
                          .from('chats')
                          .select('id')
                          .or(`and(participant_1.eq.${user.id},participant_2.eq.${service.provider?.id}),and(participant_1.eq.${service.provider?.id},participant_2.eq.${user.id})`)
                          .single();

                        if (chatError && chatError.code !== 'PGRST116') {
                          throw chatError;
                        }

                        if (existingChat) {
                          // Chat exists, navigate to it
                          navigate(`/messages/${existingChat.id}`);
                        } else {
                          // Create new chat
                          const { data: newChat, error: createError } = await supabase
                            .from('chats')
                            .insert({
                              participant_1: user.id,
                              participant_2: service.provider?.id,
                              service_id: service.id,
                              last_message: `Chat started about: ${service.title}`,
                              last_message_at: new Date().toISOString()
                            })
                            .select()
                            .single();

                          if (createError) throw createError;

                          navigate(`/messages/${newChat.id}`);
                        }
                      } catch (error) {
                        console.error('Error initializing chat:', error);
                        toast.error('Failed to start chat');
                      }
                    }}
                    className="w-full px-6 py-3 border border-gray-200 text-gray-700 rounded-xl
                      font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300
                      flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Contact Provider
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Share this service</h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { icon: 'facebook', color: 'bg-blue-500' },
                { icon: 'twitter', color: 'bg-sky-500' },
                { icon: 'linkedin', color: 'bg-blue-700' },
                { icon: 'whatsapp', color: 'bg-green-500' }
              ].map((platform) => (
                <motion.button
                  key={platform.icon}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`${platform.color} text-white p-3 rounded-xl`}
                >
                  <span className="sr-only">{platform.icon}</span>
                  <i className={`fab fa-${platform.icon} text-lg`}></i>
                </motion.button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-600"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyLink}
                className="px-3 py-1 bg-white rounded-md text-sm font-medium shadow-sm hover:shadow"
              >
                Copy
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showImageModal && selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selectedImage}
            alt="Portfolio"
            className="max-w-full max-h-[90vh] rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </motion.div>
      )}

      {showVideoPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowVideoPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-4xl mx-4 aspect-video rounded-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <video
              src="https://example.com/demo.mp4"
              className="w-full h-full object-cover"
              controls
              autoPlay
            />
            <button
              onClick={() => setShowVideoPreview(false)}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </motion.div>
        </motion.div>
      )}

      {showBookingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowBookingModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Schedule Your Service</h3>
            
            {/* Calendar Section */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Select Date</h4>
              <div className="grid grid-cols-7 gap-2">
                {/* Calendar implementation here */}
              </div>
            </div>

            {/* Time Slots */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Select Time</h4>
              <div className="grid grid-cols-4 gap-3">
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                  <motion.button
                    key={time}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${selectedTime === time
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {time}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-indigo-600" />
                  <span className="text-gray-700">Add as a gift</span>
                </div>
                <input type="checkbox" className="rounded text-indigo-600" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <Repeat className="h-5 w-5 text-indigo-600" />
                  <span className="text-gray-700">Make it recurring</span>
                </div>
                <select className="rounded-lg border-gray-200 text-sm">
                  <option>One-time</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl
                  shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-300"
              >
                Confirm Booking
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 