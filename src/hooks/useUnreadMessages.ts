import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // Initial fetch of unread messages
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('status', 'sent');

      if (error) {
        console.error('Error fetching unread messages:', error);
        return;
      }

      if (count !== null) {
        console.log('Unread messages count:', count); // Debug log
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        console.log('Message change detected:', payload); // Debug log
        if (payload.eventType === 'INSERT' && payload.new.status === 'sent') {
          setUnreadCount(prev => prev + 1);
        } else if (payload.eventType === 'UPDATE' && payload.new.status === 'read') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return unreadCount;
}; 