import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { TypingStatus } from '../types';

// Local interface to bridge between the two versions of TypingStatus
interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

export const useTyping = (chatId: string | null, userId: string | null, username: string = 'User') => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const channelRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up typing indicator channel
  useEffect(() => {
    if (!chatId || !userId) return;
    
    console.log(`Setting up typing channel for chat: ${chatId}`);
    
    // CRITICAL FIX: Use simple chat channel name without the "typing" suffix 
    // This ensures all users join exactly the same channel name
    const channelName = `chat:${chatId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;
    
    // Subscribe to typing broadcasts - FIXED EVENT NAME
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        console.log('Received typing event:', payload);
        
        // Check if payload has the expected structure
        if (!payload.payload || typeof payload.payload !== 'object') {
          console.error('Invalid typing payload received:', payload);
          return;
        }
        
        // Don't update for own typing events
        if (payload.payload.userId === userId) {
          console.log('Ignoring own typing event');
          return;
        }
        
        if (payload.payload.isTyping) {
          console.log(`User ${payload.payload.username} is typing`);
          // Add typing user if not already in list
          setTypingUsers(current => {
            const exists = current.some(user => user.userId === payload.payload.userId);
            if (exists) {
              console.log('User already in typing list, refreshing their status');
              // Update the existing user's typing status
              return current.map(user => 
                user.userId === payload.payload.userId 
                  ? { ...user, isTyping: true } 
                  : user
              );
            }
            
            console.log('Adding new typing user to list:', payload.payload.username);
            return [...current, {
              userId: payload.payload.userId,
              username: payload.payload.username || 'User',
              isTyping: true
            }];
          });
        } else {
          console.log(`User ${payload.payload.username} stopped typing`);
          // Remove user from typing list
          setTypingUsers(current => 
            current.filter(user => user.userId !== payload.payload.userId)
          );
        }
      })
      .subscribe((status, err) => {
        console.log(`Typing channel status: ${status}`, err || '');
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to typing events');
        } else if (err) {
          console.error('Error subscribing to typing events:', err);
        }
      });
    
    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up typing subscription');
      // Send that we stopped typing when leaving
      if (isTyping) {
        sendTypingStatus(false);
      }
      
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [chatId, userId, username, isTyping]);
  
  // Helper function to send the typing status
  const sendTypingStatus = useCallback((typing: boolean) => {
    if (!chatId || !userId || !channelRef.current) return;
    
    console.log(`Sending typing status: ${typing} for user ${username} in chat: ${chatId}`);
    
    try {
      // FIXED: Make sure we use a simpler payload structure
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { 
          userId, 
          username, 
          isTyping: typing 
        }
      });
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  }, [chatId, userId, username]);
  
  // Function to broadcast typing status
  const setUserTyping = useCallback((typing: boolean) => {
    if (!chatId || !userId) return;
    
    // Only send update if status changed
    if (typing !== isTyping) {
      console.log(`Changing typing status: ${typing} for user ${username}`);
      setIsTyping(typing);
      sendTypingStatus(typing);
    }
  }, [chatId, userId, username, isTyping, sendTypingStatus]);
  
  // Create debounced typing indicator with auto-reset
  const indicateTyping = useCallback(() => {
    // Set typing to true immediately
    setUserTyping(true);
    
    // Reset any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Automatically stop typing indicator after 3 seconds of inactivity
    timeoutRef.current = setTimeout(() => {
      setUserTyping(false);
      timeoutRef.current = null;
    }, 3000);
    
    // Return a cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [setUserTyping]);
  
  return {
    typingUsers,
    isTyping,
    indicateTyping,
    setUserTyping
  };
}; 