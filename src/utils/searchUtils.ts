import { Item } from '../types';

export function calculateSimilarity(searchTerm: string, itemText: string): number {
  const normalizedSearch = searchTerm.toLowerCase();
  const normalizedItem = itemText.toLowerCase();

  // Direct match check
  if (normalizedItem.includes(normalizedSearch)) {
    return 1;
  }

  // Split search term into words for partial matching
  const searchWords = normalizedSearch.split(/\s+/);
  const itemWords = normalizedItem.split(/\s+/);

  // Calculate word-level matches
  const wordMatches = searchWords.map(searchWord => {
    // Check for exact word matches
    if (itemWords.includes(searchWord)) {
      return 1;
    }

    // Check for partial word matches
    const partialMatches = itemWords.map(itemWord => {
      // Start of word match gets higher score
      if (itemWord.startsWith(searchWord)) {
        return 0.9;
      }

      // Contains match gets medium score
      if (itemWord.includes(searchWord)) {
        return 0.7;
      }

      // Levenshtein distance for typo tolerance
      const distance = levenshteinDistance(searchWord, itemWord);
      const maxLength = Math.max(searchWord.length, itemWord.length);
      const similarity = (maxLength - distance) / maxLength;

      return similarity;
    });

    return Math.max(...partialMatches);
  });

  // Calculate final score
  const avgScore = wordMatches.reduce((sum, score) => sum + score, 0) / wordMatches.length;
  return avgScore;
}

function levenshteinDistance(str1: string, str2: string): number {
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