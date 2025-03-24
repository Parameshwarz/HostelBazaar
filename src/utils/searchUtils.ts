import { Item } from '../types';

/**
 * Calculate similarity between a search term and item text
 * Simplified implementation that provides better results
 */
export function calculateSimilarity(searchTerm: string, itemText: string): number {
  // Handle empty inputs
  if (!searchTerm || !itemText) return 0;
  
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const normalizedItem = itemText.toLowerCase().trim();
  
  // Return 1 for direct matches
  if (normalizedItem === normalizedSearch) {
    return 1;
  }
  
  // High score for contained matches
  if (normalizedItem.includes(normalizedSearch)) {
    return 0.9;
  }
  
  // High score for when search term contains the item text
  if (normalizedSearch.includes(normalizedItem) && normalizedItem.length > 3) {
    return 0.8;
  }
  
  // Split terms into words
  const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 1);
  const itemWords = normalizedItem.split(/\s+/).filter(w => w.length > 1);
  
  if (searchWords.length === 0 || itemWords.length === 0) return 0;
  
  // Count matching words
  let matchedWords = 0;
  let partialMatches = 0;
  
  for (const searchWord of searchWords) {
    // Skip very short words
    if (searchWord.length < 2) continue;
    
    // Check for exact word matches
    if (itemWords.some(w => w === searchWord)) {
      matchedWords++;
      continue;
    }
    
    // Check for word starts with
    if (itemWords.some(w => w.startsWith(searchWord) || searchWord.startsWith(w))) {
      matchedWords += 0.7;
      partialMatches++;
      continue;
    }
    
    // Check for partial word matches
    if (itemWords.some(w => w.includes(searchWord) || searchWord.includes(w))) {
      matchedWords += 0.5;
      partialMatches++;
      continue;
    }
  }
  
  // No matches found
  if (matchedWords === 0 && partialMatches === 0) return 0;
  
  // Calculate score based on matching words
  const baseScore = matchedWords / Math.max(searchWords.length, itemWords.length);
  
  // Add a boost for partial matches
  const partialBoost = partialMatches * 0.1;
  
  return Math.min(1, baseScore + partialBoost);
}

/**
 * Simplified Levenshtein distance function for fuzzy matching
 * Used only as a fallback for more complex matches
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return track[str2.length][str1.length];
} 