import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export interface Notification {
  id: string;
  user_id: string;
  match_id?: string;
  type: 'new_match' | 'match_accepted' | 'match_rejected' | 'match_completed' | 'system' | 'new_message';
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get message sender info and enhance the toast notification
  const getSenderInfoForMessageNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      // First get the notification details with match_id
      const { data: notificationData, error: notifError } = await supabase
        .from('request_notifications')
        .select('*')
        .eq('id', notificationId)
        .single();
        
      if (notifError || !notificationData) {
        console.error("Error fetching notification details:", notifError);
        return;
      }
      
      // Check if it's a message notification but doesn't have the match_id we need
      if (notificationData.type === 'new_message' && !notificationData.match_id) {
        // We don't have sender info here, but we still show a generic notification
        return;
      }
      
      // If there's a match_id, we could enhance the notification further
      // For example, get the sender's profile to show their name
      // This is just placeholder logic since we don't know your exact database structure
      if (notificationData.match_id) {
        toast.success('New message from chat', {
          duration: 4000,
          icon: '💬'
        });
      }
    } catch (err) {
      console.error("Error fetching message details:", err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching notifications for user:", user.id);
      // Fetch notifications from the existing request_notifications table
      const { data, error: fetchError } = await supabase
        .from('request_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error("Error fetching notifications:", fetchError);
        throw fetchError;
      }

      console.log("Notifications received:", data);
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('request_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const { error: updateError } = await supabase
        .from('request_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (updateError) throw updateError;

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Initial fetch and setup real-time updates
  useEffect(() => {
    if (!user) return;

    console.log("Setting up notifications for user:", user.id);
    fetchNotifications();

    // Set up real-time subscription to request_notifications
    const channel = supabase
      .channel('request_notifications_changes')
      .on('postgres_changes', 
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'request_notifications',
          filter: `user_id=eq.${user.id}`,
        }, 
        (payload) => {
          console.log('Notification change received!', payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new notification to the list
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Generate appropriate notification message based on type
            let message = 'You have a new notification';
            switch (newNotification.type) {
              case 'new_match':
                message = 'You have a new match request';
                break;
              case 'match_accepted':
                message = 'Your match request was accepted';
                break;
              case 'match_rejected':
                message = 'Your match request was rejected';
                break;
              case 'match_completed':
                message = 'A match was completed';
                break;
              case 'new_message':
                message = 'You have a new message';
                // For message notifications, we'll try to get details asynchronously
                getSenderInfoForMessageNotification(newNotification.id);
                break;
            }
            
            toast.success(message, {
              duration: 4000,
              icon: '🔔'
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            // Update the notification in the list
            const updatedNotification = payload.new as Notification;
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
            // Recalculate unread count
            setNotifications(notifications => {
              setUnreadCount(notifications.filter(n => !n.is_read).length);
              return notifications;
            });
          }
          else if (payload.eventType === 'DELETE') {
            // Remove the notification from the list
            const oldNotification = payload.old as Notification;
            setNotifications(prev => 
              prev.filter(n => n.id !== oldNotification.id)
            );
            // Recalculate unread count
            setNotifications(notifications => {
              setUnreadCount(notifications.filter(n => !n.is_read).length);
              return notifications;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Notification subscription status:", status);
      });

    // Clean up on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}; 