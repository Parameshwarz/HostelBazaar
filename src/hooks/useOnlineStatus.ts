import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useOnlineStatus = (userId: string) => {
  const [isOnline, setIsOnline] = useState(false);
  
  // Update user's online status
  const updateOnlineStatus = useCallback(async (status: boolean) => {
    if (!userId) return;
    
    try {
      console.log(`Updating online status for user ${userId} to ${status}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          last_seen: status ? new Date().toISOString() : null,
          is_online: status
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating online status:', error);
      }
    } catch (err) {
      console.error('Error in updateOnlineStatus:', err);
    }
  }, [userId]);
  
  // Set up presence subscription
  useEffect(() => {
    if (!userId) return;
    
    console.log('Setting up online status tracking');
    
    // Update status when coming online
    updateOnlineStatus(true);
    setIsOnline(true);
    
    // Set up subscription to track other users
    const subscription = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // This could be used to track all online users
      })
      .subscribe();
      
    // Update status on window events
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateOnlineStatus(true);
        setIsOnline(true);
      } else {
        updateOnlineStatus(false);
        setIsOnline(false);
      }
    };
    
    const handleBeforeUnload = () => {
      updateOnlineStatus(false);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Update status every 5 minutes to keep it fresh
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateOnlineStatus(true);
      }
    }, 5 * 60 * 1000);
    
    return () => {
      // Clean up
      updateOnlineStatus(false);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, [userId, updateOnlineStatus]);
  
  return { isOnline };
}; 