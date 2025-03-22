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
  const typingTimestampsRef = useRef<Map<string, number>>(new Map());
  
  // Set up typing indicator channel
  useEffect(() => {
    if (!chatId || !userId) return;
    
    console.log(`Setting up SIMPLE typing for chat: ${chatId}`);
    
    // Use a simpler channel name - more reliable in production
    const channelName = `typing-${chatId}`;
    
    try {
      // Clean up previous channel if any
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from previous channel:', error);
        }
      }
      
      // Create simple broadcast channel
      const channel = supabase.channel(channelName);
      channelRef.current = channel;
      
      // Setup a cleanup interval to remove stale typing users
      const cleanupInterval = setInterval(() => {
        const now = Date.now();
        const staleThreshold = 5000; // 5 seconds
        let hasStaleUsers = false;
        
        typingTimestampsRef.current.forEach((timestamp, id) => {
          if (now - timestamp > staleThreshold) {
            console.log(`User ${id} typing status is stale, removing`);
            typingTimestampsRef.current.delete(id);
            hasStaleUsers = true;
          }
        });
        
        // Update typing users if we removed any stale ones
        if (hasStaleUsers) {
          setTypingUsers(prev => prev.filter(user => 
            typingTimestampsRef.current.has(user.userId)
          ));
        }
      }, 2000);
      
      // Subscribe to typing events
      channel
        .on('broadcast', { event: 'typing' }, (payload) => {
          try {
            console.log('Received typing broadcast:', payload);
            
            // Validate payload
            if (!payload || !payload.payload || typeof payload.payload !== 'object') {
              console.error('Invalid typing payload:', payload);
              return;
            }
            
            const { userId: senderId, username: senderName, isTyping: senderIsTyping } = payload.payload;
            
            // Skip our own events
            if (senderId === userId) {
              console.log('Ignoring own typing event');
              return;
            }
            
            console.log(`Processing typing from ${senderName || 'Unknown'} (${senderId}): ${senderIsTyping}`);
            
            if (senderIsTyping) {
              // Record timestamp for this user
              typingTimestampsRef.current.set(senderId, Date.now());
              
              // Update typing users
              setTypingUsers(prev => {
                // Check if user is already in the list
                if (prev.some(u => u.userId === senderId)) {
                  return prev.map(u => 
                    u.userId === senderId ? { ...u, isTyping: true } : u
                  );
                }
                
                // Add new typing user
                return [...prev, {
                  userId: senderId,
                  username: senderName || 'User',
                  isTyping: true
                }];
              });
            } else {
              // Remove timestamp
              typingTimestampsRef.current.delete(senderId);
              
              // Remove user from typing list
              setTypingUsers(prev => 
                prev.filter(u => u.userId !== senderId)
              );
            }
          } catch (error) {
            console.error('Error processing typing event:', error);
          }
        })
        .subscribe((status, err) => {
          console.log(`Typing channel status: ${status}`);
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to typing broadcasts');
          } else if (err) {
            console.error('Error subscribing to typing channel:', err);
          }
        });
      
      // Cleanup function
      return () => {
        console.log('Cleaning up typing channel');
        clearInterval(cleanupInterval);
        
        if (isTyping) {
          // Send that we stopped typing
          try {
            channel.send({
              type: 'broadcast',
              event: 'typing',
              payload: { userId, username, isTyping: false }
            });
          } catch (error) {
            console.error('Error sending stop typing on cleanup:', error);
          }
        }
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        try {
          channel.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from typing channel:', error);
        }
        channelRef.current = null;
      };
    } catch (error) {
      console.error('Error setting up typing channel:', error);
      return () => {};
    }
  }, [chatId, userId, username]);
  
  // Simple function to send typing status
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!chatId || !userId || !channelRef.current) return;
    
    try {
      console.log(`Sending typing status: ${isTyping} for user ${username} in chat: ${chatId}`);
      
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, username, isTyping }
      });
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  }, [chatId, userId, username]);
  
  // Function to update typing status - only sends if changed
  const setUserTyping = useCallback((typing: boolean) => {
    if (typing !== isTyping) {
      console.log(`Changing typing status: ${typing} for user ${username}`);
      setIsTyping(typing);
      sendTypingStatus(typing);
    }
  }, [isTyping, username, sendTypingStatus]);
  
  // Function to indicate typing with auto-reset after inactivity
  const indicateTyping = useCallback(() => {
    // Set typing status to true
    setUserTyping(true);
    
    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout to clear typing status after inactivity
    timeoutRef.current = setTimeout(() => {
      setUserTyping(false);
      timeoutRef.current = null;
    }, 3000);
    
    // Return cleanup function
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