import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  chat_id: string;
}

export const useMessageSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMessages = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id, chat_id')
        .textSearch('content', query);

      if (error) throw error;

      setResults(data || []);
    } catch (error) {
      console.error('Error searching messages:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, searchMessages };
}; 