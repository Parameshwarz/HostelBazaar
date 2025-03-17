import { useState, useCallback, useEffect } from 'react';
import { useVoiceSearch } from './useVoiceSearch';
import { useSearchHistory, SearchHistoryItem } from './useSearchHistory';
import { toast } from 'react-hot-toast';

interface UseSearchProps {
  onSearch: (query: string) => void;
  onImageSearch?: (file: File) => void;
  defaultValue?: string;
}

export function useSearch({ onSearch, onImageSearch, defaultValue = '' }: UseSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchHistoryItem[]>([]);

  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceSearch();

  const {
    addToHistory,
    removeFromHistory,
    clearHistory,
    getPopularSearches,
    getRecentSearches
  } = useSearchHistory();

  // Update search history when it changes
  useEffect(() => {
    const updateSearches = () => {
      setRecentSearches(getRecentSearches());
      setPopularSearches(getPopularSearches());
    };
    updateSearches();
  }, [getRecentSearches, getPopularSearches]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
      if (!isListening) {
        handleSearch(transcript);
      }
    }
  }, [transcript, isListening]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add to recent searches first
      await addToHistory(searchQuery.trim());
      
      // Update search history immediately after adding
      setRecentSearches(getRecentSearches());
      setPopularSearches(getPopularSearches());

      // Then perform the search
      await onSearch(searchQuery.trim());
      setShowSuggestions(false);
    } catch (err) {
      setError('Search failed. Please try again.');
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, addToHistory, getRecentSearches, getPopularSearches]);

  // Add a new effect to update search history when component mounts
  useEffect(() => {
    const updateSearchHistory = async () => {
      setRecentSearches(getRecentSearches());
      setPopularSearches(getPopularSearches());
    };
    updateSearchHistory();
  }, [getRecentSearches, getPopularSearches]);

  const handleImageUpload = async (file: File) => {
    if (!onImageSearch) return;

    try {
      setIsLoading(true);
      setError(null);
      await onImageSearch(file);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      toast.error('Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSearch = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleRemoveFromHistory = useCallback(async (searchQuery: string) => {
    await removeFromHistory(searchQuery);
    setRecentSearches(getRecentSearches());
    setPopularSearches(getPopularSearches());
  }, [removeFromHistory, getRecentSearches, getPopularSearches]);

  const handleClearHistory = useCallback(async () => {
    await clearHistory();
    setRecentSearches([]);
    setPopularSearches([]);
  }, [clearHistory]);

  return {
    query,
    setQuery,
    isLoading,
    error,
    isListening,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    handleVoiceSearch,
    handleImageUpload,
    recentSearches,
    popularSearches,
    removeFromHistory: handleRemoveFromHistory,
    clearHistory: handleClearHistory
  };
} 