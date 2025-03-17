import { useState, useEffect, useCallback } from 'react';

interface Filters {
  categories: string[];
  subcategories: string[];
  conditions: string[];
  minPrice?: number;
  maxPrice?: number;
  search: string;
  sortBy: 'price_asc' | 'price_desc' | 'created_at_desc' | 'relevance';
  showWishlisted: boolean;
}

const STORAGE_KEY = 'browse_filters';

export function useFilterPersistence(initialFilters: Filters) {
  const [filters, setFilters] = useState<Filters>(() => {
    const savedFilters = localStorage.getItem(STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        // Validate the stored filters
        if (typeof parsed === 'object' && parsed !== null) {
          return {
            ...initialFilters,
            ...parsed,
            // Ensure arrays are always arrays
            categories: Array.isArray(parsed.categories) ? parsed.categories : [],
            subcategories: Array.isArray(parsed.subcategories) ? parsed.subcategories : [],
            conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
          };
        }
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }
    return initialFilters;
  });

  // Persist filters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (e) {
      console.error('Error saving filters:', e);
    }
  }, [filters]);

  // Enhanced setFilters with validation
  const setValidatedFilters = useCallback((newFilters: Filters | ((prev: Filters) => Filters)) => {
    setFilters(prev => {
      const next = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
      return {
        ...next,
        // Ensure arrays are always arrays
        categories: Array.isArray(next.categories) ? next.categories : [],
        subcategories: Array.isArray(next.subcategories) ? next.subcategories : [],
        conditions: Array.isArray(next.conditions) ? next.conditions : [],
      };
    });
  }, []);

  // Enhanced clear filters
  const clearFilters = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    setFilters: setValidatedFilters,
    clearFilters
  };
} 