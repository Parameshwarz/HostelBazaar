import { supabase } from '../supabase';
import { calculateSimilarity } from "../../utils/searchUtils"
import { CATEGORIES } from '../../types/categories';

// Common word variations and misspellings
const WORD_MAPPINGS = {
  // Electronics
  'mobile': ['mobl', 'mobil', 'mbl', 'phone', 'smartphone', 'cell', 'fone', 'phones', 'mobiles', 'mobilephone'],
  'laptop': ['laptp', 'lappy', 'laptap', 'lptop', 'labtop', 'laptops', 'leptop', 'notebk'],
  'tablet': ['tab', 'tabet', 'tbl', 'ipad', 'tablets', 'ipads', 'tablt'],
  'computer': ['comp', 'cmptr', 'pc', 'desktop', 'computers', 'desktops', 'komputer'],
  
  // Books and Stationery
  'books-and-stationery': [
    'book', 'books', 'textbook', 'novel', 'study material', 'textbooks', 'novels',
    'stationery', 'pen', 'pencil', 'notebook', 'academic', 'notes', 'guides',
    'fiction', 'non-fiction', 'study materials', 'stationary', 'pens', 'pencils'
  ],
  
  // Furniture
  'furniture': ['frntr', 'furntr', 'furn', 'furnitures'],
  'chair': ['chr', 'chairs', 'seat', 'seats'],
  'table': ['tbl', 'desk', 'study table', 'tables', 'desks'],
  
  // Conditions
  'Used': [
    'second hand', '2nd hand', 'secondhand', '2ndhand', 'used', 
    'old', 'pre owned', 'preowned', 'pre-owned', 'second-hand', '2nd-hand',
    'preloved', 'pre loved', 'pre-loved'
  ],
  'New': [
    'brand new', 'sealed', 'packed', 'unopened', 'fresh', 'unused',
    'box packed', 'box-packed', 'boxed'
  ],
  'Like New': [
    'almost new', 'barely used', 'mint', 'barely-used', 'mint condition',
    'gently used', 'lightly used', 'excellent condition'
  ],
}

// Category keywords mapping
const CATEGORY_KEYWORDS = {
  'books-and-stationery': [
    'book', 'textbook', 'novel', 'study', 'course', 'notes', 'guide',
    'material', 'literature', 'stationary', 'pen', 'pencil', 'notebook',
    'paper', 'academic', 'fiction', 'non-fiction', 'study materials',
    'books', 'textbooks', 'novels', 'guides', 'materials', 'stationery',
    'pens', 'pencils', 'notebooks', 'papers', 'academics'
  ],
  'electronics': [
    'mobile', 'phone', 'laptop', 'computer', 'tablet', 'charger', 
    'headphone', 'earphone', 'speaker', 'keyboard', 'mouse',
    'phones', 'laptops', 'computers', 'tablets', 'chargers',
    'headphones', 'earphones', 'speakers', 'keyboards', 'mice',
    'electronic', 'electronics', 'gadget', 'gadgets', 'device', 'devices'
  ],
  'furniture': [
    'chair', 'table', 'desk', 'bed', 'furniture', 'shelf',
    'rack', 'storage', 'cupboard', 'almirah', 'chairs',
    'tables', 'desks', 'beds', 'shelves', 'racks',
    'cupboards', 'almirahs', 'furnishing', 'furnishings'
  ]
}

function findSimilarWord(word: string): string | null {
  // Check direct mappings first
  for (const [key, variations] of Object.entries(WORD_MAPPINGS)) {
    if (variations.includes(word.toLowerCase())) return key;
  }

  // Check category keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.includes(word.toLowerCase())) return category;
  }

  // Check similarity with all possible words
  let bestMatch = null;
  let highestScore = 0.4; // Increased threshold for better accuracy

  const allWords = [
    ...Object.keys(WORD_MAPPINGS),
    ...Object.values(WORD_MAPPINGS).flat(),
    ...Object.keys(CATEGORY_KEYWORDS),
    ...Object.values(CATEGORY_KEYWORDS).flat()
  ];

  for (const target of allWords) {
    const score = calculateSimilarity(word.toLowerCase(), target.toLowerCase());
    if (score > highestScore) {
      highestScore = score;
      bestMatch = target;
    }
  }

  if (bestMatch) {
    // Check if it's a category keyword
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.includes(bestMatch)) return category;
    }

    // Check if it's a word variation
    for (const [key, variations] of Object.entries(WORD_MAPPINGS)) {
      if (variations.includes(bestMatch) || key === bestMatch) {
        return key;
      }
    }
  }

  return null;
}

