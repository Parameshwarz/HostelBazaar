import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const usePresence = (userId: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  useEffect(() => {
    if (!userId) return;
    
    // Subscribe to presence updates
    const presenceChannel = supabase.channel('online-users');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineUserIds = Object.keys(state).map(key => key.replace('user-', ''));
        setOnlineUsers(onlineUserIds);
        console.log('Online users:', onlineUserIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: userId });
          console.log('Presence tracking started for user:', userId);
        }
      });
    
    // Set up event listeners for page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        presenceChannel.track({ user_id: userId });
        console.log('User became visible, tracking presence again');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle user going offline
    const handleBeforeUnload = () => {
      presenceChannel.untrack();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up event listeners and subscription
    return () => {
      presenceChannel.untrack();
      presenceChannel.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);
  
  const isUserOnline = (id: string): boolean => {
    return onlineUsers.includes(id);
  };
  
  return { onlineUsers, isUserOnline };
}; 