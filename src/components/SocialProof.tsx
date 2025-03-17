import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, Clock, DollarSign, Heart, MessageCircle, ShoppingBag, Star, ThumbsUp, Users, BellOff, Bell } from 'lucide-react';

// Types for our notifications
type NotificationType = 'purchase' | 'review' | 'like' | 'message' | 'join' | 'trade';

interface Notification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timeAgo: string;
  item?: {
    name: string;
    price?: number;
    image?: string;
  };
}

// Simple one-time animation
const notificationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function SocialProof() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [showNotifications, setShowNotifications] = useState(true);

  // Sample notifications - replace with real data from your backend
  const sampleNotifications: Notification[] = [
    {
      id: '1',
      type: 'purchase',
      user: {
        name: 'Rahul M.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul'
      },
      content: 'just purchased',
      timeAgo: '2 minutes ago',
      item: {
        name: 'MacBook Pro',
        price: 45000,
        image: 'https://picsum.photos/100/100'
      }
    },
    {
      id: '2',
      type: 'review',
      user: {
        name: 'Priya S.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
      },
      content: 'gave 5 stars to',
      timeAgo: '5 minutes ago',
      item: {
        name: 'Physics Textbook',
        image: 'https://picsum.photos/100/100'
      }
    },
    {
      id: '3',
      type: 'trade',
      user: {
        name: 'Arun K.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun'
      },
      content: 'successfully traded',
      timeAgo: '10 minutes ago',
      item: {
        name: 'Scientific Calculator',
        price: 1200,
        image: 'https://picsum.photos/100/100'
      }
    }
  ];

  // Function to get icon based on notification type
  const getIcon = (type: NotificationType | undefined) => {
    if (!type) return null;
    
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-3 h-3 mr-1" />;
      case 'review':
        return <Star className="w-3 h-3 mr-1" />;
      case 'like':
        return <Heart className="w-3 h-3 mr-1" />;
      case 'message':
        return <MessageCircle className="w-3 h-3 mr-1" />;
      case 'join':
        return <Users className="w-3 h-3 mr-1" />;
      case 'trade':
        return <Activity className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  // Simulate real-time notifications
  useEffect(() => {
    if (!showNotifications) {
      setCurrentNotification(null);
      return;
    }

    let currentIndex = 0;
    
    const showNextNotification = () => {
      const nextNotification = sampleNotifications[currentIndex];
      setCurrentNotification(nextNotification);
      currentIndex = (currentIndex + 1) % sampleNotifications.length;
    };

    // Show first notification immediately
    showNextNotification();

    // Show new notification every 5 seconds
    const interval = setInterval(showNextNotification, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [showNotifications]);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setShowNotifications(!showNotifications)}
        className="fixed bottom-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 z-50 hover:bg-white/95 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showNotifications ? (
          <BellOff className="w-5 h-5 text-gray-600" />
        ) : (
          <Bell className="w-5 h-5 text-gray-600" />
        )}
      </motion.button>

      {/* Notifications */}
      <AnimatePresence mode="wait">
        {showNotifications && currentNotification && (
          <motion.div
            key={currentNotification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 max-w-sm bg-white/90 backdrop-blur-sm 
            rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden z-50"
          >
            <div className="p-4 flex items-center gap-3">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={currentNotification.user.avatar}
                  alt={currentNotification.user.name}
                  className="w-10 h-10 rounded-full border-2 border-purple-100"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold text-purple-700">{currentNotification.user.name}</span>
                  {' '}{currentNotification.content}{' '}
                  {currentNotification.item && (
                    <span className="font-medium text-gray-900">{currentNotification.item.name}</span>
                  )}
                  {currentNotification.item?.price && (
                    <span className="font-semibold text-purple-600">
                      {' '}for ₹{currentNotification.item.price}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {currentNotification.timeAgo}
                  </div>
                  <div className={`flex items-center text-xs ${
                    currentNotification.type === 'purchase' 
                      ? 'text-purple-600' 
                      : 'text-purple-600'
                  }`}>
                    {getIcon(currentNotification.type)}
                    <CheckCircle2 className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 