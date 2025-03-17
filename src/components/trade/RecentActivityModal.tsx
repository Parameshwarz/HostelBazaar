import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, MessageCircle, Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'view' | 'like' | 'message' | 'purchase' | 'review';
  user: {
    name: string;
    avatar?: string;
  };
  item: {
    id: string;
    title: string;
    price: number;
    image: string;
  };
  timestamp: Date;
  rating?: number;
  message?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
}

export default function RecentActivityModal({ isOpen, onClose, activities }: Props) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'purchase':
        return <ShoppingBag className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'view':
        return 'text-blue-500 bg-blue-100';
      case 'like':
        return 'text-pink-500 bg-pink-100';
      case 'message':
        return 'text-purple-500 bg-purple-100';
      case 'purchase':
        return 'text-green-500 bg-green-100';
      case 'review':
        return 'text-amber-500 bg-amber-100';
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'view':
        return 'viewed';
      case 'like':
        return 'liked';
      case 'message':
        return 'messaged about';
      case 'purchase':
        return 'purchased';
      case 'review':
        return 'reviewed';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Activity
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        {activity.user.avatar ? (
                          <img
                            src={activity.user.avatar}
                            alt={activity.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {activity.user.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {activity.user.name}
                          </span>
                          <div className={`p-1 rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <span className="text-gray-500">
                            {getActivityText(activity)}
                          </span>
                        </div>

                        {/* Item Preview */}
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                          <img
                            src={activity.item.image}
                            alt={activity.item.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {activity.item.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              ₹{activity.item.price}
                            </div>
                          </div>
                        </div>

                        {/* Additional Details */}
                        {activity.type === 'review' && activity.rating && (
                          <div className="mt-2 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < activity.rating!
                                    ? 'text-amber-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            {activity.message && (
                              <span className="ml-2 text-sm text-gray-600">
                                {activity.message}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="mt-1 text-sm text-gray-500">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {activities.length === 0 && (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                    <p className="text-gray-500">
                      Activity will appear here as users interact with items
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 