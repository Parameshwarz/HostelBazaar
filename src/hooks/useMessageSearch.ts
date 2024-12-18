import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { SearchResult } from '../types';

export const useMessageSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchMessages = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, chat_id, content, created_at')
        .textSearch('content', query)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setResults(
        data.map(msg => ({
          messageId: msg.id,
          chatId: msg.chat_id,
          content: msg.content,
          timestamp: msg.created_at
        }))
      );
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return { results, isSearching, searchMessages };
}; 