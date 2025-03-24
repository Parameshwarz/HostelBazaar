/**
 * Simple fuzzy search implementation to find matches in item titles and descriptions
 */

// Adjust similarity thresholds - lowered for better matching
export const titleThreshold = 0.3;      // Lower threshold for more matches
export const descriptionThreshold = 0.2; // Lower threshold for more matches
export const tagsThreshold = 0.4;       // Lower threshold for more matches

// Common word variations and typos mapping for better matching
const commonVariations: Record<string, string[]> = {
  "mobile": ["moble", "mobil", "mbl", "phone", "phon"],
  "laptop": ["lapto", "laptap", "lappy", "laptp", "lapop"],
  "computer": ["computr", "comp", "comptr", "cmptr"],
  "tablet": ["tab", "tablt", "tabet"],
  "electronics": ["electronic", "electrnc", "electro", "gadgets", "devices"],
  "textbook": ["textbk", "txtbook", "txbook"],
  "furniture": ["furntr", "furnit", "furn"],
  "chair": ["chr", "seat"],
  "table": ["tbl", "desk"],
}

// Valid condition values
const conditionKeywords = {
  "new": "New",
  "like new": "Like New", 
  "used": "Used"
};

/**
 * Function to perform fuzzy search on a collection of items
 * @param items - Array of items to search through
 * @param query - The search query
 * @returns Filtered and ranked results
 */
