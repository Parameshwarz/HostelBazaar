import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, History, Star, X, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  trend: number;
  section?: 'trade' | 'merch' | 'services';
}

interface Recommendation {
  id: string;
  title: string;
  image: string;
  price?: number;
  category: string;
  rating: number;
  section?: 'trade' | 'merch' | 'services';
}

export default function SmartRecommendations() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'trending' | 'personal' | 'history'>('trending');
  const [section, setSection] = useState<'trade' | 'merch' | 'services'>('trade');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Update section based on current route
  useEffect(() => {
    if (location.pathname === '/') {
      setSection('trade'); // Default to trade, but we'll show all sections
    } else if (location.pathname.startsWith('/merch')) {
      setSection('merch');
    } else if (location.pathname.startsWith('/services')) {
      setSection('services');
    } else {
      setSection('trade');
    }
  }, [location]);

  // Get all categories for homepage
  const getAllCategories = () => {
    return [
      { id: '1', name: 'Electronics', icon: '💻', count: 150, trend: 15, section: 'trade' },
      { id: '2', name: 'College Wear', icon: '👕', count: 120, trend: 20, section: 'merch' },
      { id: '3', name: 'Tutoring', icon: '📚', count: 75, trend: 25, section: 'services' },
      { id: '4', name: 'Books', icon: '📚', count: 200, trend: 8, section: 'trade' }
    ];
  };

  // Get all recommendations for homepage
  const getAllRecommendations = () => {
    return [
      {
        id: '1',
        title: 'MacBook Pro',
        image: 'https://picsum.photos/204',
        price: 45000,
        category: 'Electronics',
        rating: 4.8,
        section: 'trade'
      },
      {
        id: '2',
        title: 'College Hoodie',
        image: 'https://picsum.photos/200',
        price: 1200,
        category: 'College Wear',
        rating: 4.9,
        section: 'merch'
      },
      {
        id: '3',
        title: 'Python Programming',
        image: 'https://picsum.photos/202',
        price: 500,
        category: 'Tutoring',
        rating: 4.8,
        section: 'services'
      },
      {
        id: '4',
        title: 'Physics Textbook',
        image: 'https://picsum.photos/205',
        price: 800,
        category: 'Books',
        rating: 4.5,
        section: 'trade'
      }
    ];
  };

  // Get categories based on current page
  const getDisplayCategories = () => {
    if (location.pathname === '/') {
      return getAllCategories();
    }
    return getCategories();
  };

  // Get recommendations based on current page
  const getDisplayRecommendations = () => {
    if (location.pathname === '/') {
      return getAllRecommendations();
    }
    return getRecommendations();
  };

  // Get section-specific categories
  const getCategories = () => {
    switch (section) {
      case 'merch':
        return [
          { id: '1', name: 'College Wear', icon: '👕', count: 120, trend: 15 },
          { id: '2', name: 'Accessories', icon: '🎒', count: 85, trend: 10 },
          { id: '3', name: 'Stationery', icon: '📚', count: 200, trend: 8 },
          { id: '4', name: 'Memorabilia', icon: '🎓', count: 50, trend: 20 }
        ];
      case 'services':
        return [
          { id: '1', name: 'Tutoring', icon: '📚', count: 75, trend: 25 },
          { id: '2', name: 'Project Help', icon: '💻', count: 90, trend: 15 },
          { id: '3', name: 'Technical', icon: '⚙️', count: 60, trend: 12 },
          { id: '4', name: 'Other', icon: '🔧', count: 40, trend: 5 }
        ];
      default: // trade
        return [
          { id: '1', name: 'Electronics', icon: '💻', count: 150, trend: 15 },
          { id: '2', name: 'Books', icon: '📚', count: 200, trend: 8 },
          { id: '3', name: 'Furniture', icon: '🪑', count: 80, trend: 5 },
          { id: '4', name: 'Clothing', icon: '👕', count: 120, trend: 12 }
        ];
    }
  };

  // Get section-specific recommendations
  const getRecommendations = () => {
    switch (section) {
      case 'merch':
        return [
          {
            id: '1',
            title: 'College Hoodie',
            image: 'https://picsum.photos/200',
            price: 1200,
            category: 'College Wear',
            rating: 4.9
          },
          {
            id: '2',
            title: 'Premium Backpack',
            image: 'https://picsum.photos/201',
            price: 2500,
            category: 'Accessories',
            rating: 4.7
          }
        ];
      case 'services':
        return [
          {
            id: '1',
            title: 'Python Programming',
            image: 'https://picsum.photos/202',
            price: 500,
            category: 'Tutoring',
            rating: 4.8
          },
          {
            id: '2',
            title: 'Web Development',
            image: 'https://picsum.photos/203',
            price: 1000,
            category: 'Technical',
            rating: 4.6
          }
        ];
      default: // trade
        return [
          {
            id: '1',
            title: 'MacBook Pro',
            image: 'https://picsum.photos/204',
            price: 45000,
            category: 'Electronics',
            rating: 4.8
          },
          {
            id: '2',
            title: 'Physics Textbook',
            image: 'https://picsum.photos/205',
            price: 800,
            category: 'Books',
            rating: 4.5
          }
        ];
    }
  };

  return (
    <>
      {/* Recommendations Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-[168px] p-4 bg-primary-600 dark:bg-primary-500 text-white 
        rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Recommendations Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-xl w-full max-w-2xl 
              overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-dark-bg-tertiary">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    {location.pathname === '/' 
                      ? 'Smart Recommendations'
                      : section === 'merch' 
                        ? 'Merchandise Recommendations' 
                        : section === 'services' 
                          ? 'Service Recommendations' 
                          : 'Trade Recommendations'}
                  </h2>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                  {[
                    { id: 'trending', label: 'Trending', icon: TrendingUp },
                    { id: 'personal', label: 'For You', icon: Star },
                    { id: 'history', label: 'History', icon: History }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'trending' | 'personal' | 'history')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-600 dark:bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Trending Categories */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {getDisplayCategories().map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate(`/${category.section || section}?category=${category.name.toLowerCase()}`);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-bg-tertiary 
                      rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary/80 transition-colors"
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {category.count} {(category.section || section) === 'services' ? 'providers' : 'items'}
                          </span>
                          {category.trend > 0 && (
                            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                              {category.trend}%
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  ))}
                </div>

                {/* Recommended Items */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Recommended for You
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {getDisplayRecommendations().map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          navigate(`/${item.section || section}/${item.id}`);
                          setIsOpen(false);
                        }}
                        className="flex gap-3 p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl 
                        hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary/80 transition-colors"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.title}
                          </h4>
                          {item.price && (
                            <p className="text-primary-600 dark:text-primary-400 text-sm mt-1">
                              ₹{item.price}{(item.section || section) === 'services' && '/hr'}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-current text-yellow-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {item.rating}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 