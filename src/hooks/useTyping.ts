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
  
  // Create stable channel name with a fixed format
  const getChannelName = useCallback((chatId: string) => {
    return `typing-${chatId}`;
  }, []);
  
  // Set up typing indicator channel with a stable approach
  useEffect(() => {
    if (!chatId || !userId) return;
    
    console.log(`Setting up typing channel for chat: ${chatId}`);
    
    // Use a stable channel name that doesn't change
    const channelName = getChannelName(chatId);
    
    // Only create a new channel if we don't already have one
    if (!channelRef.current || channelRef.current.topic !== channelName) {
      // Clean up any existing channel first
      if (channelRef.current) {
        console.log('Removing previous typing channel');
        channelRef.current.unsubscribe();
      }
      
      console.log(`Creating new typing channel: ${channelName}`);
      const channel = supabase.channel(channelName);
      channelRef.current = channel;
      
      // Subscribe to typing broadcasts with a more specific event name
      channel
        .on('broadcast', { event: 'typing' }, (payload) => {
          console.log('Received typing event:', payload);
          
          // Check if payload has the expected structure
          if (!payload.payload || typeof payload.payload !== 'object') {
            console.error('Invalid typing payload received:', payload);
            return;
          }
          
          // Get the sender's ID from the payload
          const senderId = payload.payload.userId;
          
          // Ignore my own typing events since we handle those locally
          if (senderId === userId) {
            console.log('Ignoring own typing event');
            return;
          }
          
          console.log(`Processing typing event from user ${payload.payload.username || 'Unknown'} (${senderId})`);
          
          if (payload.payload.isTyping) {
            console.log(`User ${payload.payload.username} is typing`);
            // Add typing user if not already in list
            setTypingUsers(current => {
              const exists = current.some(user => user.userId === senderId);
              if (exists) {
                console.log('User already in typing list, refreshing their status');
                // Update the existing user's typing status
                return current.map(user => 
                  user.userId === senderId 
                    ? { ...user, isTyping: true } 
                    : user
                );
              }
              
              console.log('Adding new typing user to list:', payload.payload.username);
              return [...current, {
                userId: senderId,
                username: payload.payload.username || 'User',
                isTyping: true
              }];
            });
          } else {
            console.log(`User ${payload.payload.username} stopped typing`);
            // Remove user from typing list
            setTypingUsers(current => 
              current.filter(user => user.userId !== senderId)
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
    }
    
    // Cleanup function - only runs when component unmounts or chatId changes
    return () => {
      console.log('Cleaning up typing subscription on unmount/chatId change');
      
      // Send that we stopped typing when leaving
      if (isTyping) {
        sendTypingStatus(false);
      }
      
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Only unsubscribe when component is unmounting or chatId is changing
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [chatId, userId, getChannelName]); // Remove isTyping and username from deps to prevent recreating the channel
  
  // Helper function to send the typing status - won't recreate channel
  const sendTypingStatus = useCallback((typing: boolean) => {
    if (!chatId || !userId || !channelRef.current) {
      console.error('Cannot send typing status - missing chatId, userId or channel');
      return;
    }
    
    console.log(`Sending typing status: ${typing} for user ${username} in chat: ${chatId}`);
    
    try {
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
  
  // Function to broadcast typing status - only sends if status changes
  const setUserTyping = useCallback((typing: boolean) => {
    if (!chatId || !userId) return;
    
    // Only send update if status changed to avoid spamming
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