import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Message } from '../../types';
import { DatabaseMessage, MessageStatus } from './chatTypes';
import { validateMessage, removeDuplicateMessages } from './messageUtils';

export const useMessages = (chatId: string | null, userId: string, containerRef?: React.RefObject<HTMLDivElement>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const messagesPerPage = 50;
  const channelRef = useRef<any>(null);
  const lastMessageTimeRef = useRef<Date>(new Date());

  // Function to scroll to the bottom of the container
  const scrollToBottom = useCallback((smooth: boolean = true) => {
    if (!containerRef?.current) return;
    
    console.log('Scrolling to bottom of chat container');
    
    // Use modern scrollTo with options
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [containerRef]);

  // Scroll when new messages are added
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, loading, scrollToBottom]);

  // Force regular refresh of messages in addition to real-time
  useEffect(() => {
    if (!chatId) return;
    
    // Set up a regular poll to ensure new messages are fetched
    // This is a fallback in case real-time fails
    const intervalId = setInterval(() => {
      console.log('Polling for new messages as fallback');
      fetchLatestMessages();
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [chatId]);
  
  // Special function to just fetch the latest messages since last fetch
  const fetchLatestMessages = async () => {
    if (!chatId) return;
    try {
      const lastTime = lastMessageTimeRef.current;
      console.log(`Fetching messages newer than ${lastTime.toISOString()}`);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .gt('created_at', lastTime.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching latest messages:', error);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('No new messages found');
        return;
      }
      
      console.log(`Found ${data.length} new messages via polling`);
      
      // Get all the sender IDs
      const senderIds = Array.from(new Set(data.map(msg => msg.sender_id)));
      
      // Fetch sender profiles
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', senderIds);
      
      const profilesMap = new Map(senderProfiles?.map(p => [p.id, p]) || []);
      
      // Process messages
      const newMessages = data.map(msg => {
        const sender = profilesMap.get(msg.sender_id);
        return validateMessage({
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
          reactions: []
        } as DatabaseMessage);
      });
      
      // Update state with new messages
      setMessages(prev => {
        // Filter out duplicates
        const msgIds = new Set(prev.map(m => m.id));
        const uniqueNew = newMessages.filter(m => !msgIds.has(m.id));
        
        if (uniqueNew.length === 0) return prev;
        
        // Update last message time
        const newestMsg = newMessages[newMessages.length - 1];
        lastMessageTimeRef.current = new Date(newestMsg.created_at);
        
        // Add and sort messages
        const updatedMessages = [...prev, ...uniqueNew].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        // Schedule a scroll to bottom
        if (uniqueNew.length > 0) {
          setTimeout(() => scrollToBottom(), 100);
        }
        
        return updatedMessages;
      });
      
      // Mark messages as read
      const otherUserMsgs = data.filter(msg => msg.sender_id !== userId && !msg.read_at);
      if (otherUserMsgs.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', otherUserMsgs.map(msg => msg.id));
      }
    } catch (err) {
      console.error('Error in fetchLatestMessages:', err);
    }
  };

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

      // Update our last message time reference
      const newestMsg = messagesData.reduce((latest, msg) => {
        const msgTime = new Date(msg.created_at).getTime();
        const latestTime = new Date(latest.created_at).getTime();
        return msgTime > latestTime ? msg : latest;
      }, messagesData[0]);
      
      lastMessageTimeRef.current = new Date(newestMsg.created_at);

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
      
      // Scroll to bottom immediately for this user's message
      setTimeout(() => scrollToBottom(), 100);

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

      // Force a fetch of latest messages for all users
      await supabase.from('chat_updates').insert([
        { chat_id: chatId, updated_at: new Date().toISOString() }
      ]);

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
  }, [userId, scrollToBottom]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      console.log(`Loading more messages, page ${page + 1}`);
      fetchMessages(page + 1);
    }
  }, [loading, hasMore, page, fetchMessages]);

  // Handle real-time updates - GUARANTEED DELIVERY APPROACH
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
    
    // Use multiple approaches to ensure message delivery
    
    // 1. Basic message subscription
    const channelName = `chat-${chatId}-${Date.now()}`;
    const channel = supabase.channel(channelName);
    
    // Function to process new messages
    const processNewMessage = async (payload: any) => {
      try {
        console.log('Real-time UPDATE received:', payload);
        
        // Skip my own messages (already handled by optimistic updates)
        if (payload.new.sender_id === userId) {
          console.log('Skipping own message');
          return;
        }
        
        // Immediately trigger a fetch of latest messages
        // This is the safest approach to ensure we get all messages
        fetchLatestMessages();
        
      } catch (err) {
        console.error('Error processing new message:', err);
        // Fallback - fetch all messages if there's an error
        fetchLatestMessages();
      }
    };
    
    // Subscribe to INSERT, UPDATE events on messages table
    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, processNewMessage)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_updates',
        filter: `chat_id=eq.${chatId}`
      }, () => {
        console.log('Chat update triggered, fetching latest messages');
        fetchLatestMessages();
      })
      .subscribe((status, err) => {
        console.log(`Real-time subscription status: ${status}`, err || '');
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time messages');
          // Immediately fetch messages to ensure we have the latest
          fetchLatestMessages();
        } else {
          console.error('Error with real-time subscription:', err);
          setError('Real-time connection error');
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
    fetchMessages,
    scrollToBottom
  };
}; 