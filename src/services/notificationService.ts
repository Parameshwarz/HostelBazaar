import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  category: 'trade' | 'message' | 'alert' | 'system';
  action_url?: string;
  related_id?: string;
  related_type?: string;
}

/**
 * Create a new notification for a user
 */
export const createNotification = async (data: CreateNotificationData) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        ...data,
        is_read: false,
        created_at: new Date().toISOString(),
      }]);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error creating notification:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error marking notification as read:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error marking all notifications as read:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Create a sample notification for testing
 */
export const createSampleNotification = async (userId: string) => {
  if (!userId) {
    toast.error('You must be logged in to create a notification');
    return { success: false };
  }

  const sampleData: CreateNotificationData = {
    user_id: userId,
    title: 'Sample Notification',
    message: 'This is a sample notification for testing purposes',
    category: 'system',
    action_url: '/settings',
  };

  const result = await createNotification(sampleData);
  
  if (result.success) {
    toast.success('Sample notification created');
  } else {
    toast.error('Failed to create sample notification');
  }
  
  return result;
}; 