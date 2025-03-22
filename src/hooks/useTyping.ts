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
    
    console.log(`[TYPING DEBUG] Setting up typing for chat: ${chatId} with user: ${userId}`);
    
    // Use a CONSISTENT channel name - THIS IS CRITICAL
    const channelName = `typing:${chatId}`;
    console.log(`[TYPING DEBUG] Channel name: ${channelName}`);
    
    try {
      // Clean up previous channel if any
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
          console.log('[TYPING DEBUG] Unsubscribed from previous channel');
        } catch (error) {
          console.error('Error unsubscribing from previous channel:', error);
        }
      }
      
      // Create Supabase broadcast channel - with more details logged
      console.log(`[TYPING DEBUG] Creating new channel: ${channelName}`);
      const channel = supabase.channel(channelName);
      channelRef.current = channel;
      
      // Setup a cleanup interval to remove stale typing users
      const cleanupInterval = setInterval(() => {
        const now = Date.now();
        const staleThreshold = 5000; // 5 seconds
        let hasStaleUsers = false;
        
        typingTimestampsRef.current.forEach((timestamp, id) => {
          if (now - timestamp > staleThreshold) {
            console.log(`[TYPING DEBUG] User ${id} typing status is stale, removing`);
            typingTimestampsRef.current.delete(id);
            hasStaleUsers = true;
          }
        });
        
        // Update typing users if we removed any stale ones
        if (hasStaleUsers) {
          setTypingUsers(prev => {
            const updated = prev.filter(user => 
              typingTimestampsRef.current.has(user.userId)
            );
            console.log('[TYPING DEBUG] Updated typing users after cleanup:', updated);
            return updated;
          });
        }
      }, 2000);
      
      // Subscribe to typing events with MANDATORY event filter
      channel
        .on('broadcast', { event: 'typing' }, (payload) => {
          console.log('[TYPING DEBUG] Received broadcast:', payload);
          
          try {
            // Validate payload with better error messages
            if (!payload) {
              console.error('[TYPING DEBUG] Payload is null or undefined');
              return;
            }
            
            if (!payload.payload) {
              console.error('[TYPING DEBUG] Payload.payload is missing', payload);
              return;
            }
            
            if (typeof payload.payload !== 'object') {
              console.error('[TYPING DEBUG] Payload.payload is not an object', payload);
              return;
            }
            
            // Extract with default values to prevent errors
            const senderId = payload.payload.userId || null;
            const senderName = payload.payload.username || 'Unknown User';
            const senderIsTyping = !!payload.payload.isTyping;
            
            if (!senderId) {
              console.error('[TYPING DEBUG] Missing sender ID in payload', payload);
              return;
            }
            
            // Skip our own events - CRITICAL for production
            if (senderId === userId) {
              console.log('[TYPING DEBUG] Ignoring own typing event');
              return;
            }
            
            console.log(`[TYPING DEBUG] Processing typing from ${senderName} (${senderId}): ${senderIsTyping}`);
            
            if (senderIsTyping) {
              // Record timestamp for this user
              typingTimestampsRef.current.set(senderId, Date.now());
              
              // Update typing users with better logging
              setTypingUsers(prev => {
                // Check if user is already in the list
                if (prev.some(u => u.userId === senderId)) {
                  console.log('[TYPING DEBUG] Updating existing typing user');
                  return prev.map(u => 
                    u.userId === senderId ? { ...u, isTyping: true } : u
                  );
                }
                
                // Add new typing user
                console.log('[TYPING DEBUG] Adding new typing user:', senderName);
                const updated = [...prev, {
                  userId: senderId,
                  username: senderName,
                  isTyping: true
                }];
                console.log('[TYPING DEBUG] Updated typing users:', updated);
                return updated;
              });
            } else {
              // Remove timestamp
              typingTimestampsRef.current.delete(senderId);
              
              // Remove user from typing list
              setTypingUsers(prev => {
                const updated = prev.filter(u => u.userId !== senderId);
                console.log('[TYPING DEBUG] User stopped typing. Updated list:', updated);
                return updated;
              });
            }
          } catch (error) {
            console.error('[TYPING DEBUG] Error processing typing event:', error);
          }
        })
        .subscribe((status, error) => {
          console.log(`[TYPING DEBUG] Channel status: ${status}`, error || '');
          
          if (status === 'SUBSCRIBED') {
            console.log('[TYPING DEBUG] Successfully subscribed to typing channel');
          } else if (error) {
            console.error('[TYPING DEBUG] Error subscribing to channel:', error);
          }
        });
      
      // Cleanup function
      return () => {
        console.log('[TYPING DEBUG] Cleaning up typing channel');
        clearInterval(cleanupInterval);
        
        if (isTyping) {
          // Send that we stopped typing
          try {
            channel.send({
              type: 'broadcast',
              event: 'typing',
              payload: { userId, username, isTyping: false }
            });
            console.log('[TYPING DEBUG] Sent stop typing status on cleanup');
          } catch (error) {
            console.error('[TYPING DEBUG] Error sending stop typing on cleanup:', error);
          }
        }
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        try {
          channel.unsubscribe();
          console.log('[TYPING DEBUG] Unsubscribed from typing channel');
        } catch (error) {
          console.error('[TYPING DEBUG] Error unsubscribing from typing channel:', error);
        }
        channelRef.current = null;
      };
    } catch (error) {
      console.error('[TYPING DEBUG] Error setting up typing channel:', error);
      return () => {};
    }
  }, [chatId, userId, username]);
  
  // Simple function to send typing status
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!chatId || !userId || !channelRef.current) {
      console.log('[TYPING DEBUG] Cannot send typing status - missing requirements');
      return;
    }
    
    try {
      console.log(`[TYPING DEBUG] Sending typing status: ${isTyping} for user ${username} in chat: ${chatId}`);
      
      // Add an ID to help with debugging
      const messageId = Date.now().toString();
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { 
          userId, 
          username, 
          isTyping,
          messageId // Add this to track messages
        }
      });
      console.log(`[TYPING DEBUG] Sent typing status with ID: ${messageId}`);
    } catch (error) {
      console.error('[TYPING DEBUG] Error sending typing status:', error);
    }
  }, [chatId, userId, username]);
  
  // Function to update typing status - only sends if changed
  const setUserTyping = useCallback((typing: boolean) => {
    if (typing !== isTyping) {
      console.log(`[TYPING DEBUG] Changing typing status: ${typing} for user ${username}`);
      setIsTyping(typing);
      sendTypingStatus(typing);
    }
  }, [isTyping, username, sendTypingStatus]);
  
  // Function to indicate typing with auto-reset after inactivity
  const indicateTyping = useCallback(() => {
    // Set typing status to true
    setUserTyping(true);
    console.log('[TYPING DEBUG] Called indicateTyping()');
    
    // Clear existing timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout to clear typing status after inactivity
    timeoutRef.current = setTimeout(() => {
      setUserTyping(false);
      timeoutRef.current = null;
      console.log('[TYPING DEBUG] Auto-reset typing status after timeout');
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