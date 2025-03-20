import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Chat } from '../../types';

export const useChat = (userId: string) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch chats with participant details
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          participant_1:profiles!chats_participant_1_fkey (
            id,
            username,
            avatar_url,
            last_seen,
            trust_score
          ),
          participant_2:profiles!chats_participant_2_fkey (
            id,
            username,
            avatar_url,
            last_seen,
            trust_score
          )
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Transform chat data to include other_user
      const transformedChats = chatsData.map(chat => {
        const otherUser = chat.participant_1.id === userId 
          ? chat.participant_2 
          : chat.participant_1;

        return {
          ...chat,
          other_user: otherUser
        };
      });

      setChats(transformedChats);

      // If no chat is selected and there are chats, select the first one
      if (!selectedChat && transformedChats.length > 0) {
        setSelectedChat(transformedChats[0]);
      }

    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedChat]);

  const createChat = useCallback(async (otherUserId: string) => {
    try {
      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .or(`and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`)
        .single();

      if (existingChat) {
        setSelectedChat(existingChat);
        return existingChat;
      }

      // Create new chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([
          {
            participant_1: userId,
            participant_2: otherUserId,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      // Fetch the new chat with participant details
      const { data: chatWithDetails, error: fetchError } = await supabase
        .from('chats')
        .select(`
          *,
          participant_1:profiles!chats_participant_1_fkey (
            id,
            username,
            avatar_url,
            last_seen,
            trust_score
          ),
          participant_2:profiles!chats_participant_2_fkey (
            id,
            username,
            avatar_url,
            last_seen,
            trust_score
          )
        `)
        .eq('id', newChat.id)
        .single();

      if (fetchError) throw fetchError;

      // Transform chat data to include other_user
      const transformedChat = {
        ...chatWithDetails,
        other_user: chatWithDetails.participant_1.id === userId 
          ? chatWithDetails.participant_2 
          : chatWithDetails.participant_1
      };

      setChats(prev => [transformedChat, ...prev]);
      setSelectedChat(transformedChat);

      return transformedChat;
    } catch (err) {
      console.error('Error creating chat:', err);
      throw err;
    }
  }, [userId]);

  const updateChatStatus = useCallback(async (chatId: string, status: 'active' | 'archived' | 'blocked') => {
    try {
      const { error: updateError } = await supabase
        .from('chats')
        .update({ status })
        .eq('id', chatId);

      if (updateError) throw updateError;

      setChats(prev => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, status } : chat
        )
      );

      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error('Error updating chat status:', err);
      throw err;
    }
  }, [selectedChat]);

  useEffect(() => {
    fetchChats();

    // Subscribe to chat updates
    const subscription = supabase
      .channel('chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `participant_1=eq.${userId},participant_2=eq.${userId}`
        },
        (payload) => {
          console.log('Chat change received:', payload);
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchChats]);

  return {
    chats,
    loading,
    error,
    selectedChat,
    setSelectedChat,
    createChat,
    updateChatStatus,
    fetchChats
  };
}; 