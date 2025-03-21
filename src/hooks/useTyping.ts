import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TypingStatus } from '../types';

export const useTyping = (chatId: string | null, userId: string | null, username: string = 'User') => {
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Set up typing indicator channel
  useEffect(() => {
    if (!chatId || !userId) return;
    
    const typingChannel = supabase.channel(`typing-${chatId}`);
    
    typingChannel
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        
        // Transform presence state to typing users
        const typingState: TypingStatus[] = [];
        Object.keys(state).forEach(key => {
          if (key.startsWith('user-')) {
            const user = state[key][0];
            if (user.user_id !== userId && user.is_typing) {
              typingState.push({
                userId: user.user_id,
                username: user.username || 'User',
                isTyping: user.is_typing
              });
            }
          }
        });
        
        setTypingUsers(typingState);
        console.log('Typing users:', typingState);
      })
      .subscribe();
    
    // Function to update typing status
    const updateTypingStatus = (typing: boolean) => {
      if (!typingChannel) return;
      
      // Only update if status changed
      if (typing !== isTyping) {
        setIsTyping(typing);
        typingChannel.track({
          user_id: userId,
          username: username,
          is_typing: typing
        });
      }
    };
    
    // Clean up
    return () => {
      updateTypingStatus(false);
      typingChannel.untrack();
      typingChannel.unsubscribe();
    };
  }, [chatId, userId, username, isTyping]);
  
  // Function to indicate user is typing
  const setUserTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);
  
  // Create debounced typing indicator
  const indicateTyping = useCallback(() => {
    setUserTyping(true);
    
    // Automatically stop typing indicator after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      setUserTyping(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [setUserTyping]);
  
  return {
    typingUsers,
    isTyping,
    indicateTyping,
    setUserTyping
  };
}; 