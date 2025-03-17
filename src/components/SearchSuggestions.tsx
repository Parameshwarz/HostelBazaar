import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, X, Search } from 'lucide-react';
import { SearchHistoryItem } from '../hooks/useSearchHistory';

interface Props {
  isVisible: boolean;
  recentSearches: SearchHistoryItem[];
  popularSearches: SearchHistoryItem[];
  onSelectSuggestion: (query: string) => void;
  onRemoveFromHistory: (query: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export default function SearchSuggestions({
  isVisible,
  recentSearches,
  popularSearches,
  onSelectSuggestion,
  onRemoveFromHistory,
  onClearHistory,
  onClose
}: Props) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-[200]"
        style={{ maxHeight: '400px', overflowY: 'auto' }}
      >
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Recent Searches</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
                <button
                  onClick={onClose}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {recentSearches.map(item => (
                <div
                  key={item.query}
                  className="flex items-center justify-between group"
                >
                  <button
                    onClick={() => onSelectSuggestion(item.query)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{item.query}</span>
                  </button>
                  <button
                    onClick={() => onRemoveFromHistory(item.query)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches */}
        {popularSearches.length > 0 && (
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Popular Searches</span>
            </div>
            <div className="space-y-2">
              {popularSearches.map(item => (
                <button
                  key={item.query}
                  onClick={() => onSelectSuggestion(item.query)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-full text-left"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{item.query}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
} 