function extractPriceFromText(text: string): { min?: number; max?: number } {
  const patterns = [
    // "under X" or "below X" or "less than X"
    { regex: /(?:under|below|less than)\s*(?:rs\.?|₹)?\s*(\d+[,\d]*)/i, handler: (match: string[]) => ({ max: parseFloat(match[1].replace(/,/g, '')) }) },
    
    // "above X" or "over X" or "more than X"
    { regex: /(?:above|over|more than)\s*(?:rs\.?|₹)?\s*(\d+[,\d]*)/i, handler: (match: string[]) => ({ min: parseFloat(match[1].replace(/,/g, '')) }) },
    
    // "between X and Y" or "from X to Y"
    { regex: /(?:between|from)\s*(?:rs\.?|₹)?\s*(\d+[,\d]*)\s*(?:to|-|and)\s*(?:rs\.?|₹)?\s*(\d+[,\d]*)/i, 
      handler: (match: string[]) => ({
        min: parseFloat(match[1].replace(/,/g, '')),
        max: parseFloat(match[2].replace(/,/g, ''))
      })
    },
    
    // "X-Y" or "X to Y"
    { regex: /(?:rs\.?|₹)?\s*(\d+[,\d]*)\s*(?:-|to)\s*(?:rs\.?|₹)?\s*(\d+[,\d]*)/i,
      handler: (match: string[]) => ({
        min: parseFloat(match[1].replace(/,/g, '')),
        max: parseFloat(match[2].replace(/,/g, ''))
      })
    },
    
    // Just a number with currency
    { regex: /(?:rs\.?|₹)?\s*(\d+[,\d]*)/i, handler: (match: string[]) => ({ max: parseFloat(match[1].replace(/,/g, '')) }) }
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match) {
      return pattern.handler(match);
    }
  }

  return {};
}

function calculateRelevanceScore(title: string, description: string, searchTerm: string): number {
  const normalizedSearch = searchTerm.toLowerCase();
  const normalizedTitle = title.toLowerCase();
  const normalizedDesc = description.toLowerCase();
  
  let score = 0;
  
  // Exact match in title (highest priority)
  if (normalizedTitle.includes(normalizedSearch)) {
    score += 10;
  }
  
  // Words appear in sequence in title
  if (normalizedTitle.includes(normalizedSearch.replace(/\s+/g, ' '))) {
    score += 5;
  }
  
  // Individual words match in title
  const searchWords = normalizedSearch.split(/\s+/);
  const titleWords = normalizedTitle.split(/\s+/);
  searchWords.forEach(word => {
    if (titleWords.some(tw => calculateSimilarity(word, tw) > 0.8)) {
      score += 3;
    }
  });
  
  // Matches in description (lower priority)
  if (normalizedDesc.includes(normalizedSearch)) {
    score += 2;
  }
  
  return score;
}

function findBestProductMatch(searchTerm: string): string | null {
  const specificProducts = {
    'laptop': ['laptp', 'lappy', 'laptap', 'lptop', 'labtop', 'laptops', 'leptop', 'notebk'],
    'tablet': ['tab', 'tabet', 'tbl', 'ipad', 'tablets', 'ipads', 'tablt'],
    'mobile': ['mobl', 'mobil', 'mbl', 'phone', 'smartphone', 'phones', 'mobiles'],
    'phone': ['fone', 'phones', 'smartphone', 'cell', 'mobile'],
    'computer': ['comp', 'cmptr', 'pc', 'desktop', 'komputer']
  };

  let bestMatch = null;
  let highestSimilarity = 0.7; // Threshold for similarity

  // Check exact matches first
  for (const [product, variations] of Object.entries(specificProducts)) {
    if (variations.includes(searchTerm.toLowerCase()) || product === searchTerm.toLowerCase()) {
      return product;
    }
  }

  // Check similarity scores
  for (const [product, variations] of Object.entries(specificProducts)) {
    // Check similarity with the main product term
    const mainSimilarity = calculateSimilarity(searchTerm.toLowerCase(), product);
    if (mainSimilarity > highestSimilarity) {
      highestSimilarity = mainSimilarity;
      bestMatch = product;
    }

    // Check similarity with variations
    for (const variation of variations) {
      const similarity = calculateSimilarity(searchTerm.toLowerCase(), variation);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = product;
      }
    }
  }

  return bestMatch;
}

