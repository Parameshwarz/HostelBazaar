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
  
  // Create stable channel name with a proper format - very important in production
  const getChannelName = useCallback((chatId: string) => {
    // Important: Must be named properly for production
    return `typing:${chatId}`;
  }, []);
  
  // Helper function to send typing status with error handling
  const sendTypingStatus = useCallback((typing: boolean) => {
    if (!chatId || !userId) {
      console.log('Cannot send typing status - missing chatId or userId');
      return;
    }
    
    if (!channelRef.current) {
      console.log('Cannot send typing status - no active channel');
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
  
  // Set up typing indicator channel with robust error handling for production
  useEffect(() => {
    if (!chatId || !userId) return;
    
    console.log(`Setting up typing channel for chat: ${chatId} with user: ${userId}`);
    
    try {
      // Use a stable channel name that doesn't change
      const channelName = getChannelName(chatId);
      
      // Only create a new channel if we don't already have one or if channel name changed
      if (!channelRef.current || channelRef.current.topic !== channelName) {
        // Clean up any existing channel first
        if (channelRef.current) {
          console.log('Cleaning up previous typing channel');
          try {
            channelRef.current.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing from previous channel:', error);
          }
        }
        
        console.log(`Creating new typing channel: ${channelName}`);
        try {
          // Create channel with proper configuration for production
          const channel = supabase.channel(channelName);
          channelRef.current = channel;
          
          // Set up broadcast listener with robust error handling
          channel
            .on('broadcast', { event: 'typing' }, (payload) => {
              try {
                console.log('Received typing event:', payload);
                
                // Safety check for payload
                if (!payload || !payload.payload || typeof payload.payload !== 'object') {
                  console.error('Invalid typing payload format:', payload);
                  return;
                }
                
                // Extract sender info with safety checks
                const senderInfo = payload.payload;
                const senderId = senderInfo.userId;
                const senderName = senderInfo.username || 'Unknown User';
                
                if (!senderId) {
                  console.error('Missing sender ID in typing payload:', payload);
                  return;
                }
                
                // Ignore my own typing events
                if (senderId === userId) {
                  console.log('Ignoring own typing event');
                  return;
                }
                
                console.log(`Processing typing event from ${senderName} (${senderId})`);
                
                if (senderInfo.isTyping === true) {
                  console.log(`User ${senderName} is typing`);
                  
                  // Add or update typing user with immutable update pattern
                  setTypingUsers(current => {
                    const exists = current.some(user => user.userId === senderId);
                    if (exists) {
                      console.log('Refreshing existing typing user status');
                      return current.map(user => 
                        user.userId === senderId 
                          ? { ...user, isTyping: true } 
                          : user
                      );
                    }
                    
                    console.log('Adding new typing user:', senderName);
                    return [...current, {
                      userId: senderId,
                      username: senderName,
                      isTyping: true
                    }];
                  });
                } else {
                  console.log(`User ${senderName} stopped typing`);
                  // Remove user from typing list
                  setTypingUsers(current => 
                    current.filter(user => user.userId !== senderId)
                  );
                }
              } catch (error) {
                console.error('Error processing typing event:', error);
              }
            })
            .subscribe((status, err) => {
              console.log(`Typing channel status: ${status}`, err || '');
              
              if (status === 'SUBSCRIBED') {
                console.log('Successfully subscribed to typing channel');
              } else if (err) {
                console.error('Error subscribing to typing channel:', err);
              }
            });
        } catch (error) {
          console.error('Error creating typing channel:', error);
        }
      }
    } catch (error) {
      console.error('Unexpected error in typing channel setup:', error);
    }
    
    // Cleanup function with error handling
    return () => {
      try {
        console.log('Cleaning up typing subscription');
        
        // Send that we stopped typing when leaving
        if (isTyping) {
          try {
            sendTypingStatus(false);
          } catch (error) {
            console.error('Error sending stop typing status on cleanup:', error);
          }
        }
        
        // Clear any pending timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Unsubscribe from channel
        if (channelRef.current) {
          try {
            channelRef.current.unsubscribe();
            channelRef.current = null;
          } catch (error) {
            console.error('Error unsubscribing from typing channel:', error);
          }
        }
      } catch (error) {
        console.error('Error in typing cleanup:', error);
      }
    };
  }, [chatId, userId, getChannelName, isTyping, sendTypingStatus]); 
  
  // Function to broadcast typing status - only sends if status changed
  const setUserTyping = useCallback((typing: boolean) => {
    if (!chatId || !userId) return;
    
    // Only send update if status changed to avoid spamming
    if (typing !== isTyping) {
      console.log(`Changing typing status: ${typing} for user ${username}`);
      setIsTyping(typing);
      sendTypingStatus(typing);
    }
  }, [chatId, userId, username, isTyping, sendTypingStatus]);
  
  // Debounced typing indicator with auto-reset
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