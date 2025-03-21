import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const usePresence = (userId: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  useEffect(() => {
    if (!userId) return;
    
    // Update user's last_seen in profiles table
    const updateLastSeen = async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating last_seen:', error);
      }
    };
    
    // Update last_seen immediately and then every 30 seconds
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 30000);
    
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
        }
      });
    
    // Set up event listeners for page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateLastSeen();
        presenceChannel.track({ user_id: userId });
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
      clearInterval(interval);
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