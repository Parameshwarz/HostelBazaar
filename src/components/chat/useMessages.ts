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
  const channelRef = useRef<any>(null);

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

  // Handle real-time updates - SIMPLIFIED IMPLEMENTATION
  useEffect(() => {
    if (!chatId) return;
    
    console.log(`Setting up real-time for chat ${chatId}`);
    setMessages([]);
    fetchMessages(1);
    
    // Clean up any existing subscription
    if (channelRef.current) {
      console.log('Cleaning up previous subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Use a more direct and simple subscription
    const channel = supabase.channel(`chat-${chatId}-${Date.now()}`, {
      config: { 
        broadcast: { self: false }
      }
    });
    
    // Complete message handler (processes raw message data and adds to state)
    const processNewMessage = async (payload: any) => {
      try {
        console.log('Received new message payload:', payload);
        
        // Skip messages from self (already handled by optimistic updates)
        if (payload.new.sender_id === userId) {
          console.log('Skipping message from self');
          return;
        }
        
        // Fetch sender profile for this message
        const { data: senderData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();
        
        if (!senderData) {
          console.error('Could not find sender profile');
          return;
        }
        
        // Construct full message
        const newMsg: DatabaseMessage = {
          ...payload.new,
          sender: {
            id: senderData.id,
            username: senderData.username,
            avatar_url: senderData.avatar_url
          },
          reactions: []
        };
        
        // Validate and add to message list
        const validatedMsg = validateMessage(newMsg);
        console.log('Adding new message to state:', validatedMsg);
        
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          if (prev.some(m => m.id === validatedMsg.id)) {
            return prev;
          }
          
          // Add and sort messages
          const updated = [...prev, validatedMsg].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          return updated;
        });
        
        // Mark as read
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', payload.new.id);
          
      } catch (err) {
        console.error('Error processing new message:', err);
      }
    };
    
    // Subscribe to message inserts
    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, processNewMessage)
      .subscribe((status, err) => {
        console.log(`Subscription status: ${status}`, err || '');
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to real-time messages:', err);
          setError('Failed to connect to real-time messages');
        }
      });
      
    channelRef.current = channel;
    
    return () => {
      console.log('Cleaning up real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
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