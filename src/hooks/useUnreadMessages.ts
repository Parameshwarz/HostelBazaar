import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();
  const channelRef = useRef<any>(null);

  // Function to create a message notification
  const createMessageNotification = async (messageData: any) => {
    if (!user) return;
    
    try {
      console.log("Creating message notification for message:", messageData);
      
      // Check if sender exists
      const { data: senderData, error: senderError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', messageData.sender_id)
        .single();
        
      if (senderError) {
        console.error("Error fetching sender profile:", senderError);
        return;
      }
      
      const senderName = senderData?.username || 'Someone';
      
      // Create a notification in the request_notifications table
      const { error } = await supabase
        .from('request_notifications')
        .insert([
          {
            user_id: user.id,
            type: 'new_message',
            is_read: false
          }
        ]);
        
      if (error) {
        console.error("Error creating message notification:", error);
      } else {
        console.log("Message notification created successfully");
      }
    } catch (err) {
      console.error("Error in createMessageNotification:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Initial fetch of unread messages
    const fetchUnreadCount = async () => {
      try {
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
      } catch (err) {
        console.error('Error in fetchUnreadCount:', err);
      }
    };

    fetchUnreadCount();

    // Clean up any existing subscription
    if (channelRef.current) {
      console.log('Cleaning up previous unread messages subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Subscribe to new messages with a unique channel name
    const channel = supabase
      .channel(`messages-${user.id}-${Date.now()}`) // Add timestamp to make channel name unique
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        console.log('Message change detected:', payload); // Debug log
        if (payload.eventType === 'INSERT' && payload.new.status === 'sent') {
          setUnreadCount(prev => prev + 1);
          
          // Create a notification for the new message
          createMessageNotification(payload.new);
        } else if (payload.eventType === 'UPDATE' && payload.new.status === 'read') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe((status) => {
        console.log(`Unread messages subscription status: ${status}`);
      });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up unread messages subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  return unreadCount;
}; 