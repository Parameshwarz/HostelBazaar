import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  File,
  Mic,
  X,
  MoreVertical,
  Search,
  Smile,
  ChevronDown,
  Pin,
  BellOff,
  Trash2,
  Ban,
  Check,
  AlertCircle,
  Bold,
  Italic,
  Paperclip
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Chat, Message, MessageReaction, MessageSender, DatabaseMessage, DatabaseMessageReaction } from '../types';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { MessageBubble } from '../components/MessageBubble';
import { ReplyPreview } from '../components/ReplyPreview';
import DealProgress from '../components/DealProgress';
import SmartReplies from '../components/SmartReplies';
import UserTrustScore from '../components/UserTrustScore';
import { MessageStatusIndicator } from '../components/MessageStatusIndicator';
import { MessageActions } from '../components/MessageActions';

type MessageAction = 'edit' | 'delete' | 'reply' | 'copy';

// Add these type definitions at the top
type UnreadCount = {
  chat_id: string;
  count: number;
};

// Update UserTrustInfo interface if not already imported
type LocalUserTrustInfo = {
  userId: string;
  username: string;
  trustScore: number;
  responseTime: string;
  completedDeals: number;
  positiveRatings: number;
  memberSince: string;
  badges: string[];
};

export const Messages = () => {
  // Move useRef inside component
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const headerOptionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(chatId || null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('item');
  const { user: authUser } = useAuthStore();
  const [showHeaderOptions, setShowHeaderOptions] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(-1);
  const [matchingMessages, setMatchingMessages] = useState<Message[]>([]);
  const [dealStatus, setDealStatus] = useState({
    initialPrice: undefined as number | undefined,
    finalPrice: undefined as number | undefined,
    meetingScheduled: false,
    locationAgreed: false,
    dealCompleted: false
  });
  const [itemDetails, setItemDetails] = useState<{
    title: string;
    price: number;
    condition: string;
  } | undefined>(undefined);
  const [userTrustInfo, setUserTrustInfo] = useState<LocalUserTrustInfo | undefined>(undefined);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [failedMessages, setFailedMessages] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showDealProgress, setShowDealProgress] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Add message validation constants
  const MIN_MESSAGE_LENGTH = 2;
  const MAX_MESSAGE_LENGTH = 1000;

  // Add timestamp validation
  const validateTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    return date > now ? now.toISOString() : timestamp;
  };

  // Add message content validation
  const isValidMessageContent = (content: string): boolean => {
    const trimmed = content.trim();
    return trimmed.length >= MIN_MESSAGE_LENGTH && trimmed.length <= MAX_MESSAGE_LENGTH;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/login');
      }
    };

    checkSession();
  }, [user, navigate]);

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

    // Subscribe to message updates with correct filter
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${activeChat}` 
      }, (payload) => {
        console.log('Message update received:', payload);
        // Fetch latest messages instead of direct update
        fetchMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, activeChat]);

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

  const processChats = (chatsData: any[]): Chat[] => {
    return chatsData
      .filter(chat => {
        // Filter out invalid chats
        const hasValidParticipants = chat.participant_1 && chat.participant_2;
        const hasValidOtherUser = chat.other_user?.[0]?.id;
        return hasValidParticipants && hasValidOtherUser;
      })
      .map(chat => {
        const otherUser = chat.other_user?.[0] || {};
        const lastMessage = chat.messages?.[0];
        
        // Validate last message
        const validatedLastMessage = lastMessage?.content?.trim() 
          ? lastMessage.content 
          : 'No messages yet';

        return {
          id: chat.id,
          participant_1: chat.participant_1,
          participant_2: chat.participant_2,
          item_id: chat.item_id,
          last_message: validatedLastMessage,
          last_message_at: lastMessage?.created_at || chat.created_at,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          is_pinned: Boolean(chat.is_pinned),
          meeting_scheduled: Boolean(chat.meeting_scheduled),
          location_agreed: Boolean(chat.location_agreed),
          deal_completed: Boolean(chat.deal_completed),
          other_user: {
            id: otherUser.id,
            username: otherUser.username || 'Unknown User',
            avatar_url: otherUser.avatar_url || null,
            last_seen: otherUser.last_seen || null,
            trust_score: otherUser.trust_score || 0
          }
        };
      })
      .sort((a, b) => {
        // Sort by pinned status first
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        
        // Then sort by last message time
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });
  };

  const validateMessage = (message: DatabaseMessage): Message => {
    return {
      id: message.id,
      chat_id: message.chat_id,
      sender_id: message.sender_id,
      content: message.content,
      content_type: message.content_type,
      status: message.status,
      created_at: message.created_at,
      updated_at: message.updated_at,
      read_at: message.read_at,
      reply_to_id: message.reply_to_id,
      reply_to: message.reply_to ? validateMessage(message.reply_to) : null,
      sender: message.sender,
      reactions: message.reactions || []
    };
  };

  const removeDuplicateMessages = (messages: Message[]): Message[] => {
    const seen = new Set();
    return messages.filter(message => {
      const duplicate = seen.has(message.id);
      seen.add(message.id);
      return !duplicate;
    });
  };

  const groupMessagesByDate = (messages: Message[]): Record<string, Message[]> => {
    return messages.reduce((groups, message) => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as Record<string, Message[]>);
  };

  const handleSendMessage = async (content: string, replyToId?: string) => {
    if (!user || !selectedChat) return;

    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      chat_id: selectedChat.id,
      sender_id: user.id,
      content,
      content_type: 'text',
      status: 'sending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      read_at: null,
      reply_to_id: replyToId || null,
      reply_to: replyToId ? messages.find(m => m.id === replyToId) || null : null,
      sender: {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url
      },
      reactions: []
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([{
          chat_id: selectedChat.id,
          sender_id: user.id,
          content,
          content_type: 'text',
          status: 'sent',
          reply_to_id: replyToId
        }])
        .select('*, sender:profiles(*), reply_to:messages(*), reactions:message_reactions(*)')
        .single();

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? validateMessage(newMessage) : msg
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
      toast.error('Failed to send message');
    }
  };

  const fetchMessages = async () => {
    if (!activeChat) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching messages for chat:', activeChat);
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          chat_id,
          content,
          content_type,
          sender_id,
          created_at,
          status,
          read_at,
          sender:profiles!sender_id(
            id,
            username,
            avatar_url
          ),
          reply_to:messages(
            id,
            chat_id,
            content,
            content_type,
            sender_id,
            created_at,
            status,
            read_at,
            sender:profiles!sender_id(
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq('chat_id', activeChat)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
        throw error;
      }

      // After fetching messages, get reactions separately
      const { data: reactions, error: reactionsError } = await supabase
        .from('message_reactions')
        .select(`
          id,
          message_id,
          user_id,
          emoji,
          created_at,
          user:profiles!user_id(
            id,
            username,
            avatar_url
          )
        `)
        .in('message_id', messages?.map(m => m.id) || []);

      if (reactionsError) {
        console.error('Error fetching reactions:', reactionsError);
      }

      const messageReactions = reactions?.reduce((acc, reaction) => {
        if (!acc[reaction.message_id]) {
          acc[reaction.message_id] = [];
        }
        acc[reaction.message_id].push(reaction);
        return acc;
      }, {} as Record<string, DatabaseMessageReaction[]>) || {};

      console.log('Fetched messages:', messages);

      // Transform and validate messages
      const validatedMessages: Message[] = (messages || []).map((msg: DatabaseMessage) => {
        const replyTo = msg.reply_to?.[0];
        const replyToMessage: Message | null = replyTo ? {
          id: replyTo.id,
          chat_id: replyTo.chat_id,
          content: replyTo.content,
          content_type: replyTo.content_type || 'text',
          sender_id: replyTo.sender_id,
          created_at: replyTo.created_at,
          status: replyTo.status || 'sent',
          read_at: replyTo.read_at,
          sender: replyTo.sender || {
            id: replyTo.sender_id,
            username: 'Unknown User',
            avatar_url: null
          },
          reply_to_id: null,
          reply_to: null,
          reactions: []
        } : null;

        return {
          id: msg.id,
          chat_id: msg.chat_id,
          content: msg.content?.trim() || '',
          content_type: msg.content_type || 'text',
          sender_id: msg.sender_id,
          created_at: validateTimestamp(msg.created_at),
          status: msg.status || 'sent',
          read_at: msg.read_at,
          sender: msg.sender || {
            id: msg.sender_id,
            username: 'Unknown User',
            avatar_url: null
          },
          reply_to_id: replyTo?.id || null,
          reply_to: replyToMessage,
          reactions: messageReactions[msg.id] || []
        };
      });

      console.log('Validated messages:', validatedMessages);

      // Group messages by date and remove duplicates
      const grouped = groupMessagesByDate(validatedMessages);
      const sortedMessages = Object.values(grouped)
        .flat()
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .filter(msg => isValidMessageContent(msg.content));

      setMessages(sortedMessages);
      setIsLoading(false);

      // Mark messages as read
      if (sortedMessages.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ status: 'seen' })
          .eq('chat_id', activeChat)
          .neq('sender_id', user?.id)
          .in('status', ['sent', 'delivered']);

        if (updateError) {
          console.error('Error updating message status:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast.error('Failed to load messages');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!activeChat) {
      console.log('No active chat selected');
      return;
    }
    console.log('Active chat changed to:', activeChat);
    console.log('Current user:', user);
    fetchMessages();
  }, [activeChat]);

  useEffect(() => {
    if (!activeChat) return;
    
    console.log('Setting up message subscription for chat:', activeChat);
    const subscription = supabase
      .channel(`messages:${activeChat}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${activeChat}`
        },
        async (payload) => {
          console.log('Message subscription event:', payload);
          
          if (payload.eventType === 'INSERT') {
            console.log('New message received:', payload.new);
            // Fetch the complete message with sender info
            const { data: newMessage, error } = await supabase
              .from('messages')
              .select(`
                id,
                chat_id,
                content,
                content_type,
                sender_id,
                created_at,
                status,
                read_at,
                sender:profiles!sender_id(
                  id,
                  username,
                  avatar_url
                ),
                reactions:message_reactions(
                  id,
                  message_id,
                  user_id,
                  emoji,
                  created_at,
                  user:profiles!user_id(
                    id,
                    username,
                    avatar_url
                  )
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching new message:', error);
              return;
            }

            const dbMessage = newMessage as DatabaseMessage;
            const validatedMessage: Message = {
              id: dbMessage.id,
              chat_id: dbMessage.chat_id,
              content: dbMessage.content?.trim() || '',
              content_type: dbMessage.content_type || 'text',
              sender_id: dbMessage.sender_id,
              created_at: validateTimestamp(dbMessage.created_at),
              status: dbMessage.status || 'sent',
              read_at: dbMessage.read_at,
              sender: dbMessage.sender || {
                id: dbMessage.sender_id,
                username: 'Unknown User',
                avatar_url: null
              },
              reply_to_id: null,
              reply_to: null,
              reactions: (dbMessage.reactions || []).map((reaction: DatabaseMessageReaction) => ({
                id: reaction.id,
                message_id: reaction.message_id,
                user_id: reaction.user_id,
                emoji: reaction.emoji,
                created_at: reaction.created_at,
                user: reaction.user || {
                  id: reaction.user_id,
                  username: 'Unknown User',
                  avatar_url: null
                }
              }))
            };

            setMessages(prev => {
              const exists = prev.some(msg => msg.id === validatedMessage.id);
              if (exists) return prev;
              return [...prev, validatedMessage];
            });
          } else if (payload.eventType === 'UPDATE') {
            console.log('Message updated:', payload.new);
            // Fetch the complete updated message
            const { data: updatedMessage, error } = await supabase
              .from('messages')
              .select(`
                id,
                chat_id,
                content,
                content_type,
                sender_id,
                created_at,
                status,
                read_at,
                sender:profiles!sender_id(
                  id,
                  username,
                  avatar_url
                ),
                reactions:message_reactions(
                  id,
                  message_id,
                  user_id,
                  emoji,
                  created_at,
                  user:profiles!user_id(
                    id,
                    username,
                    avatar_url
                  )
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching updated message:', error);
              return;
            }

            const dbMessage = updatedMessage as DatabaseMessage;
            const validatedMessage: Message = {
              id: dbMessage.id,
              chat_id: dbMessage.chat_id,
              content: dbMessage.content?.trim() || '',
              content_type: dbMessage.content_type || 'text',
              sender_id: dbMessage.sender_id,
              created_at: validateTimestamp(dbMessage.created_at),
              status: dbMessage.status || 'sent',
              read_at: dbMessage.read_at,
              sender: dbMessage.sender || {
                id: dbMessage.sender_id,
                username: 'Unknown User',
                avatar_url: null
              },
              reply_to_id: null,
              reply_to: null,
              reactions: (dbMessage.reactions || []).map((reaction: DatabaseMessageReaction) => ({
                id: reaction.id,
                message_id: reaction.message_id,
                user_id: reaction.user_id,
                emoji: reaction.emoji,
                created_at: reaction.created_at,
                user: reaction.user || {
                  id: reaction.user_id,
                  username: 'Unknown User',
                  avatar_url: null
                }
              }))
            };

            handleMessageUpdate(validatedMessage);
          } else if (payload.eventType === 'DELETE') {
            console.log('Message deleted:', payload.old);
            const deletedMessage = payload.old;
            setMessages(prev =>
              prev.filter(msg => msg.id !== deletedMessage.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Message subscription status:', status);
      });

    return () => {
      console.log('Cleaning up message subscription');
      subscription.unsubscribe();
    };
  }, [activeChat]);

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

  // Mock data for missing database columns
  const mockUserTrustInfo = {
    trustScore: 85,
    responseTime: "< 30 mins",
    completedDeals: 12,
    positiveRatings: 95,
    memberSince: "Jan 2024",
    badges: ["Quick Responder", "Trusted Seller", "Deal Master"]
  };

  const mockDealStatus = {
    initialPrice: 1500,
    finalPrice: 1200,
    meetingScheduled: true,
    locationAgreed: true,
    dealCompleted: false
  };

  const fetchChats = async () => {
    if (!user) return;

    try {
      console.log('Fetching chats for user:', user.id);
      
      // Get all chats for the user
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (chatsError) {
        console.error('Error fetching chats:', chatsError);
        throw chatsError;
      }

      if (!chatsData || chatsData.length === 0) {
        console.log('No chats found');
        setChats([]);
        setLoading(false);
        return;
      }

      console.log('Found chats:', chatsData);

      // Get all other users' profiles in one query
      const otherUserIds = chatsData.map(chat => 
        chat.participant_1 === user.id ? chat.participant_2 : chat.participant_1
      );

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', otherUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Get last messages for each chat
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .in('chat_id', chatsData.map(c => c.id))
        .order('created_at', { ascending: false });

      // Process the chats
      const processedChats = chatsData.map(chat => {
        const otherUserId = chat.participant_1 === user.id ? chat.participant_2 : chat.participant_1;
        const otherUserProfile = profilesData?.find(profile => profile.id === otherUserId);
        const lastMessage = messagesData?.find(msg => msg.chat_id === chat.id);

        return {
          id: chat.id,
          participant_1: chat.participant_1,
          participant_2: chat.participant_2,
          item_id: chat.item_id,
          last_message: lastMessage?.content || 'No messages yet',
          last_message_at: lastMessage?.created_at || chat.created_at,
          created_at: chat.created_at,
          is_pinned: false,
          meeting_scheduled: false,
          location_agreed: false,
          deal_completed: false,
          is_blocked: false, // We'll implement blocking later
          is_muted: false, // We'll implement muting later
          other_user: {
            id: otherUserId,
            username: otherUserProfile?.username || 'Unknown User',
            avatar_url: otherUserProfile?.avatar_url || null
          }
        } as Chat;
      });

      console.log('Processed chats:', processedChats);
      setChats(processedChats);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchChats:', error);
      toast.error('Failed to load chats');
      setLoading(false);
    }
  };

  // Update fetchUserTrustInfo to use mock data
  const fetchUserTrustInfo = async (userId: string) => {
    const chat = chats.find(c => c.id === activeChat);
    // Return mock data instead of querying non-existent table
    setUserTrustInfo({
      userId,
      username: chat?.other_user?.username || "User",
      ...mockUserTrustInfo
    });
  };

  // Update fetchDealStatus to use mock data
  const fetchDealStatus = async (chatId: string) => {
    // Return mock data instead of querying non-existent columns
    setDealStatus(mockDealStatus);
  };

  useEffect(() => {
    const itemId = searchParams.get('item');
    if (itemId && user) {
      const initializeChat = async () => {
        try {
          // Get item details
          const { data: item, error: itemError } = await supabase
            .from('items')
            .select('*')
            .eq('id', itemId)
            .single();

          if (itemError) throw itemError;

          // Check if chat already exists
          const { data: existingChat, error: chatError } = await supabase
            .from('chats')
            .select('id')
            .or(`and(participant_1.eq.${user.id},participant_2.eq.${item.uploader_id}),and(participant_1.eq.${item.uploader_id},participant_2.eq.${user.id})`)
            .eq('item_id', itemId)
            .single();

          if (chatError && chatError.code !== 'PGRST116') {
            throw chatError;
          }

          if (existingChat) {
            navigate(`/messages/${existingChat.id}`);
            return;
          }

          // Create new chat
          const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert({
              participant_1: user.id,
              participant_2: item.uploader_id,
              item_id: itemId
            })
            .select('id')
            .single();

          if (createError) throw createError;

          if (newChat) {
            navigate(`/messages/${newChat.id}`);
          }
        } catch (error) {
          console.error('Error initializing chat:', error);
          toast.error('Failed to start chat');
          navigate('/messages');
        }
      };

      initializeChat();
    }
  }, [user, searchParams]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const lastMessage = messagesContainerRef.current.lastElementChild;
      if (lastMessage) {
        // Scroll to show the last message with some padding
        lastMessage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end' 
        });
      }
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // Adjust threshold to consider message height
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150; // Increased threshold
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    // Only scroll on new messages, not on reactions or edits
    const lastMessage = messages[messages.length - 1];
    const isNewMessage = lastMessage?.id?.toString().startsWith('temp-') || 
      messages.length === 1 || // First message
      (messages.length >= 2 && 
        new Date(lastMessage?.created_at).getTime() > 
        new Date(messages[messages.length - 2]?.created_at).getTime()
      );

    if (isNewMessage) {
      scrollToBottom();
    }
  }, [messages]);

  const renderDateDivider = (date: string) => (
    <div className="flex items-center justify-center my-4">
      <div className="px-4 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-500">
        {date}
      </div>
    </div>
  );

  const formatMessageTime = (date: string) => {
    try {
      return format(new Date(date), 'h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const emojis = ['', '👎', '🎉', '😢', '😂', '👏'] as const;

  // Add this type for better type safety
  type ReactionType = typeof emojis[number];

  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const reaction: MessageReaction = {
        id: `${messageId}-${user.id}-${emoji}`,
        message_id: messageId,
        user_id: user.id,
        emoji,
        username: user.user_metadata?.username || 'Unknown User',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('message_reactions')
        .upsert(reaction);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId) return msg;
        return {
          ...msg,
          reactions: [...(msg.reactions || []), reaction]
        };
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const updateMessageStatus = async (chatId: string, newStatus: 'delivered' | 'seen') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: newStatus })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
        .in('status', newStatus === 'seen' ? ['delivered'] : ['sent']);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  // Update message status when chat is opened
  useEffect(() => {
    if (!activeChat || !user) return;
    updateMessageStatus(activeChat, 'seen');
  }, [activeChat, user]);

  // Subscribe to message status updates
  useEffect(() => {
    if (!user || !activeChat) return;

    const subscription = supabase
      .channel(`message_status:${activeChat}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${activeChat}`
      }, (payload) => {
        // Update local message status
        setMessages(prev => prev.map(msg => 
          msg.id === payload.new.id 
            ? { ...msg, status: payload.new.status }
            : msg
        ));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [activeChat, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChat || sendingMessage) return;

    const tempId = 'temp-' + Date.now();
    const messageData = {
      content: newMessage.trim(),
      chat_id: activeChat,
      sender_id: user.id,
      reply_to_id: replyingTo?.id || null,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    try {
      setSendingMessage(true);
      setMessages(prev => [...prev, { 
        ...messageData, 
        id: tempId,
        sender: {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          avatar_url: null
        },
        reply_to: replyingTo,
        message_reactions: [],
        content_type: 'text'
      } as Message]);
      
      setNewMessage('');
      setReplyingTo(null);

      const { data: insertedMessage, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? {
          ...insertedMessage,
          sender: {
            id: user.id,
            username: user.email?.split('@')[0] || 'User',
            avatar_url: null
          },
          content_type: 'text',
          message_reactions: []
        } as Message : msg
      ));
      setFailedMessages(prev => prev.filter(id => id !== tempId));

    } catch (error) {
      console.error('Error sending message:', error);
      setFailedMessages(prev => [...prev, tempId]);
      toast.error('Failed to send message. Click to retry.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Add retry functionality
  const retryMessage = async (tempId: string) => {
    const failedMessage = messages.find(msg => msg.id === tempId);
    if (!failedMessage) return;

    setFailedMessages(prev => prev.filter(id => id !== tempId));
    setMessages(prev => prev.filter(msg => msg.id !== tempId));
    
    const messageData = {
      content: failedMessage.content,
      chat_id: failedMessage.chat_id,
      sender_id: failedMessage.sender_id,
      reply_to_id: failedMessage.reply_to_id,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    try {
      const { data: insertedMessage, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, {
        ...insertedMessage,
        sender: failedMessage.sender,
        content_type: 'text',
        message_reactions: []
      } as Message]);

    } catch (error) {
      console.error('Error retrying message:', error);
      setMessages(prev => [...prev, failedMessage]);
      setFailedMessages(prev => [...prev, tempId]);
      toast.error('Failed to send message. Try again.');
    }
  };

  // Add unread count tracking
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCounts = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('chat_id, status')
        .eq('status', 'delivered')
        .neq('sender_id', user.id);

      if (error) {
        console.error('Error fetching unread counts:', error);
        return;
      }

      // Count messages manually
      const counts = data.reduce((acc: Record<string, number>, msg) => {
        acc[msg.chat_id] = (acc[msg.chat_id] || 0) + 1;
        return acc;
      }, {});

      setUnreadCounts(counts);
    };

    fetchUnreadCounts();
  }, [user]);

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
      const { error } = await supabase
        .from('messages')
        .update({ status: 'deleted' })
        .eq('id', messageId);

      if (error) throw error;

      // Update the message in the local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'deleted' } 
            : msg
        )
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Make sure user can only edit their own messages

      if (error) {
        console.error('Error editing message:', error);
        toast.error('Failed to edit message');
        return;
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, edited_at: new Date().toISOString() }
          : msg
      ));
      toast.success('Message edited');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleReplyMessage = (messageId: string) => {
    const messageToReply = messages.find(msg => msg.id === messageId);
    if (!messageToReply) return;
    
    setReplyingTo(messageToReply);
    
    // Focus input after setting reply
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
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
    username: string;
    created_at: string;
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });

      // Add highlight effect
      messageElement.classList.add('bg-indigo-100/50');
      setTimeout(() => {
        messageElement.classList.remove('bg-indigo-100/50');
      }, 2000);
    }
  };

  const renderMessages = () => {
    return messages.map((message, index) => {
      const isOwnMessage = message.sender_id === user?.id;
      const showSender = shouldShowSender(message, index, messages);
      const showTimestamp = shouldShowTimestamp(message, index);

      return (
        <div
          key={message.id}
          id={`message-${message.id}`}
          className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} mb-4`}
        >
          {showTimestamp && (
            <div className="text-xs text-gray-500 mb-1 px-2">
              {formatMessageTimestamp(message.created_at)}
            </div>
          )}
          <MessageBubble
            message={message}
            isOwnMessage={isOwnMessage}
            showSender={showSender}
            onReply={() => handleReplyMessage(message.id)}
            onDelete={() => handleDeleteMessage(message.id)}
            onEdit={(content) => handleEditMessage(message.id, content)}
          />
        </div>
      );
    });
  };

  // Add the getInitialAvatar helper function at the top
  const getInitialAvatar = (username: string) => {
    const initial = username?.charAt(0)?.toUpperCase() || '?';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    const colorIndex = username?.length ? username.length % colors.length : 0;
    return { initial, bgColor: colors[colorIndex] };
  };

  const shouldShowTimestamp = (message: Message, index: number) => {
    if (index === 0) return true; // Always show for first message
    
    const prevMessage = messages[index - 1];
    const timeGap = new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime();
    const senderChanged = prevMessage.sender_id !== message.sender_id;
    
    // Show timestamp if:
    // 1. Sender changed OR
    // 2. Time gap is more than 15 minutes
    return senderChanged || timeGap > 15 * 60 * 1000;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerOptionsRef.current && !headerOptionsRef.current.contains(event.target as Node)) {
        setShowHeaderOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePinChat = async () => {
    if (!user || !activeChat) return;

    try {
      if (isPinned) {
        await supabase
          .from('pinned_chats')
          .delete()
          .eq('user_id', user.id)
          .eq('chat_id', activeChat);
        
        // Update local state immediately
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => 
            chat.id === activeChat ? { ...chat, is_pinned: false } : chat
          );
          // Re-sort chats
          return updatedChats.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.last_message_at || '').getTime() - new Date(a.last_message_at || '').getTime();
          });
        });
        
        toast.success('Chat unpinned');
        setIsPinned(false);
      } else {
        await supabase
          .from('pinned_chats')
          .insert({
            user_id: user.id,
            chat_id: activeChat
          });
        
        // Update local state immediately
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => 
            chat.id === activeChat ? { ...chat, is_pinned: true } : chat
          );
          // Re-sort chats
          return updatedChats.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.last_message_at || '').getTime() - new Date(a.last_message_at || '').getTime();
          });
        });
        
        toast.success('Chat pinned');
        setIsPinned(true);
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to update pin status');
    }
    setShowHeaderOptions(false);
  };

  useEffect(() => {
    if (!activeChat || !user) return;
    
    const checkChatStatus = async () => {
      const otherUser = chats.find(chat => chat.id === activeChat)?.other_user;
      if (!otherUser) return;

      try {
        // First check if the tables exist and are accessible
        const { count: blockedCount, error: countError } = await supabase
          .from('blocked_users')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('Error accessing blocked_users table:', countError);
          return;
        }

        // Check if blocked with error handling
        const { data: blockedData, error: blockedError } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('blocker_id', user.id)
          .eq('blocked_id', otherUser.id)
          .limit(1);

        if (blockedError) {
          console.error('Error checking blocked status:', blockedError);
        } else {
          setIsBlocked(blockedData && blockedData.length > 0);
        }

        // Check if muted with error handling
        const { data: mutedData, error: mutedError } = await supabase
          .from('muted_chats')
          .select('id')
          .eq('user_id', user.id)
          .eq('chat_id', activeChat)
          .limit(1);

        if (mutedError) {
          console.error('Error checking muted status:', mutedError);
        } else {
          setIsMuted(mutedData && mutedData.length > 0);
        }

      } catch (error) {
        console.error('Error in checkChatStatus:', error);
      }
    };

    // Add a small delay to ensure auth is properly initialized
    const timer = setTimeout(checkChatStatus, 500);
    return () => clearTimeout(timer);
  }, [activeChat, user, chats]);

  const handleBlockUser = async () => {
    if (!user || !activeChat) return;
    
    const chat = chats.find(c => c.id === activeChat);
    if (!chat?.other_user) return;

    try {
      if (isBlocked) {
        const { error } = await supabase
          .from('blocked_users')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', chat.other_user.id);

        if (error) {
          console.error('Error unblocking user:', error);
          throw error;
        }
        
        toast.success('User unblocked');
        setIsBlocked(false);
      } else {
        const { error } = await supabase
          .from('blocked_users')
          .upsert({  // Use upsert instead of insert to handle potential duplicates
            blocker_id: user.id,
            blocked_id: chat.other_user.id
          });

        if (error) {
          console.error('Error blocking user:', error);
          throw error;
        }
        
        toast.success('User blocked');
        setIsBlocked(true);
      }
    } catch (error) {
      console.error('Error toggling block:', error);
      toast.error('Failed to update block status');
    }
    setShowHeaderOptions(false);
  };

  const handleClearChat = async () => {
    if (!user || !activeChat) return;

    try {
      await supabase
        .from('messages')
        .update({ status: 'deleted' })
        .eq('chat_id', activeChat)
        .eq('sender_id', user.id);
      
      // Update local state
      setMessages([]);
      toast.success('Chat cleared');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat');
    }
    setShowHeaderOptions(false);
  };

  const handleMuteNotifications = async () => {
    if (!user || !activeChat) return;

    try {
      if (isMuted) {
        const { error } = await supabase
          .from('muted_chats')
          .delete()
          .eq('user_id', user.id)
          .eq('chat_id', activeChat);

        if (error) {
          console.error('Error unmuting chat:', error);
          throw error;
        }
        
        toast.success('Chat unmuted');
        setIsMuted(false);
      } else {
        const { error } = await supabase
          .from('muted_chats')
          .upsert({  // Use upsert instead of insert to handle potential duplicates
            user_id: user.id,
            chat_id: activeChat
          });

        if (error) {
          console.error('Error muting chat:', error);
          throw error;
        }
        
        toast.success('Chat muted');
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast.error('Failed to update mute status');
    }
    setShowHeaderOptions(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!searchQuery.trim() || !activeChat) return;

    try {
      // If we already have matching messages, cycle through them
      if (matchingMessages.length > 0) {
        const nextIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : matchingMessages.length - 1;
        setCurrentSearchIndex(nextIndex);
        
        // Remove all existing highlights first
        document.querySelectorAll('.highlight-message').forEach(el => {
          el.classList.remove('highlight-message');
        });

        // Add highlight to the current message
        const messageElement = document.getElementById(`message-${matchingMessages[nextIndex].id}`);
        if (messageElement) {
          messageElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
          
          // Force a reflow to restart the animation
          void messageElement.offsetWidth;
          messageElement.classList.add('highlight-message');
        }
        return;
      }

      // If this is a new search, fetch matching messages
      const { data, error } = await supabase
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
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setMatchingMessages(data);
        setCurrentSearchIndex(data.length - 1);
        
        // Remove all existing highlights first
        document.querySelectorAll('.highlight-message').forEach(el => {
          el.classList.remove('highlight-message');
        });

        // Add highlight to the first match
        const messageElement = document.getElementById(`message-${data[data.length - 1].id}`);
        if (messageElement) {
          messageElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
          
          // Force a reflow to restart the animation
          void messageElement.offsetWidth;
          messageElement.classList.add('highlight-message');
        }
      } else {
        toast.error('No messages found');
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      toast.error('Failed to search messages');
    }
  };

  // Add effect to fetch deal status when chat changes
  useEffect(() => {
    if (activeChat) {
      fetchDealStatus(activeChat);
    }
  }, [activeChat]);

  // Add effect to fetch item details when chat changes
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!activeChat) return;
      
      try {
        const { data: chat, error: chatError } = await supabase
          .from('chats')
          .select('item_id')
          .eq('id', activeChat)
          .single();

        if (chatError || !chat.item_id) return;

        const { data: item, error: itemError } = await supabase
          .from('items')
          .select('title, price, condition')
          .eq('id', chat.item_id)
          .single();

        if (itemError) throw itemError;

        setItemDetails(item);
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    };

    fetchItemDetails();
  }, [activeChat]);

  // Add handler for smart reply selection
  const handleSmartReply = (reply: string) => {
    setNewMessage(reply);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Add effect to fetch user trust info when chat changes
  useEffect(() => {
    const fetchUserTrustInfo = async () => {
      if (!activeChat || !user) return;
      
      const chat = chats.find(c => c.id === activeChat);
      if (!chat?.other_user) return;

      // Use mock data with the actual username
      const trustInfo = {
        ...mockUserTrustInfo,
        userId: chat.other_user.id,
        username: chat.other_user.username
      };
      
      setUserTrustInfo(trustInfo);
    };

    fetchUserTrustInfo();
  }, [activeChat, user, chats]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);
    setSelectedFiles(selectedFiles);

    // Handle file upload
    // This is a placeholder implementation. You might want to implement a proper file upload mechanism
    // based on your requirements.
    console.log('Selected files:', selectedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const handleMessageUpdate = (updatedMessage: Message) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === updatedMessage.id ? updatedMessage : msg
      )
    );
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] overflow-x-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 bg-white shrink-0">
        <div className="p-3 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">Messages</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
              <p className="text-gray-500 text-center">No chats yet</p>
              <p className="text-sm text-gray-400 text-center">
                Start a conversation by clicking on "Message" on any item
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <motion.div
                key={chat.id}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 
                  ${activeChat === chat.id ? 'bg-gray-100' : ''}`}
                onClick={() => {
                  setActiveChat(chat.id);
                  navigate(`/messages/${chat.id}`);
                }}
              >
                <div className="flex-1 flex items-center gap-3">
                  <div className="relative">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium
                        ${getInitialAvatar(chat.other_user.username).bgColor}`}
                    >
                      {getInitialAvatar(chat.other_user.username).initial}
                    </div>
                    {unreadCounts[chat.id] > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {unreadCounts[chat.id]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate max-w-[150px]">{chat.other_user.username}</p>
                      {chat.is_pinned && (
                        <Pin className="w-3 h-3 text-indigo-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {chat.last_message || 'No messages yet'}
                    </p>
                    {chat.last_message_at && (
                      <p className="text-xs text-gray-400">
                        {format(new Date(chat.last_message_at), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header with options menu */}
        <div className="h-14 px-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveChat(null)} className="md:hidden">
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
                  ${getInitialAvatar(chats.find(chat => chat.id === activeChat)?.other_user?.username || '').bgColor}`}
                >
                  {getInitialAvatar(chats.find(chat => chat.id === activeChat)?.other_user?.username || '').initial}
                </div>
              <h2 className="text-base font-semibold text-gray-900">
                {chats.find(chat => chat.id === activeChat)?.other_user?.username || 'Chat'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowHeaderOptions(!showHeaderOptions)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {/* Header Options Menu */}
              {showHeaderOptions && (
                <div
                  ref={headerOptionsRef}
                  className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 w-48"
                >
                  <button
                    onClick={handlePinChat}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <Pin className={`w-4 h-4 ${isPinned ? 'text-indigo-500' : 'text-gray-500'}`} />
                    <span className={isPinned ? 'text-indigo-600' : 'text-gray-700'}>
                      {isPinned ? 'Unpin Chat' : 'Pin Chat'}
                    </span>
                  </button>

                  <button
                    onClick={handleMuteNotifications}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <BellOff className={`w-4 h-4 ${isMuted ? 'text-indigo-500' : 'text-gray-500'}`} />
                    <span className={isMuted ? 'text-indigo-600' : 'text-gray-700'}>
                      {isMuted ? 'Unmute Chat' : 'Mute Chat'}
                    </span>
                  </button>

                  <button
                    onClick={handleClearChat}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Clear Chat</span>
                  </button>

                  <div className="h-px bg-gray-200 my-1" />

                  <button
                    onClick={handleBlockUser}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <Ban className={`w-4 h-4 ${isBlocked ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className={isBlocked ? 'text-red-600' : 'text-gray-700'}>
                      {isBlocked ? 'Unblock User' : 'Block User'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSearching(true);
                      setShowHeaderOptions(false);
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Search in Chat</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search bar when searching */}
        {isSearching && (
          <div className="bg-white border-b border-gray-200 p-2 flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in conversation..."
                className="flex-1 px-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                  setMatchingMessages([]);
                  setCurrentSearchIndex(-1);
                }}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Main content area with side panel */}
        <div className="flex-1 flex min-h-0">
          {/* Messages area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {renderMessages()}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-gray-100 shrink-0">
              <div className="max-w-4xl mx-auto px-4 py-3">
                {isOtherUserTyping && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex space-x-0.5">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>{chats.find(chat => chat.id === activeChat)?.other_user?.username} is typing...</span>
                    </div>
                  </div>
                )}

                {replyingTo && (
                  <div className="mb-3 bg-gray-50 rounded-lg p-2">
                    <ReplyPreview 
                      replyingTo={replyingTo}
                      onCancelReply={() => setReplyingTo(null)}
                    />
                  </div>
                )}
                
                {messages.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-500 mb-2">Suggested Replies</div>
                    <SmartReplies
                      lastMessage={messages[messages.length - 1].content}
                      onReplySelect={handleSmartReply}
                      itemDetails={itemDetails}
                    />
                  </div>
                )}

                <div className="flex flex-col rounded-lg border border-gray-200 bg-white">
                  {/* Rich Text Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {/* Toggle bold */}}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {/* Toggle italic */}}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {/* Open emoji picker */}}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Emoji"
                      >
                        <Smile className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {/* Open file picker */}}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Attach file"
                      >
                        <Paperclip className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {/* Start voice recording */}}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Voice message"
                      >
                        <Mic className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="flex items-end gap-2 p-2">
                    <div className="relative flex-1">
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (newMessage.trim()) {
                              sendMessage(e);
                            }
                          }
                        }}
                        placeholder="Type a message..."
                        className="w-full px-3 py-2 max-h-[150px] rounded-md bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        disabled={sendingMessage}
                        rows={1}
                      />
                      {newMessage.length > 0 && (
                        <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                          {newMessage.length}/1000
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className={`p-2 rounded-md ${
                        sendingMessage || !newMessage.trim()
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      } transition-colors`}
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>

                {/* File Upload Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-sm font-medium text-gray-700">Selected Files</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                              <File className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-1 -right-1 p-1 bg-white rounded-full text-gray-500 shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side panel with collapsible sections */}
          <div className="w-80 border-l border-gray-100 bg-white shrink-0 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* User Trust Score Section */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowTrustScore(!showTrustScore)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  User Trust Score
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${showTrustScore ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {showTrustScore && userTrustInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <UserTrustScore {...userTrustInfo} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Deal Progress Section */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowDealProgress(!showDealProgress)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Deal Progress
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${showDealProgress ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {showDealProgress && dealStatus && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <DealProgress {...dealStatus} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};