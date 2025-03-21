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

      console.log('Fetching chats for user:', user.id);

      // Fetch chats where user is a participant using the correct filter format
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .or('participant_1.eq.' + user.id + ',participant_2.eq.' + user.id)
        .order('updated_at', { ascending: false });

      if (chatsError) {
        console.error('Error fetching chats:', chatsError);
        throw chatsError;
      }

      console.log('Chats data:', chatsData);

      if (!chatsData || chatsData.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

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

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of profiles
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

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
      console.error('Error in fetchChats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [user, selectedChat]);

  useEffect(() => {
    fetchChats();

    // Subscribe to chat updates - only if user exists
    if (!user) return;

    const subscription = supabase
      .channel('chats-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        (payload) => {
          console.log('Chat subscription event:', payload);
          
          // Only process changes for chats the user is part of
          const chatData = payload.new || payload.old || {};
          if (chatData && 
              (typeof chatData === 'object') && 
              ('participant_1' in chatData) && 
              ('participant_2' in chatData) &&
              (chatData.participant_1 === user.id || chatData.participant_2 === user.id)) {
            
            if (payload.eventType === 'INSERT') {
              const newChat = payload.new as any;
              // Fetch the other user's profile
              fetchUserProfile(newChat.participant_1 === user.id ? newChat.participant_2 : newChat.participant_1)
                .then(otherUser => {
                  const chatWithUser: Chat = {
                    ...newChat,
                    other_user: otherUser || {
                      id: '',
                      username: 'Unknown User',
                      avatar_url: null,
                      last_seen: null
                    }
                  };
                  setChats(prev => [chatWithUser, ...prev]);
                });
            } else if (payload.eventType === 'UPDATE') {
              const updatedChat = payload.new as any;
              setChats(prev => prev.map(chat => 
                chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
              ));
              
              // Update selected chat if needed
              if (selectedChat?.id === updatedChat.id) {
                setSelectedChat(prev => prev ? { ...prev, ...updatedChat } : null);
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedChatId = payload.old.id;
              setChats(prev => prev.filter(chat => chat.id !== deletedChatId));
              
              // Clear selected chat if it was deleted
              if (selectedChat?.id === deletedChatId) {
                setSelectedChat(null);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchChats, selectedChat]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        username: data.username,
        avatar_url: data.avatar_url,
        last_seen: data.last_seen
      };
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  const createChat = useCallback(async (otherUserId: string) => {
    if (!user) return null;
    
    try {
      console.log('Creating chat with user:', otherUserId);
      
      // Check if chat already exists (corrected format)
      const { data: existingChats, error: findError } = await supabase
        .from('chats')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${otherUserId}`)
        .or(`participant_1.eq.${otherUserId},participant_2.eq.${user.id}`);

      if (findError) {
        console.error('Error finding existing chat:', findError);
        throw findError;
      }

      if (existingChats && existingChats.length > 0) {
        console.log('Chat already exists:', existingChats[0]);
        return existingChats[0];
      }

      // Create new chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          participant_1: user.id,
          participant_2: otherUserId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat:', error);
        throw error;
      }
      
      console.log('New chat created:', newChat);
      return newChat;
    } catch (err) {
      console.error('Error in createChat:', err);
      throw err;
    }
  }, [user]);

  const updateChatStatus = useCallback(async (chatId: string, status: 'active' | 'archived' | 'blocked') => {
    try {
      console.log('Updating chat status:', chatId, status);
      
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'blocked') {
        updates.is_blocked = true;
      } else if (status === 'active') {
        updates.is_blocked = false;
      }
      
      const { error } = await supabase
        .from('chats')
        .update(updates)
        .eq('id', chatId);

      if (error) {
        console.error('Error updating chat status:', error);
        throw error;
      }
      
      // Update local state
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, ...updates } : chat
      ));
      
      // Update selected chat if needed
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('Error in updateChatStatus:', err);
      throw err;
    }
  }, [selectedChat]);

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