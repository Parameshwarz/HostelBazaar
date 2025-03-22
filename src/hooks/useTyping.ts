import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { TypingStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

// Local interface to bridge between the two versions of TypingStatus
export interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

export const useTyping = (chatId: string) => {
  const { user } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimestampsRef = useRef<Map<string, number>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userTypingChannelRef = useRef<RealtimeChannel | null>(null);
  const lastTypingTimeRef = useRef<number>(0);

  // Function to set the user typing status and broadcast to others
  const setUserTyping = useCallback((isTyping: boolean) => {
    if (!user || !chatId) return;

    const userId = user.id;
    const username = user.email || "Unknown";

    // Only broadcast if user is typing (never broadcast "stopped typing")
    if (isTyping) {
      console.log(`[TYPING DEBUG] Broadcasting typing status: ${isTyping}`);
      try {
        supabase.channel('typing-channel')
          .send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId, username, isTyping, chatId }
          });
      } catch (error) {
        console.error('[TYPING DEBUG] Error broadcasting typing status:', error);
      }
    }

    // Update local state
    setIsTyping(isTyping);
  }, [user, chatId]);

  // UseEffect to set up typing event listener
  useEffect(() => {
    if (!chatId || !user?.id) return;
    
    const userId = user.id;
    console.log(`[TYPING DEBUG] Setting up typing channel for chat ${chatId} and user ${userId}`);
    
    // Always use the same channel name format for consistency
    const typingChannel = supabase.channel(`typing-${chatId}`);
    userTypingChannelRef.current = typingChannel;
    
    typingChannel
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        console.log('[TYPING DEBUG] Received broadcast:', payload);
        
        // Extract typing data from payload
        const { userId, username, isTyping, chatId: typingChatId } = payload.payload;
        
        // Ignore if not for the current chat
        if (typingChatId !== chatId) {
          console.log(`[TYPING DEBUG] Ignoring typing for different chat: ${typingChatId}`);
          return;
        }
        
        console.log(`[TYPING DEBUG] Processing typing from ${username} (${userId}): ${isTyping}`);
        
        // Update typing timestamps
        if (isTyping) {
          typingTimestampsRef.current.set(userId, Date.now());
          
          // Add to typing users if not already there
          const existingUser = typingUsers.find(u => u.userId === userId);
          if (!existingUser) {
            console.log(`[TYPING DEBUG] Adding new typing user: ${username}`);
            setTypingUsers(prev => [...prev, { userId, username, isTyping }]);
          } else if (!existingUser.isTyping) {
            console.log(`[TYPING DEBUG] Updating existing user typing status: ${username}`);
            setTypingUsers(prev => 
              prev.map(u => u.userId === userId ? { ...u, isTyping: true } : u)
            );
          }
        } else {
          // User stopped typing
          console.log(`[TYPING DEBUG] User ${username} stopped typing`);
          setTypingUsers(prev => 
            prev.map(u => u.userId === userId ? { ...u, isTyping: false } : u)
          );
        }
        
        console.log('[TYPING DEBUG] Updated typing users:', typingUsers);
      })
      .subscribe((status: any) => {
        console.log(`[TYPING DEBUG] Typing channel subscription status:`, status);
      });

    // Setup a cleanup interval to remove stale typing users
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const staleThreshold = 30000; // Increased to 30 seconds (from 12)
      let hasStaleUsers = false;
      
      typingTimestampsRef.current.forEach((timestamp, id) => {
        if (now - timestamp > staleThreshold) {
          console.log(`[TYPING DEBUG] User ${id} typing status is stale, removing`);
          typingTimestampsRef.current.delete(id);
          hasStaleUsers = true;
        }
      });
      
      if (hasStaleUsers) {
        // Remove stale users from the typing users list
        setTypingUsers(prev => {
          // Keep only users who are still in the timestamps map
          const updated = prev.filter(user => 
            typingTimestampsRef.current.has(user.userId)
          );
          console.log('[TYPING DEBUG] After stale cleanup, typing users:', updated);
          return updated;
        });
      }
    }, 2000);

    // Clean up function
    return () => {
      console.log('[TYPING DEBUG] Cleaning up typing channel');
      // NEVER send "stopped typing" on cleanup - this causes issues
      // Just clean up resources
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (userTypingChannelRef.current) {
        userTypingChannelRef.current.unsubscribe();
        userTypingChannelRef.current = null;
      }
    };
  }, [chatId, user, typingUsers]);

  // Function to indicate typing with auto-reset after inactivity
  const indicateTyping = useCallback(() => {
    // Set typing status to true immediately
    setUserTyping(true);
    console.log('[TYPING DEBUG] Called indicateTyping() - refreshed typing status');
    
    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout to clear typing status after inactivity
    // WhatsApp style: only show "stopped typing" after sufficient pause
    timeoutRef.current = setTimeout(() => {
      // Only update local state, never broadcast the "stopped typing" event
      if (isTyping) {
        setIsTyping(false);
        timeoutRef.current = null;
        console.log('[TYPING DEBUG] Auto-reset typing status after timeout (local only)');
      }
    }, 15000); // Set to 15 seconds for long-lasting indicator
    
    // Return cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isTyping, setUserTyping]);

  return { isTyping, typingUsers, indicateTyping };
}; 