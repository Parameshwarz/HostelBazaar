import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const usePresence = (userId: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  useEffect(() => {
    if (!userId) return;
    
    console.log('Setting up presence tracking for user:', userId);
    
    // Create a SHARED channel for all users - this is critical
    // All users must join the same channel to see each other
    const channelName = 'online-users-shared';
    
    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: `user-${userId}`,
        },
      }
    });
    
    // Track successful subscription
    let isSubscribed = false;
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        try {
          const state = presenceChannel.presenceState();
          console.log('Presence state updated:', state);
          
          // Extract user IDs from presence state - this is the critical part
          const onlineUserIds = Object.keys(state).map(key => key.replace('user-', ''));
          console.log('Online users ids extracted:', onlineUserIds);
          
          setOnlineUsers(onlineUserIds);
        } catch (error) {
          console.error('Error processing presence sync:', error);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        
        // Update online users immediately when someone joins
        try {
          const state = presenceChannel.presenceState();
          const currentOnlineUsers = Object.keys(state).map(key => key.replace('user-', ''));
          setOnlineUsers(currentOnlineUsers);
        } catch (error) {
          console.error('Error processing join event:', error);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        
        // Update online users immediately when someone leaves
        try {
          const state = presenceChannel.presenceState();
          const currentOnlineUsers = Object.keys(state).map(key => key.replace('user-', ''));
          setOnlineUsers(currentOnlineUsers);
        } catch (error) {
          console.error('Error processing leave event:', error);
        }
      })
      .subscribe(async (status) => {
        console.log('Presence channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          isSubscribed = true;
          
          try {
            // Track the user's presence with their user ID
            await presenceChannel.track({ 
              user_id: userId,
              online_at: new Date().toISOString()
            });
            console.log('Successfully tracking presence for user:', userId);
            
            // Force an initial sync
            const state = presenceChannel.presenceState();
            const currentOnlineUsers = Object.keys(state).map(key => key.replace('user-', ''));
            setOnlineUsers(currentOnlineUsers);
          } catch (error) {
            console.error('Error tracking presence:', error);
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Presence channel error');
        }
      });
    
    // Setup heartbeat to keep presence active
    const heartbeatInterval = setInterval(() => {
      if (isSubscribed) {
        presenceChannel.track({ 
          user_id: userId,
          online_at: new Date().toISOString() 
        });
        console.log('Presence heartbeat sent');
      }
    }, 15000); // Send heartbeat every 15 seconds - more frequent updates
    
    // Set up event listeners for page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSubscribed) {
        presenceChannel.track({ 
          user_id: userId,
          online_at: new Date().toISOString() 
        });
        console.log('User became visible, tracking presence again');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle user going offline
    const handleBeforeUnload = () => {
      if (isSubscribed) {
        presenceChannel.untrack();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up event listeners and subscription
    return () => {
      console.log('Cleaning up presence tracking');
      clearInterval(heartbeatInterval);
      
      if (isSubscribed) {
        presenceChannel.untrack();
      }
      
      supabase.removeChannel(presenceChannel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);
  
  const isUserOnline = (id: string): boolean => {
    const isOnline = onlineUsers.includes(id);
    console.log(`Checking if user ${id} is online:`, isOnline, 'Current online users:', onlineUsers);
    return isOnline;
  };
  
  return { onlineUsers, isUserOnline };
}; 