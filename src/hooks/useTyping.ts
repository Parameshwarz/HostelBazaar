import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TypingStatus } from '../types';

export const useTyping = (chatId: string | null, userId: string | null, username: string = 'User') => {
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Set up typing indicator channel
  useEffect(() => {
    if (!chatId || !userId) return;
    
    console.log(`Setting up typing channel for chat: ${chatId}`);
    const channel = supabase.channel(`chat:${chatId}`);
    
    // Subscribe to typing broadcasts
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        console.log('Received typing event:', payload);
        
        // Don't update for own typing events
        if (payload.payload.userId === userId) return;
        
        if (payload.payload.isTyping) {
          // Add typing user if not already in list
          setTypingUsers(current => {
            const exists = current.some(user => user.userId === payload.payload.userId);
            if (exists) return current;
            
            return [...current, {
              userId: payload.payload.userId,
              username: payload.payload.username || 'User',
              isTyping: true
            }];
          });
        } else {
          // Remove user from typing list
          setTypingUsers(current => 
            current.filter(user => user.userId !== payload.payload.userId)
          );
        }
      })
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      // Send that we stopped typing when leaving
      if (isTyping) {
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId, username, isTyping: false }
        });
      }
      channel.unsubscribe();
    };
  }, [chatId, userId, username, isTyping]);
  
  // Function to broadcast typing status
  const setUserTyping = useCallback((typing: boolean) => {
    if (!chatId || !userId) return;
    
    // Only send update if status changed
    if (typing !== isTyping) {
      console.log(`Sending typing status: ${typing} to chat: ${chatId}`);
      setIsTyping(typing);
      
      const channel = supabase.channel(`chat:${chatId}`);
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, username, isTyping: typing }
      });
    }
  }, [chatId, userId, username, isTyping]);
  
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