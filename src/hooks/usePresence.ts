import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Use a direct broadcast approach instead of Supabase presence
export const usePresence = (userId: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<any>(null);
  
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    // Simple channel name with no special configuration
    const channelName = 'online:users';
    console.log(`Setting up BROADCAST-BASED presence for user ${userId}`);
    
    // Create a broadcast channel instead of a presence channel
    const channel = supabase.channel(channelName);
    channelRef.current = channel;
    
    // Store last seen timestamps
    const onlineTimestamps = new Map<string, number>();
    
    // Clean up stale users every 15 seconds
    const cleanupStaleUsers = () => {
      const now = Date.now();
      const staleThreshold = 30000; // 30 seconds
      let changed = false;
      
      onlineTimestamps.forEach((timestamp, id) => {
        if (now - timestamp > staleThreshold) {
          console.log(`User ${id} is stale, removing from online users`);
          onlineTimestamps.delete(id);
          changed = true;
        }
      });
      
      if (changed) {
        setOnlineUsers(Array.from(onlineTimestamps.keys()));
      }
    };
    
    // Register event handlers
    channel
      .on('broadcast', { event: 'presence' }, (payload) => {
        try {
          console.log('Received presence broadcast:', payload);
          
          if (!payload || !payload.payload || !payload.payload.user_id) {
            console.error('Invalid presence payload', payload);
            return;
          }
          
          const broadcastUserId = payload.payload.user_id;
          
          // Skip our own broadcasts
          if (broadcastUserId === userId) {
            return;
          }
          
          // Record timestamp of the user
          onlineTimestamps.set(broadcastUserId, Date.now());
          
          // Update online users
          const onlineUsersList = Array.from(onlineTimestamps.keys());
          console.log('Updated online users from broadcast:', onlineUsersList);
          setOnlineUsers(onlineUsersList);
          
        } catch (error) {
          console.error('Error processing presence broadcast:', error);
        }
      })
      .subscribe((status) => {
        console.log(`Presence broadcast channel status: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to presence broadcasts');
          setLoading(false);
          
          // Start sending regular heartbeats
          const sendHeartbeat = () => {
            try {
              channel.send({
                type: 'broadcast',
                event: 'presence',
                payload: {
                  user_id: userId,
                  online_at: new Date().toISOString()
                }
              });
              console.log('Presence heartbeat broadcast sent');
            } catch (error) {
              console.error('Error sending presence heartbeat:', error);
            }
          };
          
          // Send initial heartbeat
          sendHeartbeat();
          
          // Send heartbeat every 5 seconds
          heartbeatIntervalRef.current = setInterval(() => {
            sendHeartbeat();
            cleanupStaleUsers();
          }, 5000);
        }
      });
    
    // Cleanup function
    return () => {
      console.log('Cleaning up presence broadcast subscription');
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      if (channelRef.current) {
        try {
          // Send offline status before unsubscribing
          channelRef.current.send({
            type: 'broadcast',
            event: 'presence',
            payload: {
              user_id: userId,
              offline: true
            }
          }).catch(console.error);
          
          channelRef.current.unsubscribe();
          channelRef.current = null;
        } catch (error) {
          console.error('Error unsubscribing from presence channel:', error);
        }
      }
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