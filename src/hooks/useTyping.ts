import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useTyping = (chatId: string | null, userId: string) => {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeoutRef] = useState<NodeJS.Timeout | null>(null);

  // Send typing status to the channel
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!chatId || !userId) return;
    
    console.log(`Sending typing status: ${isTyping} to chat: ${chatId}`);
    
    supabase
      .channel(`typing:${chatId}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping }
      });
  }, [chatId, userId]);

  // Set the user as typing
  const setUserTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set a new timeout
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 3000);
    
    setTypingTimeoutRef(newTimeout);
  }, [isTyping, sendTypingStatus, typingTimeout]);

  // Subscribe to typing updates
  useEffect(() => {
    if (!chatId) return;
    
    console.log(`Setting up typing subscription for chat: ${chatId}`);
    
    const subscription = supabase
      .channel(`typing:${chatId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        console.log('Typing status update:', payload);
        // Only update if it's the other user typing
        if (payload.payload?.userId !== userId) {
          setOtherUserTyping(payload.payload?.isTyping);
        }
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
      // Clear timeout on unmount
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [chatId, userId, typingTimeout]);

  return {
    isTyping,
    otherUserTyping,
    setUserTyping,
  };
}; 