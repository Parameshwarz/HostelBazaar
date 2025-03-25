import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { getOrCreateChannel } from '../lib/supabase'; // Import the channel helper

export interface Notification {
  id: string;
  user_id: string;
  match_id?: string;
  type: 'new_match' | 'match_accepted' | 'match_rejected' | 'match_completed' | 'system' | 'new_message';
  is_read: boolean;
  created_at: string;
}

// Add notification cache with sessionStorage to prevent multiple fetches
const getFromCache = (userId: string) => {
  const cached = sessionStorage.getItem(`notifications_${userId}`);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      // Cache is valid for 1 minute
      if (Date.now() - timestamp < 60000) {
        return data;
      }
    } catch (e) {
      console.error('Error parsing notification cache:', e);
    }
  }
  return null;
};

const saveToCache = (userId: string, data: Notification[]) => {
  try {
    sessionStorage.setItem(
      `notifications_${userId}`,
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    );
  } catch (e) {
    console.error('Error saving notification cache:', e);
  }
};

export const useNotifications = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  
  // Track if we've already fetched notifications
  const initialFetchDoneRef = useRef(false);

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

  // Memoize fetchNotifications to avoid recreating on each render
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Try to get from cache first
    const cachedData = getFromCache(user.id);
    if (cachedData) {
      console.log("Using cached notifications");
      setNotifications(cachedData);
      setUnreadCount(cachedData.filter(n => !n.is_read).length || 0);
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching notifications for user:", user.id);
      // Fetch notifications from the existing request_notifications table
      const { data, error: fetchError } = await supabase
        .from('request_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to 50 most recent notifications for better performance

      if (fetchError) {
        console.error("Error fetching notifications:", fetchError);
        throw fetchError;
      }

      console.log("Notifications received:", data);
      // Save to cache
      if (data) {
        saveToCache(user.id, data);
      }
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
      initialFetchDoneRef.current = true;
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('request_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      // Update local state without refetching
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update cache
      if (user) {
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? {...n, is_read: true} : n
        );
        saveToCache(user.id, updatedNotifications);
      }
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

      // Update local state without refetching
      const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      
      // Update cache
      saveToCache(user.id, updatedNotifications);
      
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
    
    // Only fetch on initial mount or user change
    if (!initialFetchDoneRef.current) {
      fetchNotifications();
    }

    // Set up real-time subscription to request_notifications
    // Use the channel helper to avoid creating too many channels
    const channelName = `request_notifications_${user.id}`;
    const channel = getOrCreateChannel(channelName);
    
    channelRef.current = channel
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
            
            // Update local state
            setNotifications(prev => {
              const updated = [newNotification, ...prev];
              // Update cache
              if (user) saveToCache(user.id, updated);
              return updated;
            });
            
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
            
            // Update local state
            setNotifications(prev => {
              const updated = prev.map(n => n.id === updatedNotification.id ? updatedNotification : n);
              // Update cache
              if (user) saveToCache(user.id, updated);
              return updated;
            });
            
            // Recalculate unread count
            setUnreadCount(prev => {
              // Count unread notifications
              return notifications.filter(n => !n.is_read).length;
            });
          }
          else if (payload.eventType === 'DELETE') {
            // Remove the notification from the list
            const oldNotification = payload.old as Notification;
            
            // Update local state
            setNotifications(prev => {
              const updated = prev.filter(n => n.id !== oldNotification.id);
              // Update cache
              if (user) saveToCache(user.id, updated);
              return updated;
            });
            
            // Recalculate unread count
            setUnreadCount(prev => {
              // Count unread notifications
              return notifications.filter(n => !n.is_read).length;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Notification subscription status:", status);
      });

    // Clean up on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, fetchNotifications]);

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