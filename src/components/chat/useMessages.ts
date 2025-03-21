import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Message, DatabaseMessage } from '../../types';
import { validateMessage, removeDuplicateMessages } from './messageUtils';

export const useMessages = (chatId: string | null, userId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const messagesPerPage = 50;

  const fetchMessages = useCallback(async (pageNum: number = 1) => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);

      // First fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * messagesPerPage, pageNum * messagesPerPage - 1);

      if (messagesError) throw messagesError;

      if (!messagesData) {
        setMessages([]);
        return;
      }

      // Get all unique sender IDs
      const senderIds = new Set(messagesData.map(msg => msg.sender_id));
      const replyToIds = messagesData
        .map(msg => msg.reply_to_id)
        .filter((id): id is string => id !== null);

      // Fetch sender profiles
      const { data: senderProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', Array.from(senderIds));

      if (profilesError) throw profilesError;

      // Create a map of profiles
      const profilesMap = new Map(senderProfiles?.map(p => [p.id, p]) || []);

      // Fetch reply messages if any
      let replyMessages: Message[] = [];
      if (replyToIds.length > 0) {
        const { data: replyData } = await supabase
          .from('messages')
          .select('*')
          .in('id', replyToIds);

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
          } : undefined,
          reply_to: replyTo
        };
      });

      // Validate and sort messages
      const validatedMessages = transformedMessages.map(msg => validateMessage(msg as DatabaseMessage));
      const uniqueMessages = removeDuplicateMessages(validatedMessages);
      const sortedMessages = uniqueMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

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
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadMessages.map(msg => msg.id));

        if (updateError) console.error('Error marking messages as read:', updateError);
      }

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [chatId, userId]);

  const sendMessage = useCallback(async (content: string, chatId: string) => {
    try {
      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        sender_id: userId,
        content,
        content_type: 'text',
        status: 'sending',
        created_at: new Date().toISOString(),
        sender: {
          id: userId,
          username: 'You',
          avatar_url: null
        }
      };

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

      if (insertError) throw insertError;

      // Update chat's last message
      const { error: updateError } = await supabase
        .from('chats')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (updateError) throw updateError;

      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? validateMessage(messageData as DatabaseMessage) : msg
        )
      );

      return messageData;
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
      throw err;
    }
  }, [userId]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMessages(page + 1);
    }
  }, [loading, hasMore, page, fetchMessages]);

  useEffect(() => {
    if (chatId) {
      fetchMessages(1);
    }
  }, [chatId, fetchMessages]);

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