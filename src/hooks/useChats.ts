import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export type ChatWithDetails = {
  id: string;
  item_id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  last_message?: string;
  last_message_at?: string;
  item: {
    title: string;
  };
  other_user: {
    username: string;
    avatar_url: string | null;
  };
};

export function useChats() {
  const [chats, setChats] = useState<ChatWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchChats();

    // Subscribe to new chats
    const subscription = supabase
      .channel('chats')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chats',
          filter: `participant_1=eq.${user.id},participant_2=eq.${user.id}` 
        }, 
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_details')
        .select('*')
        .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`);

      if (error) throw error;

      const processedChats = data.map(chat => ({
        ...chat,
        item: { title: chat.item_title },
        other_user: {
          username: chat.participant_1 === user?.id 
            ? chat.participant_2_username 
            : chat.participant_1_username,
          avatar_url: chat.participant_1 === user?.id 
            ? chat.participant_2_avatar 
            : chat.participant_1_avatar
        }
      }));

      setChats(processedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { chats, loading };
} 