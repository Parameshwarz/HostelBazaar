import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Chat } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { user } = useAuth();

  const fetchChats = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch chats where user is a participant
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Fetch profiles for all participants
      const participantIds = chatsData.flatMap(chat => [
        chat.participant_1,
        chat.participant_2
      ]);
      const uniqueParticipantIds = [...new Set(participantIds)];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uniqueParticipantIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      // Transform chats data
      const transformedChats: Chat[] = chatsData.map(chat => {
        const otherUserId = chat.participant_1 === user.id ? chat.participant_2 : chat.participant_1;
        const otherUser = profilesMap.get(otherUserId);

        return {
          id: chat.id,
          participant_1: chat.participant_1,
          participant_2: chat.participant_2,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          last_message: chat.last_message || '',
          last_message_at: chat.last_message_at || chat.updated_at,
          other_user: {
            id: otherUser?.id || '',
            username: otherUser?.username || 'Unknown User',
            avatar_url: otherUser?.avatar_url,
            last_seen: otherUser?.last_seen || null
          },
          status: chat.status || 'active',
          is_pinned: chat.is_pinned || false,
          meeting_scheduled: chat.meeting_scheduled || false,
          location_agreed: chat.location_agreed || false,
          deal_completed: chat.deal_completed || false,
          is_blocked: chat.is_blocked || false,
          is_muted: chat.is_muted || false
        };
      });

      setChats(transformedChats);
      
      // Select first chat if none selected
      if (!selectedChat && transformedChats.length > 0) {
        setSelectedChat(transformedChats[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [user, selectedChat]);

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
          filter: `participant_1=eq.${user?.id},participant_2=eq.${user?.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newChat = payload.new as Chat;
            setChats(prev => [newChat, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedChat = payload.new as Chat;
            setChats(prev => prev.map(chat => 
              chat.id === updatedChat.id ? updatedChat : chat
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedChatId = payload.old.id;
            setChats(prev => prev.filter(chat => chat.id !== deletedChatId));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchChats]);

  const createChat = useCallback(async (otherUserId: string) => {
    if (!user) return null;
    
    try {
      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .maybeSingle();

      if (existingChat) {
        return existingChat;
      }

      // Create new chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          participant_1: user.id,
          participant_2: otherUserId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      
      return newChat;
    } catch (err) {
      console.error('Error creating chat:', err);
      throw err;
    }
  }, [user]);

  const updateChatStatus = useCallback(async (chatId: string, status: 'active' | 'archived' | 'blocked') => {
    try {
      const updates: any = { status };
      
      if (status === 'blocked') {
        updates.is_blocked = true;
      } else if (status === 'active' && chats.find(c => c.id === chatId)?.is_blocked) {
        updates.is_blocked = false;
      }
      
      const { error } = await supabase
        .from('chats')
        .update(updates)
        .eq('id', chatId);

      if (error) throw error;
      
      // Update local state
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, ...updates } : chat
      ));
      
      // Update selected chat if needed
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('Error updating chat status:', err);
      throw err;
    }
  }, [chats, selectedChat]);

  const blockUser = async (chatId: string) => {
    return updateChatStatus(chatId, 'blocked');
  };

  const unblockUser = async (chatId: string) => {
    return updateChatStatus(chatId, 'active');
  };

  const archiveChat = async (chatId: string) => {
    return updateChatStatus(chatId, 'archived');
  };

  return {
    chats,
    loading,
    error,
    selectedChat,
    setSelectedChat,
    blockUser,
    unblockUser,
    archiveChat,
    fetchChats,
    createChat,
    updateChatStatus
  };
}; 