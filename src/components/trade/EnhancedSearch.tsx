import React, { useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, Sparkles, Clock, TrendingUp, X, Trash2 } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';

interface Props {
  onSearch: (query: string) => void;
  onImageSearch?: (file: File) => void;
  showHistory?: boolean;
}

export default function EnhancedSearch({ onSearch, onImageSearch, showHistory = false }: Props) {
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    query,
    setQuery,
    handleSearch,
    handleVoiceSearch,
    showSuggestions,
    setShowSuggestions,
    recentSearches,
    popularSearches,
    removeFromHistory,
    clearHistory,
    isListening
  } = useSearch({ onSearch, onImageSearch });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    // Handle escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [setShowSuggestions]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && query.trim()) {
      handleSearch(query);
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-gray-300 hover:border-gray-400 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for items, textbooks, electronics..."
          className="flex-1 px-4 py-2 outline-none text-gray-700 placeholder-gray-500"
        />

        {query && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setQuery('');
              setShowSuggestions(true);
            }}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVoiceSearch}
          className={`p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors ${isListening ? 'text-red-500' : ''}`}
        >
          <Mic className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (query.trim()) {
              handleSearch(query);
            }
          }}
          className="ml-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Search
        </motion.button>
      </div>

      {/* Search History Window */}
      {showHistory && (
        <AnimatePresence>
          {showSuggestions && (recentSearches.length > 0 || popularSearches.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 divide-y divide-gray-100 z-50"
            >
              {recentSearches.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900">Recent Searches</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={clearHistory}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowSuggestions(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setQuery(search.query);
                          handleSearch(search.query);
                        }}
                        className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{search.query}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(search.query);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {popularSearches.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-medium text-gray-900">Popular Searches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(search.query);
                          handleSearch(search.query);
                        }}
                        className="px-3 py-1.5 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        {search.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
} 