function processFuzzySearch(query: string): {
  processedQuery: string;
  category?: string;
  condition?: string;
  priceRange?: { min?: number; max?: number };
  specificProduct?: string;
} {
  // Pre-process common variations
  let processedQuery = query.toLowerCase()
    .replace(/2nd/g, 'second')
    .replace(/(d)(nd|rd|th)/g, '$1')
    .replace(/-/g, ' ')
    .trim();

  const words = processedQuery.split(/\s+/);
  let condition: string | undefined;
  let category: string | undefined;
  let specificProduct: string | undefined;
  let remainingWords: string[] = [];

  // Extract price range from the full query first
  const priceRange = extractPriceFromText(query);

  // Check for specific products with fuzzy matching
  const productMatch = findBestProductMatch(processedQuery);
  if (productMatch) {
    specificProduct = productMatch;
    // Remove the matched product from the query
    processedQuery = processedQuery.replace(new RegExp(productMatch, 'gi'), '').trim();
  }

  // Process each word and word pairs for better phrase matching
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = words[i + 1];
    const twoWords = nextWord ? `${word} ${nextWord}` : word;

    // Skip processing if word is part of a price expression
    if (word.match(/(?:rs\.?|₹|\d+)/i)) {
      remainingWords.push(word);
      continue;
    }

    // Skip common price-related words
    if (['under', 'below', 'above', 'between', 'from', 'to', 'and'].includes(word)) {
      continue;
    }

    // Try to match two words first (for phrases)
    let matched = false;
    if (nextWord) {
      // Check for condition in two words
      for (const [key, variations] of Object.entries(WORD_MAPPINGS)) {
        if (key === 'Used' || key === 'New' || key === 'Like New') {
          if (variations.includes(twoWords)) {
            condition = key;
            matched = true;
            i++; // Skip next word
            break;
          }
        }
      }

      // Check for category in two words
      if (!matched && !specificProduct) {  // Only check category if no specific product found
        const similarWord = findSimilarWord(twoWords);
        if (similarWord && Object.keys(CATEGORY_KEYWORDS).includes(similarWord)) {
          category = similarWord;
          matched = true;
          i++; // Skip next word
        }
      }
    }

    // If no two-word match, try single word
    if (!matched) {
      // Check for condition
      let conditionFound = false;
      for (const [key, variations] of Object.entries(WORD_MAPPINGS)) {
        if (key === 'Used' || key === 'New' || key === 'Like New') {
          if (variations.includes(word) || key.toLowerCase() === word) {
            condition = key;
            conditionFound = true;
            break;
          }
        }
      }

      // If not a condition, check for category or keep as search term
      if (!conditionFound && !specificProduct) {  // Only check category if no specific product found
        const similarWord = findSimilarWord(word);
        if (similarWord && Object.keys(CATEGORY_KEYWORDS).includes(similarWord)) {
          category = similarWord;
        } else {
          remainingWords.push(word);
        }
      }
    }
  }

  return {
    processedQuery: remainingWords.join(' '),
    category,
    condition,
    priceRange,
    specificProduct
  };
}

type SortBy = 'price_asc' | 'price_desc' | 'created_at_desc' | 'relevance';

interface SearchParams {
  categories?: string[];
  subcategories?: string[];
  conditions?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
  page?: number;
  limit?: number;
}

// Add search analytics tracking function
async function createSearchAnalyticsTable() {
  try {
    const { error } = await supabase.rpc('create_search_analytics_table', {
      sql: `
        create table if not exists search_analytics (
          id uuid default uuid_generate_v4() primary key,
          search_term text not null,
          results_count integer not null,
          user_id uuid references auth.users(id),
          timestamp timestamptz not null default now(),
          has_results boolean not null
        );
      `
    });

    if (error) {
      console.error('Error creating search_analytics table:', error);
    }
  } catch (err) {
    console.error('Failed to create search_analytics table:', err);
  }
}

async function trackSearchAnalytics(searchTerm: string, results: any[], userId?: string) {
  if (!searchTerm) return; // Don't track empty searches
  
  try {
    const { error } = await supabase
      .from('search_analytics')
      .insert({
        search_term: searchTerm,
        results_count: results.length,
        user_id: userId,
        timestamp: new Date().toISOString(),
        has_results: results.length > 0
      });

    if (error) {
      console.error('Error tracking search analytics:', error);
    }
  } catch (err) {
    console.error('Failed to track search analytics:', err);
  }
}

