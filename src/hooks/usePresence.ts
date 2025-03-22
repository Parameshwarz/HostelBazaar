import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const usePresence = (userId: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    // Use a consistent channel name format
    const channelName = 'presence-global';
    console.log(`Setting up presence channel: ${channelName} for user ${userId}`);
    
    // Create a channel with explicit presence config
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: `user-${userId}`,
        },
      },
    });
    
    // Handle presence state more safely with error handling
    const handlePresenceState = (state: any) => {
      console.log('Received presence state:', state);
      
      try {
        // Safety check for undefined state
        if (!state) {
          console.error('Received undefined presence state');
          return;
        }
        
        // Safely extract user IDs with error handling
        const userIds = Object.keys(state || {})
          .filter(key => key.startsWith('user-'))
          .map(key => key.replace('user-', ''));
        
        console.log('Extracted online users:', userIds);
        setOnlineUsers(userIds);
        setLoading(false);
      } catch (error) {
        console.error('Error processing presence state:', error);
        // Don't update state on error to avoid wiping out existing data
      }
    };
    
    // Track my presence with retries
    const trackPresence = () => {
      try {
        channel.track({
          user_id: userId,
          online_at: new Date().toISOString()
        });
        console.log('Successfully tracked presence for', userId);
      } catch (error) {
        console.error('Error tracking presence:', error);
        // Retry after a short delay
        setTimeout(trackPresence, 1000);
      }
    };
    
    // Set up presence channel with error handling
    channel
      .on('presence', { event: 'sync' }, () => {
        try {
          const state = channel.presenceState();
          handlePresenceState(state);
        } catch (error) {
          console.error('Error in presence sync event:', error);
        }
      })
      .on('presence', { event: 'join' }, (payload: any) => {
        try {
          console.log('User joined presence:', payload);
          // Check if we have a valid payload - safely check properties
          if (payload) {
            // Update presence state after join event
            const state = channel.presenceState();
            handlePresenceState(state);
          }
        } catch (error) {
          console.error('Error in presence join event:', error);
        }
      })
      .on('presence', { event: 'leave' }, (payload: any) => {
        try {
          console.log('User left presence:', payload);
          // Check if we have a valid payload - safely check properties
          if (payload) {
            // Update presence state after leave event
            const state = channel.presenceState();
            handlePresenceState(state);
          }
        } catch (error) {
          console.error('Error in presence leave event:', error);
        }
      })
      .subscribe(async (status) => {
        console.log('Presence channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          // Start tracking presence
          trackPresence();
          
          // Set up heartbeat
          const heartbeatInterval = setInterval(() => {
            try {
              channel.track({
                user_id: userId,
                online_at: new Date().toISOString()
              });
              console.log('Presence heartbeat sent');
            } catch (error) {
              console.error('Error sending heartbeat:', error);
            }
          }, 10000); // Every 10 seconds
          
          // Clean up interval on unsubscribe
          return () => clearInterval(heartbeatInterval);
        }
      });
    
    // Cleanup function
    return () => {
      console.log('Cleaning up presence channel');
      // Untrack before unsubscribing
      try {
        channel.untrack();
      } catch (error) {
        console.error('Error untracking presence:', error);
      }
      channel.unsubscribe();
    };
  }, [userId]);
  
  // Function to check if a specific user is online
  const isUserOnline = useCallback((checkUserId: string) => {
    const isOnline = onlineUsers.includes(checkUserId);
    console.log(`Checking if user ${checkUserId} is online:`, isOnline, 'Current online users:', onlineUsers);
    return isOnline;
  }, [onlineUsers]);
  
  return {
    onlineUsers,
    isUserOnline,
    loading
  };
}; 