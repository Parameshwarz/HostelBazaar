import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Search, Wand2, X, Camera, Filter } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VoiceSearch() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: '',
    condition: '',
  });
  const [section, setSection] = useState<'trade' | 'merch' | 'services'>('trade');
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
  }

  // Handle speech recognition results
  const handleResult = useCallback((event: any) => {
    const transcript = Array.from(event.results)
      .map((result: any) => result[0])
      .map(result => result.transcript)
      .join('');
    
    setTranscript(transcript);

    // Process natural language commands
    const lowercaseTranscript = transcript.toLowerCase();
    if (lowercaseTranscript.includes('under')) {
      const priceMatch = lowercaseTranscript.match(/under (\d+)/);
      if (priceMatch) {
        setFilters(prev => ({ ...prev, maxPrice: priceMatch[1] }));
      }
    }
    if (lowercaseTranscript.includes('category')) {
      const categoryMatch = lowercaseTranscript.match(/category (\w+)/);
      if (categoryMatch) {
        setFilters(prev => ({ ...prev, category: categoryMatch[1] }));
      }
    }
  }, []);

  // Start/stop listening
  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setTranscript('');
    }
    setIsListening(prev => !prev);
  };

  // Update section based on current route
  useEffect(() => {
    if (location.pathname.startsWith('/merch')) {
      setSection('merch');
    } else if (location.pathname.startsWith('/services')) {
      setSection('services');
    } else {
      setSection('trade');
    }
  }, [location]);

  // Get section-specific categories
  const getCategories = () => {
    switch (section) {
      case 'merch':
        return [
          { value: 'clothing', label: 'College Wear' },
          { value: 'accessories', label: 'Accessories' },
          { value: 'stationery', label: 'Stationery' },
          { value: 'memorabilia', label: 'Memorabilia' }
        ];
      case 'services':
        return [
          { value: 'tutoring', label: 'Tutoring' },
          { value: 'projects', label: 'Project Help' },
          { value: 'technical', label: 'Technical Help' },
          { value: 'other', label: 'Other Services' }
        ];
      default: // trade
        return [
          { value: 'electronics', label: 'Electronics' },
          { value: 'books', label: 'Books' },
          { value: 'furniture', label: 'Furniture' },
          { value: 'clothing', label: 'Clothing' }
        ];
    }
  };

  // Get section-specific suggestions
  const getSuggestions = (query: string) => {
    switch (section) {
      case 'merch':
        return [
          `${query} in college wear`,
          `Official ${query}`,
          `New arrival ${query}`,
          `Limited edition ${query}`
        ];
      case 'services':
        return [
          `${query} tutoring`,
          `${query} project help`,
          `Expert ${query}`,
          `${query} consultation`
        ];
      default: // trade
        return [
          `${query} under ₹5000`,
          `Used ${query} in good condition`,
          `${query} with warranty`,
          `${query} near me`
        ];
    }
  };

  // Update suggestions with section-specific ones
  useEffect(() => {
    if (!transcript) {
      setSuggestions([]);
      return;
    }
    setSuggestions(getSuggestions(transcript));
  }, [transcript, section]);

  // Handle search submission with section-specific routing
  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (transcript) searchParams.set('search', transcript);
    if (filters.minPrice) searchParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) searchParams.set('maxPrice', filters.maxPrice);
    if (filters.category) searchParams.set('category', filters.category);
    if (filters.condition) searchParams.set('condition', filters.condition);

    const basePath = section === 'merch' ? '/merch' : section === 'services' ? '/services' : '/trade';
    navigate(`${basePath}?${searchParams.toString()}`);
    setIsModalOpen(false);
    setTranscript('');
    setFilters({
      minPrice: '',
      maxPrice: '',
      category: '',
      condition: '',
    });
  };

  // Set up speech recognition event listeners
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = handleResult;
    recognition.onend = () => setIsListening(false);

    return () => {
      recognition.stop();
    };
  }, [recognition, handleResult]);

  return (
    <>
      {/* Voice Search Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-24 p-4 bg-primary-600 dark:bg-primary-500 text-white 
        rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        <Search className="w-6 h-6" />
      </motion.button>

      {/* Search Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Search</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Section Selector */}
                <div className="flex gap-2">
                  {[
                    { id: 'trade', label: 'Trade Items' },
                    { id: 'merch', label: 'College Merch' },
                    { id: 'services', label: 'Services' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id as 'trade' | 'merch' | 'services')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        section === item.id
                          ? 'bg-primary-600 dark:bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <div className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={`Search ${section === 'merch' ? 'merchandise' : section === 'services' ? 'services' : 'items'} or try voice search...`}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 
                    dark:border-dark-bg-tertiary rounded-lg text-gray-900 dark:text-white placeholder-gray-500 
                    dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleListening}
                      className={`p-2 rounded-full ${
                        isListening 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-300 
                      rounded-full"
                    >
                      <Camera className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Smart Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                      <Wand2 className="w-4 h-4" />
                      <span>Smart Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTranscript(suggestion)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-dark-bg-tertiary text-gray-700 
                          dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 
                          dark:hover:bg-dark-bg-tertiary/80 transition-colors"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {section !== 'services' && (
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Price Range
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg-tertiary border 
                            border-gray-200 dark:border-dark-bg-tertiary rounded-lg text-gray-900 
                            dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                            focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg-tertiary border 
                            border-gray-200 dark:border-dark-bg-tertiary rounded-lg text-gray-900 
                            dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                            focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg-tertiary border 
                        border-gray-200 dark:border-dark-bg-tertiary rounded-lg text-gray-900 
                        dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="">All Categories</option>
                        {getCategories().map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  className="w-full mt-6 px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white 
                  rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors 
                  font-medium flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search {section === 'merch' ? 'Merchandise' : section === 'services' ? 'Services' : 'Items'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 