export const getCategoriesWithCount = async () => {
  try {
    // First get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        subcategories (
          id,
          name,
          slug
        )
      `);

    if (categoriesError) throw categoriesError;

    // Get all items in a single query
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, category_id');

    if (itemsError) throw itemsError;

    // Count items per category
    const countMap: { [key: string]: number } = {};
    items?.forEach(item => {
      if (item.category_id) {
        countMap[item.category_id] = (countMap[item.category_id] || 0) + 1;
      }
    });

    // Map categories with their counts
    const categoriesWithCount = categories?.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      subcategories: cat.subcategories || [],
      item_count: countMap[cat.id] || 0
    }));

    // Always sort by item count first (relevance)
    const sorted = categoriesWithCount?.sort((a, b) => {
      return b.item_count - a.item_count || a.name.localeCompare(b.name);
    });

    return sorted || [];
  } catch (err) {
    console.error('Error fetching categories with count:', err);
    return [];
  }
};

export const getSubcategoriesWithCount = async (categoryId?: string) => {
  try {
    // Since we don't have a subcategories table, we'll return an empty array
    return [];
  } catch (err) {
    console.error('Error fetching subcategories with count:', err);
    return [];
  }
};

export const searchAllContent = async (query: string, filters: SearchParams, userId?: string) => {
  try {
    console.log('Received filters:', filters);

    const { page = 1, limit = 12 } = filters;
    const offset = (page - 1) * limit;
    
    let queryBuilder = supabase
      .from('items')
      .select(`
        *,
        profiles!items_user_id_fkey (
          id,
          username,
          avatar_url
        ),
        categories!items_category_id_fkey (
          id,
          name,
          slug
        ),
        subcategories!items_subcategory_id_fkey (
          id,
          name,
          slug
        )
      `);

    // Process natural language search
    const searchResult = query ? processFuzzySearch(query) : { processedQuery: '', category: undefined, condition: undefined, priceRange: undefined, specificProduct: undefined };
    const { processedQuery, category, condition, priceRange, specificProduct } = searchResult;
    
    console.log('Processed search:', { processedQuery, category, condition, priceRange, specificProduct });
    
    // If we have a search query but no matches found in processing, return empty results
    if (query && !processedQuery && !category && !condition && !priceRange && !specificProduct) {
      return {
        items: [],
        hasExactMatches: false,
        total: 0,
        type: 'no_results'
      };
    }

    // Apply filters...
    if (processedQuery) {
      queryBuilder = queryBuilder.textSearch('title', processedQuery, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Apply condition filter from either natural language or explicit filters
    if (filters.conditions && filters.conditions.length > 0) {
      queryBuilder = queryBuilder.in('condition', filters.conditions);
    } else if (condition) {
      queryBuilder = queryBuilder.eq('condition', condition);
    }

    // Apply category filter from either natural language or explicit filters
    if (filters.categories && filters.categories.length > 0) {
      // Get category IDs for the selected categories
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .in('slug', filters.categories);

      if (categoryData && categoryData.length > 0) {
        const categoryIds = categoryData.map(cat => cat.id);
        queryBuilder = queryBuilder.in('category_id', categoryIds);
      }
    } else if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (categoryData) {
        queryBuilder = queryBuilder.eq('category_id', categoryData.id);
      }
    }

    // Apply subcategory filter if present
    if (filters.subcategories && filters.subcategories.length > 0) {
      const { data: subcategoryData } = await supabase
        .from('subcategories')
        .select('id')
        .in('slug', filters.subcategories);

      if (subcategoryData && subcategoryData.length > 0) {
        const subcategoryIds = subcategoryData.map(subcat => subcat.id);
        queryBuilder = queryBuilder.in('subcategory_id', subcategoryIds);
      }
    }

    // Apply price range filters
    if (filters.minPrice !== undefined) {
      queryBuilder = queryBuilder.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      queryBuilder = queryBuilder.lte('price', filters.maxPrice);
    }

    // Apply sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          queryBuilder = queryBuilder.order('price', { ascending: true });
          break;
        case 'price_desc':
          queryBuilder = queryBuilder.order('price', { ascending: false });
          break;
        case 'created_at_desc':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        case 'relevance':
          // For relevance sorting, we'll use the category item count
          // This will be handled in the final results
          break;
        default:
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }
    } else {
      // Default to relevance sorting
      filters.sortBy = 'relevance';
    }

    // Get the total count
    const countQuery = supabase
      .from('items')
      .select('*', { count: 'exact', head: true });
    
    // Apply the same filters to count query
    const { count } = await countQuery;
    
    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    let { data: items, error } = await queryBuilder;

    if (error) throw error;

    // Initialize items as empty array if null
    let filteredItems = items || [];

    // If no results found with search query, return empty results
    if (filteredItems.length === 0 && query) {
      return {
        items: [],
        hasExactMatches: false,
        total: 0,
        type: 'no_results'
      };
    }

    // Sort results by relevance if we have a search query
    if (query && filteredItems.length > 0) {
      filteredItems = filteredItems.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a.title, a.description, query);
        const scoreB = calculateRelevanceScore(b.title, b.description, query);
        return scoreB - scoreA;
      });

      // Filter out items with very low relevance scores
      filteredItems = filteredItems.filter(item => 
        calculateRelevanceScore(item.title, item.description, query) > 0.3
      );
    }

    // If after relevance filtering we have no items, return no results
    if (filteredItems.length === 0 && query) {
      return {
        items: [],
        hasExactMatches: false,
        total: 0,
        type: 'no_results'
      };
    }

    // Track search analytics
    await trackSearchAnalytics(query, filteredItems, userId);

    // Check if any of the items exactly match the search query (case-insensitive)
    const hasExactMatches = query ? filteredItems.some(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    ) : false;

    return {
      items: filteredItems,
      hasExactMatches,
      total: count,
      type: filteredItems.length > 0 ? 'results' : 'no_results'
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}; 