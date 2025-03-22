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
    
    // Use a consistent, global channel for all presence functionality
    // This ensures all users are in the same channel
    const PRESENCE_CHANNEL = 'online-users-shared';
    
    console.log(`Setting up presence channel: ${PRESENCE_CHANNEL} for user ${userId}`);
    
    const channel = supabase.channel(PRESENCE_CHANNEL);
    
    // Handle presence events
    const handlePresenceState = (state: any) => {
      console.log('Presence state updated:', state);
      
      // Extract all online user IDs from the state object
      const userIds = Object.keys(state)
        .filter(key => key.startsWith('user-'))
        .map(key => {
          // Extract user ID from key (format: user-{id})
          const id = key.replace('user-', '');
          return id;
        });
      
      console.log('Online users ids extracted:', userIds);
      setOnlineUsers(userIds);
      setLoading(false);
    };
    
    const handlePresenceJoin = (joinEvent: any) => {
      const key = Object.keys(joinEvent.presence)[0];
      console.log('User joined:', key, joinEvent.presence[key]);
      
      if (key.startsWith('user-')) {
        const joinedUserId = key.replace('user-', '');
        setOnlineUsers(prev => {
          if (prev.includes(joinedUserId)) return prev;
          return [...prev, joinedUserId];
        });
      }
    };
    
    const handlePresenceLeave = (leaveEvent: any) => {
      const key = Object.keys(leaveEvent.presence)[0];
      console.log('User left:', key, leaveEvent.presence[key]);
      
      if (key.startsWith('user-')) {
        const leftUserId = key.replace('user-', '');
        setOnlineUsers(prev => prev.filter(id => id !== leftUserId));
      }
    };
    
    // Update my presence status with more frequent heartbeats
    const updateMyPresence = () => {
      channel.track({
        online_at: new Date().toISOString(),
        user_id: userId
      });
    };
    
    // Subscribe to the presence channel
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        handlePresenceState(state);
      })
      .on('presence', { event: 'join' }, handlePresenceJoin)
      .on('presence', { event: 'leave' }, handlePresenceLeave)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Start tracking presence
          updateMyPresence();
          console.log('Presence channel subscribed');
          
          // Set up a heartbeat at regular intervals to keep presence active
          const heartbeatInterval = setInterval(() => {
            updateMyPresence();
            console.log('Presence heartbeat sent');
          }, 15000); // 15 seconds - more frequent for better reliability
          
          // Clean up interval on unsubscribe
          return () => {
            clearInterval(heartbeatInterval);
          };
        }
      });
    
    // Cleanup function
    return () => {
      console.log('Cleaning up presence channel');
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