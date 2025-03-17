import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { supabase } from '../lib/supabaseClient';
import { Item } from '../types';

// Common typos and variations mapping
const COMMON_VARIATIONS: Record<string, string[]> = {
  'laptop': ['laptops', 'laptp', 'lapto', 'laptap', 'leptop'],
  'phone': ['phones', 'fone', 'phon', 'phne'],
  'book': ['books', 'buk', 'bok'],
  'charger': ['chargers', 'chrger', 'chargar'],
  'headphone': ['headphones', 'headfone', 'headphon', 'hedphone'],
  // Add more common variations as needed
};

// Configurable search options with more lenient settings
const FUSE_OPTIONS = {
  keys: [
    { name: 'title', weight: 1 },
    { name: 'description', weight: 0.7 },
    { name: 'category.name', weight: 0.5 },
    { name: 'subcategory.name', weight: 0.5 },
    { name: 'condition', weight: 0.3 }
  ],
  threshold: 0.6, // Increased threshold for more lenient matching
  distance: 200, // Increased distance for better fuzzy matching
  minMatchCharLength: 2,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: true, // Ignore where the match occurs in the string
  findAllMatches: true, // Find all possible matches
};

const PRICE_REGEX = /under\s*₹?(\d+)/i;
const CONDITION_REGEX = /(new|used|like new)/i;

// Helper function to normalize and expand search terms
const expandSearchTerms = (query: string): string[] => {
  const terms = query.toLowerCase().split(/\s+/);
  const expanded = new Set<string>();

  terms.forEach(term => {
    expanded.add(term);
    // Add common variations
    Object.entries(COMMON_VARIATIONS).forEach(([word, variations]) => {
      if (term === word || variations.includes(term)) {
        expanded.add(word);
        variations.forEach(v => expanded.add(v));
      }
      
      // Check for partial matches (e.g., "lap" should match "laptop")
      if (word.startsWith(term) || variations.some(v => v.startsWith(term))) {
        expanded.add(word);
        variations.forEach(v => expanded.add(v));
      }
    });
  });

  return Array.from(expanded);
};

export const useFuzzySearch = (searchTerm: string) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Fuse instance with items
  const fuse = useMemo(() => {
    return new Fuse(items, FUSE_OPTIONS);
  }, [items]);

  // Parse search filters
  const parseSearchFilters = (query: string) => {
    const priceMatch = query.match(PRICE_REGEX);
    const conditionMatch = query.match(CONDITION_REGEX);
    
    return {
      maxPrice: priceMatch ? parseInt(priceMatch[1]) : null,
      condition: conditionMatch ? conditionMatch[1].toLowerCase() : null,
      cleanQuery: query
        .replace(PRICE_REGEX, '')
        .replace(CONDITION_REGEX, '')
        .trim()
    };
  };

  // Fetch items and perform search
  useEffect(() => {
    const fetchAndSearch = async () => {
      if (!searchTerm.trim()) {
        setItems([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Parse filters from search term
        const { maxPrice, condition, cleanQuery } = parseSearchFilters(searchTerm);

        // Expand search terms to include variations
        const expandedTerms = expandSearchTerms(cleanQuery);

        // Fetch items with their category and subcategory info
        const { data, error } = await supabase
          .from('items')
          .select(`
            *,
            category:category_id (name),
            subcategory:subcategory_id (name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Apply price and condition filters if present
        let filteredData = data;
        if (maxPrice) {
          filteredData = filteredData.filter(item => item.price <= maxPrice);
        }
        if (condition) {
          filteredData = filteredData.filter(
            item => item.condition.toLowerCase().includes(condition)
          );
        }

        // Perform fuzzy search with expanded terms
        let results = filteredData;
        if (cleanQuery) {
          const allResults = new Set();
          
          // Search for each expanded term
          expandedTerms.forEach(term => {
            const fuzzyResults = fuse.search(term);
            fuzzyResults
              .filter(result => result.score && result.score < 0.8)
              .forEach(result => allResults.add(result.item));
          });

          results = Array.from(allResults) as Item[];
        }

        setItems(results);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search to avoid too many requests
    const timeoutId = setTimeout(fetchAndSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, fuse]);

  return { items, loading, error };
}; 