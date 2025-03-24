import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Clock, TrendingUp, X, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedMerchSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  onClearFilters?: () => void;
}

export default function EnhancedMerchSearch({ 
  onSearch, 
  initialQuery = '',
  onClearFilters
}: EnhancedMerchSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchRecentSearches();
    fetchPopularSearches();

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const fetchRecentSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('user_search_history')
        .select('query')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentSearches(data?.map(item => item.query) || []);
    } catch (error) {
      console.error('Error fetching recent searches:', error);
    }
  };

  const fetchPopularSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('popular_searches')
        .select('query, count')
        .order('count', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPopularSearches(data?.map(item => item.query) || []);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      await supabase
        .from('user_search_history')
        .insert({ query: query.trim() });

      await supabase.rpc('increment_search_count', {
        search_query: query.trim()
      });

      setIsFocused(false);
      onSearch(query);
      await fetchRecentSearches(); // Refresh recent searches
    } catch (error) {
      console.error('Error recording search:', error);
    }
  };

  const handleSearchClick = async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsFocused(false);
    
    try {
      await supabase
        .from('user_search_history')
        .insert({ query: searchQuery });

      await supabase.rpc('increment_search_count', {
        search_query: searchQuery
      });

      onSearch(searchQuery);
      await fetchRecentSearches(); // Refresh recent searches
    } catch (error) {
      console.error('Error recording search:', error);
    }
  };

  const removeRecentSearch = async (searchQuery: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from('user_search_history')
        .delete()
        .match({ query: searchQuery });
      
      await fetchRecentSearches();
      toast.success('Search removed from history');
    } catch (error) {
      console.error('Error removing search:', error);
      toast.error('Failed to remove search');
    }
  };

  const clearSearchHistory = async () => {
    try {
      await supabase
        .from('user_search_history')
        .delete()
        .neq('query', '');
      
      setRecentSearches([]);
      toast.success('Search history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    }
  };

  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice search is not supported in your browser');
      return;
    }

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
    } else {
      // Start listening
      const recognition = new (window as any).webkitSpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onSearch(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const handleClearAll = () => {
    setQuery('');
    setIsFocused(false);
    if (onClearFilters) {
      onClearFilters();
    }
    onSearch(''); // This will trigger a search with empty query, showing all products
  };

  return (
    <div className="w-full max-w-2xl mx-auto" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 
          focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
          <Search className="w-5 h-5 text-gray-400 ml-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsFocused(false);
              }
            }}
            placeholder="Search for college merchandise..."
            className="flex-1 py-3 px-4 bg-transparent outline-none text-gray-800 
              placeholder-gray-400"
          />
          
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* Clear All Filters Button */}
          <button
            type="button"
            onClick={handleClearAll}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 
              hover:text-violet-600 tooltip-bottom"
            title="Clear all filters & show all products"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={toggleVoiceSearch}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors
              ${isListening ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {isFocused && (recentSearches.length > 0 || popularSearches.length > 0) && query === '' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg 
                border border-gray-200 divide-y divide-gray-100 z-50"
            >
              {/* Browse All Products Option */}
              <div className="p-3 hover:bg-gray-50 cursor-pointer" onClick={handleClearAll}>
                <div className="flex items-center gap-2 text-violet-600">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Browse All Products</span>
                </div>
              </div>

              {recentSearches.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900">Recent Searches</h3>
                    </div>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        onClick={() => handleSearchClick(search)}
                        className="flex items-center justify-between group px-2 py-1.5 rounded-lg
                          hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{search}</span>
                        </div>
                        <button
                          onClick={(e) => removeRecentSearch(search, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 
                            rounded transition-all"
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
                    <TrendingUp className="w-4 h-4 text-violet-500" />
                    <h3 className="text-sm font-medium text-gray-900">Popular Searches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchClick(search)}
                        className="px-3 py-1.5 text-sm bg-violet-50 hover:bg-violet-100 
                          text-violet-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
} 