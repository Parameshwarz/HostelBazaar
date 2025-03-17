import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Brain, Target, TrendingUp } from 'lucide-react';
import ItemCard from '../ItemCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
}

export default function AIRecommendationsModal({ isOpen, onClose, items }: Props) {
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
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Smart Recommendations
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
                {/* AI Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Brain className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h3 className="font-medium text-indigo-900">Based on Your Activity</h3>
                    </div>
                    <p className="text-sm text-indigo-700">
                      Recommendations based on your browsing history and interactions.
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-medium text-purple-900">Campus Trends</h3>
                    </div>
                    <p className="text-sm text-purple-700">
                      Popular items among students in your campus.
                    </p>
                  </div>

                  <div className="bg-rose-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-rose-600" />
                      </div>
                      <h3 className="font-medium text-rose-900">Price Insights</h3>
                    </div>
                    <p className="text-sm text-rose-700">
                      Items with the best value for money right now.
                    </p>
                  </div>
                </div>

                {/* Recommended Items */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Recommended for You</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>

                {/* Value Propositions */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Smart Matching</div>
                      <p className="text-sm text-gray-500">
                        AI-powered recommendations based on your preferences
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Real-time Updates</div>
                      <p className="text-sm text-gray-500">
                        Get notified when relevant items are posted
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Price Analysis</div>
                      <p className="text-sm text-gray-500">
                        Compare prices with similar items
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 