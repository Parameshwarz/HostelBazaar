import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Message } from '../../types';
import { DatabaseMessage, MessageStatus } from './chatTypes';
import { validateMessage, removeDuplicateMessages } from './messageUtils';

export const useMessages = (chatId: string | null, userId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const messagesPerPage = 50;
  
  // Direct reference to the subscription
  const supabaseChannel = useRef<any>(null);

  const fetchMessages = useCallback(async (pageNum: number = 1) => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching messages for chat: ${chatId}, page: ${pageNum}`);

      // First fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * messagesPerPage, pageNum * messagesPerPage - 1);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      console.log(`Retrieved ${messagesData?.length || 0} messages`);

      if (!messagesData || messagesData.length === 0) {
        if (pageNum === 1) {
          setMessages([]);
        }
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Get all unique sender IDs
      const senderIds = new Set(messagesData.map(msg => msg.sender_id));
      const replyToIds = messagesData
        .map(msg => msg.reply_to_id)
        .filter((id): id is string => id !== null);

      console.log(`Fetching ${senderIds.size} sender profiles`);

      // Fetch sender profiles
      const { data: senderProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', Array.from(senderIds));

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of profiles
      const profilesMap = new Map(senderProfiles?.map(p => [p.id, p]) || []);

      // Fetch reply messages if any
      let replyMessages: Message[] = [];
      if (replyToIds.length > 0) {
        console.log(`Fetching ${replyToIds.length} reply messages`);
        
        const { data: replyData, error: replyError } = await supabase
          .from('messages')
          .select('*')
          .in('id', replyToIds);

        if (replyError) {
          console.error('Error fetching reply messages:', replyError);
        }

        if (replyData) {
          replyMessages = replyData.map(msg => validateMessage(msg as DatabaseMessage));
        }
      }

      // Create a map of reply messages
      const replyMap = new Map(replyMessages.map(msg => [msg.id, msg]));

      // Transform messages with sender profiles and replies
      const transformedMessages = messagesData.map(msg => {
        const sender = profilesMap.get(msg.sender_id);
        const replyTo = msg.reply_to_id ? replyMap.get(msg.reply_to_id) : undefined;

        return {
          ...msg,
          sender: sender ? {
            id: sender.id,
            username: sender.username,
            avatar_url: sender.avatar_url
          } : {
            id: msg.sender_id,
            username: 'Unknown User',
            avatar_url: null
          },
          reply_to: replyTo
        };
      });

      // Validate and sort messages
      const validatedMessages = transformedMessages.map(msg => validateMessage(msg as DatabaseMessage));
      const uniqueMessages = removeDuplicateMessages(validatedMessages);
      const sortedMessages = uniqueMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      console.log(`Processed ${sortedMessages.length} messages for display`);

      // Update messages state
      setMessages(prev => {
        if (pageNum === 1) return sortedMessages;
        return [...prev, ...sortedMessages];
      });

      // Update pagination state
      setHasMore(messagesData.length === messagesPerPage);
      setPage(pageNum);

      // Mark unread messages as read
      const unreadMessages = messagesData.filter(
        (msg: DatabaseMessage) => 
          msg.sender_id !== userId && 
          !msg.read_at
      );

      if (unreadMessages.length > 0) {
        console.log(`Marking ${unreadMessages.length} messages as read`);
        
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadMessages.map(msg => msg.id));

        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        }
      }

    } catch (err) {
      console.error('Error in fetchMessages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [chatId, userId]);

  const sendMessage = useCallback(async (content: string, chatId: string) => {
    try {
      console.log(`Sending message to chat: ${chatId}`);
      
      // Create optimistic message
      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: optimisticId,
        chat_id: chatId,
        sender_id: userId,
        content,
        content_type: 'text' as const,
        status: 'sending' as MessageStatus,
        created_at: new Date().toISOString(),
        read_at: null,
        reply_to_id: null,
        sender: {
          id: userId,
          username: 'You',
          avatar_url: null
        },
        reactions: []
      } as Message;

      // Add optimistic message to state
      setMessages(prev => [...prev, optimisticMessage]);

      // Insert message into database
      const { data: messageData, error: insertError } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: userId,
            content,
            content_type: 'text',
            status: 'sent'
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting message:', insertError);
        throw insertError;
      }

      console.log('Message sent successfully:', messageData);

      // Update chat's last message
      const { error: updateError } = await supabase
        .from('chats')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (updateError) {
        console.error('Error updating chat last message:', updateError);
      }

      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticId ? validateMessage(messageData as DatabaseMessage) : msg
        )
      );

      return messageData;
    } catch (err) {
      console.error('Error in sendMessage:', err);
      // Update the optimistic message to error state instead of removing it
      setMessages(prev => 
        prev.map(msg => 
          msg.id.startsWith('temp-') 
            ? { ...msg, status: 'error' as const } 
            : msg
        )
      );
      throw err;
    }
  }, [userId]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      console.log(`Loading more messages, page ${page + 1}`);
      fetchMessages(page + 1);
    }
  }, [loading, hasMore, page, fetchMessages]);

  // Function to create a new message object from payload
  const createMessageFromPayload = async (payload: any) => {
    try {
      if (!payload || !payload.new) {
        console.error('Invalid payload received:', payload);
        return null;
      }
      
      // Get the sender profile
      const { data: sender, error: senderError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', payload.new.sender_id)
        .single();
        
      if (senderError) {
        console.error('Error fetching sender:', senderError);
        return null;
      }
      
      // Create new message object
      const newMessage: Message = {
        id: payload.new.id,
        chat_id: payload.new.chat_id,
        sender_id: payload.new.sender_id,
        content: payload.new.content,
        content_type: payload.new.content_type || 'text',
        status: payload.new.status || 'sent',
        created_at: payload.new.created_at,
        read_at: payload.new.read_at || null,
        reply_to_id: payload.new.reply_to_id,
        sender: {
          id: sender.id,
          username: sender.username,
          avatar_url: sender.avatar_url
        },
        reactions: []
      };
      
      // If there's a reply_to_id, fetch the replied message
      if (payload.new.reply_to_id) {
        const { data: replyMessage, error: replyError } = await supabase
          .from('messages')
          .select('*')
          .eq('id', payload.new.reply_to_id)
          .single();
          
        if (!replyError && replyMessage) {
          const { data: replySender } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', replyMessage.sender_id)
            .single();
            
          if (replySender) {
            newMessage.reply_to = {
              ...replyMessage,
              sender: {
                id: replySender.id,
                username: replySender.username,
                avatar_url: replySender.avatar_url
              },
              reactions: []
            } as Message;
          }
        }
      }
      
      return newMessage;
    } catch (err) {
      console.error('Error creating message from payload:', err);
      return null;
    }
  };

  // Handle realtime messages
  useEffect(() => {
    if (!chatId) return;

    console.log(`Setting up realtime for chat: ${chatId}`);
    
    // Reset state when chat changes
    setMessages([]);
    setPage(1);
    setHasMore(true);
    fetchMessages(1);
    
    // Clean up previous subscription
    if (supabaseChannel.current) {
      console.log('Cleaning up previous subscription');
      supabase.removeChannel(supabaseChannel.current);
      supabaseChannel.current = null;
    }
    
    // Create a stable channel name for this chat
    const channelName = `chat:${chatId}`;
    
    // Set up the channel
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: userId },
      }
    });
    
    // Listen for INSERT events
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    }, async (payload) => {
      console.log('INSERT event received:', payload);
      
      // Don't add your own messages (handled by optimistic updates)
      if (payload.new.sender_id === userId) {
        console.log('Skipping own message from realtime update');
        return;
      }
      
      const newMessage = await createMessageFromPayload(payload);
      if (!newMessage) return;
      
      // Update messages state
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(msg => msg.id === newMessage.id)) {
          console.log('Message already exists, not adding duplicate');
          return prev;
        }
        
        console.log('Adding new message to state:', newMessage);
        const updated = [...prev, newMessage].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        return updated;
      });
      
      // Mark as read
      if (newMessage.sender_id !== userId) {
        supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', newMessage.id)
          .then(({ error }) => {
            if (error) console.error('Error marking message as read:', error);
          });
      }
    });
    
    // Listen for UPDATE events
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    }, async (payload) => {
      console.log('UPDATE event received:', payload);
      
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === payload.new.id) {
            return { ...msg, ...payload.new, sender: msg.sender };
          }
          return msg;
        })
      );
    });
    
    // Listen for DELETE events
    channel.on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    }, async (payload) => {
      console.log('DELETE event received:', payload);
      
      setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
    });
    
    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`Channel ${channelName} status:`, status);
    });
    
    // Store the channel for cleanup
    supabaseChannel.current = channel;
    
    // Cleanup function
    return () => {
      console.log(`Cleaning up channel for chat: ${chatId}`);
      if (supabaseChannel.current) {
        supabase.removeChannel(supabaseChannel.current);
        supabaseChannel.current = null;
      }
    };
  }, [chatId, userId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    loadMore,
    fetchMessages
  };
}; 