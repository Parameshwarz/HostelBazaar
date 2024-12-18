import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  File,
  Mic,
  X,
  MoreVertical,
  Search,
  Smile
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabaseClient';
import { Chat, Message } from '../types';
import { toast } from 'react-hot-toast';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { MessageBubble } from '../components/MessageBubble';

type MessageAction = 'edit' | 'delete' | 'reply' | 'copy';

const MessageOptionsMenu = ({ 
  message, 
  onAction 
}: { 
  message: Message, 
  onAction: (action: MessageAction) => void 
}) => (
  <div className="absolute right-2 top-2 bg-white shadow-lg rounded-lg py-1 min-w-[160px] z-10">
    <button 
      onClick={() => onAction('edit')} 
      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
    >
      Edit
    </button>
    <button 
      onClick={() => onAction('delete')} 
      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-red-600"
    >
      Delete
    </button>
    <button 
      onClick={() => onAction('reply')} 
      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
    >
      Reply
    </button>
    <button 
      onClick={() => onAction('copy')} 
      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
    >
      Copy
    </button>
  </div>
);

export const Messages = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(chatId || null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('item');
  const { user: authUser } = useAuthStore();

  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      console.log('No authenticated user');
      setLoading(false);
      return;
    }

    console.log('Loading chats for user:', user.id);
    fetchChats();

    // Subscribe to chat updates
    const subscription = supabase
      .channel('chats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats',
        filter: `participant_1.eq.${user.id},participant_2.eq.${user.id}` 
      }, (payload) => {
        console.log('Chat update received:', payload);
        fetchChats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      console.log('No authenticated user');
      setLoading(false);
      return;
    }

    console.log('Loading chats for user:', user.id);
    fetchChats();

    // Subscribe to chat updates
    const subscription = supabase
      .channel('chats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats',
        filter: `participant_1.eq.${user.id},participant_2.eq.${user.id}` 
      }, (payload) => {
        console.log('Chat update received:', payload);
        fetchChats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || !activeChat) return;

    // Subscribe to typing status
    const typingSubscription = supabase
      .channel(`typing:${activeChat}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== user.id) {
          setIsOtherUserTyping(true);
          // Reset typing status after 3 seconds
          setTimeout(() => setIsOtherUserTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      typingSubscription.unsubscribe();
    };
  }, [activeChat, user]);

  useEffect(() => {
    if (!user || !activeChat) return;

    // Subscribe to message updates
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `sender_id.eq.${user.id},receiver_id.eq.${user.id}` 
      }, (payload) => {
        console.log('Message update received:', payload);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user || !activeChat) return;

    const updateMessageStatus = async () => {
      if (!user || !activeChat) return;

      try {
        const { error } = await supabase
          .from('messages')
          .update({ status: 'read' })
          .eq('chat_id', activeChat)
          .neq('sender_id', user.id)
          .eq('status', 'delivered');

        if (error) {
          console.error('Error updating message status:', error);
        }
      } catch (error) {
        console.error('Error in updateMessageStatus:', error);
      }
    };

    updateMessageStatus();
  }, [activeChat, user]);

  const fetchMessages = async () => {
    if (!activeChat) return;
    
    try {
      setIsLoading(true);

      // First fetch messages with sender info
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('chat_id', activeChat)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Then fetch reactions
      if (messages && messages.length > 0) {
        const messageIds = messages.map(m => m.id);
        
        // Get reactions
        const { data: reactions, error: reactionsError } = await supabase
          .from('message_reactions')
          .select('*')
          .in('message_id', messageIds);

        if (reactionsError) throw reactionsError;

        // Get usernames for reaction users
        if (reactions && reactions.length > 0) {
          const userIds = [...new Set(reactions.map(r => r.user_id))];
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds);

          if (usersError) throw usersError;

          // Create a map of user IDs to usernames
          const userMap = new Map(users?.map(u => [u.id, u.username]));

          // Add username to reactions
          const reactionsWithUsernames = reactions.map(reaction => ({
            ...reaction,
            username: userMap.get(reaction.user_id) || 'Unknown'
          }));

          // Combine messages with their reactions
          const messagesWithReactions = messages.map(message => ({
            ...message,
            message_reactions: reactionsWithUsernames.filter(r => r.message_id === message.id)
          }));

          console.log('Messages with reactions:', messagesWithReactions);
          setMessages(messagesWithReactions);
        } else {
          setMessages(messages);
        }
        scrollToBottom();
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!activeChat) return;
    fetchMessages();
  }, [activeChat]);

  useEffect(() => {
    if (!user || !activeChat) return;

    const messagesSubscription = supabase
      .channel(`messages:${activeChat}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${activeChat}`
      }, () => {
        fetchMessages();
      })
      .subscribe();

    const reactionsSubscription = supabase
      .channel(`message_reactions:${activeChat}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'message_reactions'
      }, () => {
        fetchMessages();
      })
      .subscribe();

    // Initial fetch
    fetchMessages();

    return () => {
      messagesSubscription.unsubscribe();
      reactionsSubscription.unsubscribe();
    };
  }, [activeChat, user]);

  useEffect(() => {
    if (!user || !activeChat) return;

    // Subscribe to ALL changes in the messages table for this chat
    const messagesSubscription = supabase
      .channel(`messages:${activeChat}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${activeChat}`
      }, (payload) => {
        console.log('Message change received:', payload);
        
        if (payload.eventType === 'INSERT') {
          // Only add the message if it's not from the current user
          // (we already added our own messages optimistically)
          if (payload.new.sender_id !== user?.id) {
            setMessages(prev => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id ? payload.new as Message : msg
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => 
            prev.filter(msg => msg.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    // Subscribe to chat updates
    const chatSubscription = supabase
      .channel(`chat:${activeChat}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'chats',
        filter: `id=eq.${activeChat}`
      }, (payload) => {
        console.log('Chat update received:', payload);
        // Update the chat in the list
        setChats(prev => 
          prev.map(chat => 
            chat.id === activeChat 
              ? { ...chat, 
                  last_message: payload.new.last_message,
                  last_message_at: payload.new.last_message_at 
                }
              : chat
          )
        );
      })
      .subscribe();

    // Subscribe to reaction changes
    const reactionSubscription = supabase
      .channel('reactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'message_reactions',
        filter: `message_id=eq.${messages.map(m => m.id).join(',')}`
      }, (payload: {
        new: { message_id: string; emoji: string } | null;
        old: { message_id: string; emoji: string } | null;
        eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      }) => {
        setMessages(prev => prev.map(message => {
          if (message.id === payload.new?.message_id) {
            return {
              ...message,
              reactions: message.reactions || []
            };
          }
          return message;
        }));
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      chatSubscription.unsubscribe();
      reactionSubscription.unsubscribe();
    };
  }, [activeChat, user?.id]);

  useEffect(() => {
    // If this is a new chat initiated from an item
    if (itemId && authUser) {
      const initializeChat = async () => {
        try {
          // First get the item details to get the seller ID
          const { data: item, error: itemError } = await supabase
            .from('items')
            .select('uploader_id, title')
            .eq('id', itemId)
            .single();

          if (itemError) throw itemError;

          // Don't create chat with yourself
          if (item.uploader_id === authUser.id) {
            toast.error("You can't message yourself!");
            return;
          }

          // Check if chat already exists
          const { data: existingChat, error: chatError } = await supabase
            .from('chats')
            .select('id')
            .eq('item_id', itemId)
            .eq('participant_1', authUser.id)
            .eq('participant_2', item.uploader_id)
            .single();

          if (chatError && chatError.code !== 'PGRST116') { // PGRST116 means no rows returned
            throw chatError;
          }

          if (existingChat) {
            // Chat exists, just select it
            setActiveChat(existingChat.id);
            navigate(`/messages/${existingChat.id}`);
          } else {
            // Create new chat
            const { data: newChat, error: createError } = await supabase
              .from('chats')
              .insert({
                item_id: itemId,
                participant_1: authUser.id,
                participant_2: item.uploader_id,
                last_message: `Chat started about: ${item.title}`,
                last_message_at: new Date().toISOString()
              })
              .select()
              .single();

            if (createError) throw createError;

            setActiveChat(newChat.id);
            navigate(`/messages/${newChat.id}`);
          }
        } catch (err) {
          console.error('Error initializing chat:', err);
          toast.error('Failed to start chat');
        }
      };

      initializeChat();
    }
  }, [itemId, authUser]);

  const fetchChats = async () => {
    if (!user) return;

    try {
      console.log('Fetching chats for user:', user.id);

      // First get the chats
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('created_at', { ascending: false });

      console.log('Raw chats data:', chatsData);

      if (chatsError) {
        console.error('Error fetching chats:', chatsError);
        return;
      }

      if (!chatsData || chatsData.length === 0) {
        console.log('No chats found');
        setChats([]);
        setLoading(false);
        return;
      }

      // Get all unique participant IDs (excluding current user)
      const participantIds = chatsData
        .map(chat => [chat.participant_1, chat.participant_2])
        .flat()
        .filter(id => id !== user.id)
        .filter((id, index, self) => self.indexOf(id) === index);

      // Fetch profiles for all participants
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', participantIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      console.log('Profiles data:', profilesData);

      const profilesMap = new Map(
        profilesData?.map(profile => [profile.id, profile]) || []
      );

      const processedChats = chatsData.map((chat: any) => {
        const isParticipant1 = chat.participant_1 === user.id;
        const otherUserId = isParticipant1 ? chat.participant_2 : chat.participant_1;
        const otherUserProfile = profilesMap.get(otherUserId);

        return {
          id: chat.id,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          last_message: chat.last_message,
          last_message_at: chat.last_message_at,
          participant_1: chat.participant_1,
          participant_2: chat.participant_2,
          other_user: {
            id: otherUserId,
            username: otherUserProfile?.username || 'Unknown User',
            avatar_url: otherUserProfile?.avatar_url || '/default-avatar.png',
            is_online: false
          }
        } as Chat;
      });

      console.log('Processed chats:', processedChats);
      setChats(processedChats);

      if (!activeChat && processedChats.length > 0) {
        const firstChatId = processedChats[0].id;
        setActiveChat(firstChatId);
        navigate(`/messages/${firstChatId}`);
      }
    } catch (error) {
      console.error('Error in fetchChats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const renderDateDivider = (date: string) => (
    <div className="flex items-center justify-center my-4">
      <div className="px-4 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-500">
        {date}
      </div>
    </div>
  );

  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(message => {
      const date = message.created_at.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const formatMessageTime = (date: string) => {
    try {
      return format(new Date(date), 'h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const emojis = ['👍', '👎', '🎉', '😢', '😂', '👏'] as const;

  // Add this type for better type safety
  type ReactionType = typeof emojis[number];

  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const handleReaction = async (messageId: string, reaction_type: string) => {
    if (!user) return;

    try {
      // Get any existing reaction from this user on this message
      const { data: existingReactions, error: checkError } = await supabase
        .from('message_reactions')
        .select('id, reaction_type')
        .eq('message_id', messageId)
        .eq('user_id', user.id);

      if (checkError) throw checkError;

      const existingReaction = existingReactions?.[0];

      // If user already reacted with this emoji, remove it
      if (existingReaction?.reaction_type === reaction_type) {
        const { error: deleteError } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) throw deleteError;
      } 
      // If user had a different reaction, replace it
      else if (existingReaction) {
        const { error: updateError } = await supabase
          .from('message_reactions')
          .update({ reaction_type })
          .eq('id', existingReaction.id);

        if (updateError) throw updateError;
      }
      // If no existing reaction, add new one
      else {
        const { error: insertError } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction_type,
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      // Update the message locally instead of fetching all messages
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id !== messageId) return msg;

          const updatedReactions = [...(msg.message_reactions || [])];
          const userReactionIndex = updatedReactions.findIndex(r => r.user_id === user.id);

          if (existingReaction?.reaction_type === reaction_type) {
            // Remove reaction
            if (userReactionIndex !== -1) {
              updatedReactions.splice(userReactionIndex, 1);
            }
          } else {
            // Add or update reaction
            const newReaction = {
              id: existingReaction?.id || Date.now().toString(),
              message_id: messageId,
              user_id: user.id,
              reaction_type,
              created_at: new Date().toISOString(),
              username: user.username
            };

            if (userReactionIndex !== -1) {
              updatedReactions[userReactionIndex] = newReaction;
            } else {
              updatedReactions.push(newReaction);
            }
          }

          return {
            ...msg,
            message_reactions: updatedReactions
          };
        })
      );
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChat) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        chat_id: activeChat,
        sender_id: user.id,
        status: 'sent',
        content_type: 'text',
        reply_to_id: replyingTo?.id || null,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          *,
          profiles!sender_id(
            id,
            username,
            avatar_url
          ),
          reply_to:messages!reply_to_id(
            id,
            content,
            sender_id,
            content_type,
            deleted_at
          )
        `)
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setNewMessage('');
      setReplyingTo(null);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!user || !activeChat) return;
    
    supabase
      .channel(`typing:${activeChat}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user.id }
      });
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      await fetchMessages();
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!user || !activeChat) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('Error editing message:', error);
        toast.error('Failed to edit message');
        return;
      }

      await fetchMessages();
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      console.error('Error handling message edit:', error);
      toast.error('Failed to edit message');
    }
  };

  const shouldShowSender = (message: Message, index: number, messages: Message[]) => {
    if (message.sender_id === user?.id) return false; // Never show for own messages
    if (index === 0) return true; // Always show for first message
    const prevMessage = messages[index - 1];
    // Show if sender changed or time gap > 5 minutes
    return prevMessage.sender_id !== message.sender_id || 
      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000;
  };

  // Add this type for reactions
  type MessageReaction = {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
  };

  const renderMessages = () => {
    return messages.map((message) => (
      <MessageBubble
        key={message.id}
        message={message}
        isOwn={message.sender_id === user?.id}
        onReact={(emoji) => handleReaction(message.id, emoji)}
        onEdit={(content) => handleEditMessage(message.id, content)}
        onDelete={() => handleDeleteMessage(message.id)}
        onReply={() => handleReplyMessage(message.id)}
      />
    ));
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Please sign in to view messages</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
                activeChat === chat.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => {
                setActiveChat(chat.id);
                navigate(`/messages/${chat.id}`);
              }}
            >
              <img
                src={chat.other_user.avatar_url || '/default-avatar.png'}
                alt={chat.other_user.username}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{chat.other_user.username || 'User'}</p>
                <p className="text-sm text-gray-500 truncate">{chat.last_message || 'No messages yet'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-4">
                <button onClick={() => setActiveChat(null)} className="md:hidden">
                  <X className="h-6 w-6 text-gray-600" />
                </button>
                <div className="flex items-center space-x-3">
                  <img
                    src={chats.find(chat => chat.id === activeChat)?.other_user?.avatar_url || '/default-avatar.png'}
                    alt="Chat Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {chats.find(chat => chat.id === activeChat)?.other_user?.username || 'Chat'}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-900">
                  <Search className="h-5 w-5" />
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto bg-gray-50"
              onScroll={handleScroll}
            >
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-12" ref={messagesEndRef}>
                  <div className="space-y-6">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        No messages yet. Start a conversation!
                      </div>
                    ) : (
                      renderMessages()
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Message Input Area */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="mb-2 p-3 bg-gray-50 rounded-lg flex items-start gap-3 border-l-4 border-indigo-500 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-sm font-semibold text-indigo-600">
                        Replying to {replyingTo.sender_id === user?.id ? 'yourself' : chats.find(chat => chat.id === activeChat)?.other_user?.username}
                      </div>
                      {replyingTo.content_type !== 'text' && (
                        <span className="text-sm text-gray-500">
                          {replyingTo.content_type === 'image' ? '📷' : 
                           replyingTo.content_type === 'video' ? '🎥' : 
                           replyingTo.content_type === 'voice' ? '🎙️' : '📎'}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                      {replyingTo.content}
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}

              <form onSubmit={sendMessage} className="flex items-center space-x-4">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <File className="h-6 w-6" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Welcome to Messages</h3>
              <p className="mt-1 text-sm text-gray-500">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};