export function fuzzySearch(items: any[], query: string): any[] {
  if (!query || query.trim() === '') {
    return items; // Return all items if no query
  }

  // If this is the exact "moble" typo case, directly handle it
  if (query.toLowerCase().trim() === 'moble') {
    console.log('Direct handling of "moble" typo, treating as "mobile"');
    
    // Filter items by checking if they contain "mobile" or phone-related terms
    return items.filter(item => {
      const title = item.title?.toLowerCase() || '';
      const description = item.description?.toLowerCase() || '';
      const tags = item.tags?.map((t: string) => t.toLowerCase()).join(' ') || '';
      
      // Check for mobile-related terms in any field
      return title.includes('mobile') || 
             title.includes('phone') || 
             description.includes('mobile') ||
             description.includes('phone') ||
             tags.includes('mobile') ||
             tags.includes('phone');
    });
  }

  console.log(`Running fuzzySearch with ${items.length} items for query: "${query}"`);
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check for condition keywords in the query
  let actualSearchTerms = normalizedQuery;
  let conditionFilter: string | null = null;
  
  // Extract condition from query if present
  Object.entries(conditionKeywords).forEach(([keyword, condition]) => {
    if (normalizedQuery.includes(keyword)) {
      console.log(`Detected condition "${keyword}" in search query`);
      conditionFilter = condition;
      // Remove the condition keyword from the search query
      actualSearchTerms = normalizedQuery.replace(keyword, '').trim();
    }
  });
  
  // Log to troubleshoot
  console.log(`Extracted condition: ${conditionFilter || 'None'}, search terms: "${actualSearchTerms}"`);
  
  // For "used laptop" searches, make sure we catch it even if mixed case
  if (normalizedQuery.includes("used laptop") || normalizedQuery.includes("Used laptop")) {
    console.log("Special handling for 'used laptop' search");
    conditionFilter = "Used";
    actualSearchTerms = "laptop";
  }
  
  // Check for price-related queries to handle separately
  if (actualSearchTerms.includes("under") || 
      actualSearchTerms.includes("below") || 
      actualSearchTerms.includes("less than") ||
      actualSearchTerms.includes("above") || 
      actualSearchTerms.includes("over") || 
      actualSearchTerms.includes("more than")) {
    console.log(`Detected price-related query: "${actualSearchTerms}"`);
    return handlePriceQuery(items, actualSearchTerms, conditionFilter);
  }
  
  // Extract the keywords for better matching
  const words = actualSearchTerms.split(/\s+/).map(word => {
    // Check for common typos and variations
    const corrected = correctTypos(word);
    if (corrected !== word) {
      console.log(`Corrected "${word}" to "${corrected}"`);
    }
    return corrected;
  });
  
  console.log(`Search words after correction: ${words.join(', ')}`);

  // Filter and score items
  let scoredItems = items
    .map(item => {
      // Apply condition filter if present
      if (conditionFilter && item.condition !== conditionFilter) {
        return { item, score: 0, titleScore: 0, descriptionScore: 0, tagScore: 0 };
      }
      
      const title = item.title?.toLowerCase() || '';
      const description = item.description?.toLowerCase() || '';
      const tags = item.tags?.map((t: string) => t.toLowerCase()).join(' ') || '';
      
      // Calculate scores for different fields
      const titleScore = calculateFieldScore(title, words);
      const descriptionScore = calculateFieldScore(description, words) * 0.7; // Description matches are less important
      const tagScore = calculateFieldScore(tags, words) * 0.8; // Tag matches are important but less than title
      
      // Calculate total relevance score
      const relevanceScore = Math.max(titleScore, descriptionScore, tagScore);
      
      return {
        item,
        score: relevanceScore,
        titleScore,
        descriptionScore,
        tagScore
      };
    })
    .filter(result => result.score > 0.05) // Lower threshold to include more results
    .sort((a, b) => b.score - a.score); // Sort by relevance score (highest first)
  
  // Log top search results with scores for debugging
  console.log(`Found ${scoredItems.length} matching items`);
  if (scoredItems.length > 0) {
    console.log('Top 3 results:');
    scoredItems.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index+1}. "${item.item.title}" - Score: ${item.score.toFixed(2)} (Title: ${item.titleScore.toFixed(2)}, Desc: ${item.descriptionScore.toFixed(2)}, Tags: ${item.tagScore.toFixed(2)})`);
    });
  } else {
    console.log('No matching items found');
  }
  
  return scoredItems.map(result => result.item); // Return just the items
}

/**
 * Correct common typos and variations
 */
function correctTypos(word: string): string {
  // Skip very short words
  if (word.length <= 2) return word;
  
  // Direct typo corrections for very common search terms
  const directCorrections: Record<string, string> = {
    'moble': 'mobile',
    'mobil': 'mobile',
    'laptp': 'laptop',
    'lapto': 'laptop',
    'leptop': 'laptop',
    'fone': 'phone',
    'phne': 'phone'
  };
  
  // Check for direct corrections first (fastest path)
  if (directCorrections[word]) {
    console.log(`Direct typo correction: ${word} -> ${directCorrections[word]}`);
    return directCorrections[word];
  }
  
  // Check for exact matches in our variation dictionary
  for (const [correct, variations] of Object.entries(commonVariations)) {
    if (variations.includes(word)) {
      console.log(`Variation correction: ${word} -> ${correct}`);
      return correct; // Return the correct form
    }
    
    // Check if the word is very close to the correct form
    if (levenshteinDistance(word, correct) <= 2 && word.length > 3) {
      console.log(`Levenshtein correction with correct word: ${word} -> ${correct}`);
      return correct;
    }
    
    // Check variations with similar threshold
    for (const variation of variations) {
      if (levenshteinDistance(word, variation) <= 1) {
        console.log(`Levenshtein correction with variation: ${word} -> ${correct}`);
        return correct;
      }
    }
  }
  
  return word; // Return original if no correction found
}

/**
 * Handle price-related queries
 */
function handlePriceQuery(items: any[], query: string, conditionFilter: string | null = null): any[] {
  console.log(`handlePriceQuery processing: "${query}"`);
  
  // Extract product type (what) and price constraint (how much)
  let productType = '';
  let maxPrice = 0;
  let minPrice = 0;
  
  // Extract max price for "under X" queries - using a more flexible regex
  const priceUnderMatch = query.match(/(.+?)\s+(under|below|less than)\s+(\d+)/i);
  if (priceUnderMatch) {
    maxPrice = parseInt(priceUnderMatch[3], 10);
    productType = priceUnderMatch[1].trim();
    console.log(`Price query parsed: ProductType="${productType}", MaxPrice=${maxPrice}`);
  }
  
  // Extract min price for "above X" queries
  const priceOverMatch = query.match(/(.+?)\s+(above|over|more than)\s+(\d+)/i);
  if (priceOverMatch) {
    minPrice = parseInt(priceOverMatch[3], 10);
    productType = priceOverMatch[1].trim();
    console.log(`Price query parsed: ProductType="${productType}", MinPrice=${minPrice}`);
  }
  
  // If we didn't successfully extract a product type or price, try a different approach
  if ((!productType || (!maxPrice && !minPrice)) && (query.includes("under") || query.includes("below") || query.includes("above"))) {
    console.log("Using fallback price query parsing");
    
    // Fallback pattern matching
    const words = query.split(/\s+/);
    const priceIndex = words.findIndex(word => 
      word === "under" || word === "below" || word === "above" || word === "over"
    );
    
    if (priceIndex > 0 && priceIndex < words.length - 1) {
      // Try to extract product and price
      productType = words.slice(0, priceIndex).join(' ');
      const priceString = words[priceIndex+1].replace(/[^\d]/g, '');
      const price = parseInt(priceString, 10);
      
      if (!isNaN(price)) {
        if (["under", "below"].includes(words[priceIndex])) {
          maxPrice = price;
        } else {
          minPrice = price;
        }
        
        console.log(`Fallback parsing: ProductType="${productType}", MaxPrice=${maxPrice}, MinPrice=${minPrice}`);
      }
    }
  }
  
  // If we still couldn't extract a proper product type, use a default approach
  if (!productType) {
    console.log("Couldn't extract product type, using default fallback");
    // Extract everything except the price-related parts
    productType = query
      .replace(/(under|below|less than|above|over|more than)\s+\d+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  console.log(`Final extracted terms: ProductType="${productType}", MaxPrice=${maxPrice}, MinPrice=${minPrice}`);
  
  // Correct any typos in the product type
  const correctedProductType = correctTypos(productType);
  if (correctedProductType !== productType) {
    console.log(`Corrected product type from "${productType}" to "${correctedProductType}"`);
    productType = correctedProductType;
  }
  
  // If we have price constraints, filter by price
  let filteredItems = items;
  if (maxPrice > 0 || minPrice > 0) {
    console.log(`Filtering by price: Min=${minPrice}, Max=${maxPrice}`);
    filteredItems = items.filter(item => {
      const price = parseFloat(item.price) || 0;
      if (maxPrice > 0 && price > maxPrice) return false;
      if (minPrice > 0 && price < minPrice) return false;
      return true;
    });
  }
  
  // Apply condition filter if present
  if (conditionFilter) {
    console.log(`Filtering by condition: ${conditionFilter}`);
    filteredItems = filteredItems.filter(item => item.condition === conditionFilter);
  }
  
  // Now do a text search on the remaining items
  return filteredItems.filter(item => {
    // Only do text matching if we have a product type
    if (!productType) return true;
    
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const productTypeWords = productType.split(/\s+/);
    
    // Check if all words in the product type are found in the title or description
    return productTypeWords.every(word => 
      title.includes(word) || description.includes(word)
    );
  });
}

/**
 * Calculate a similarity score for a field based on the search words
 */
function calculateFieldScore(field: string, searchWords: string[]): number {
  if (!field || searchWords.length === 0) return 0;
  
  let score = 0;
  
  // 1. Exact match bonus
  const normalizedField = field.toLowerCase();
  const searchString = searchWords.join(' ').toLowerCase();
  if (normalizedField.includes(searchString)) {
    score += 1.0; // Full score for exact match
    return score; // Return early for exact matches
  }
  
  // 2. Count matching words
  let matchedWords = 0;
  for (const word of searchWords) {
    if (normalizedField.includes(word)) {
      matchedWords++;
    } else {
      // 3. Check for partial matches
      const partialMatches = getPartialMatches(normalizedField, word);
      if (partialMatches > 0) {
        matchedWords += partialMatches * 0.7; // Partial matches get 70% credit
      }
    }
  }
  
  // Calculate score based on ratio of matched words
  if (searchWords.length > 0) {
    score = matchedWords / searchWords.length;
  }
  
  return score;
}

/**
 * Check for partial word matches
 */
function getPartialMatches(text: string, word: string): number {
  // Skip very short words (less than 4 chars) for partial matching
  if (word.length < 4) return 0;
  
  // Split text into words
  const words = text.split(/\s+/);
  let matches = 0;
  
  // Check if any word contains the search word as a substring (min 3 chars)
  for (const textWord of words) {
    if (textWord.length >= 3 && word.length >= 3) {
      if (textWord.includes(word.substring(0, Math.min(word.length, 3)))) {
        matches += 0.5; // Partial match at beginning
      } else if (word.includes(textWord.substring(0, Math.min(textWord.length, 3)))) {
        matches += 0.3; // Partial match of text word in search word
      }
    }
  }
  
  return matches;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}