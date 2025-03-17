import { supabase } from '../lib/supabaseClient';

export type EmojiOption = {
  id: string;
  emoji: string;
  name: string;
};

export const fetchEmojis = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('emoji_options')
    .select('emoji')
    .order('created_at');

  if (error) {
    console.error('Error fetching emojis:', error);
    // Fallback to default emojis if fetch fails
    return ['👍', '❤️', '😂', '😮', '😢', '😡'];
  }

  return data.map(row => row.emoji);
};

// Keep a default export for static usage
export const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'] as const;
export type EmojiType = typeof DEFAULT_EMOJIS[number];
