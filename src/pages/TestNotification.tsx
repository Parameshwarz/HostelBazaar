import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

/**
 * Test page for the notification system
 * This page is only for admin/development purposes to test different notification types
 */
const TestNotificationPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [notificationType, setNotificationType] = useState<string>('new_match');
  
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('request_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUserNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Could not fetch notifications");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('table_db_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'request_notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        console.log('New notification received!', payload);
        toast.success('New notification received');
        fetchNotifications();
      })
      .subscribe(status => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const createTestNotification = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setLoading(true);
    try {
      // Check if the selected notification type is valid
      if (!['new_match', 'match_accepted', 'match_rejected', 'match_completed'].includes(notificationType)) {
        toast.error('Invalid notification type');
        setLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from('request_notifications')
        .insert([
          {
            user_id: user.id,
            type: notificationType,
            is_read: false
          }
        ]);

      if (error) {
        throw error;
      }
      
      toast.success(`Test ${notificationType} notification created!`);
      fetchNotifications();
    } catch (err: any) {
      console.error('Error creating notification:', err);
      toast.error(err.message || 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Request Notification Test Page</h2>
            <p className="text-sm text-gray-500 mt-1">
              This page is for testing the notification system. It allows you to create test notifications to verify 
              that the notification system is working properly.
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <p className="text-gray-700 mb-4">
                {user ? `Logged in as: ${user.email}` : 'Not logged in'}
              </p>

              <div className="mb-4">
                <label htmlFor="notificationType" className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Type
                </label>
                <select
                  id="notificationType"
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="new_match">New Match Request</option>
                  <option value="match_accepted">Match Accepted</option>
                  <option value="match_rejected">Match Rejected</option>
                  <option value="match_completed">Match Completed</option>
                </select>
              </div>

              <button
                onClick={createTestNotification}
                disabled={loading || !user}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Test Notification'}
              </button>
            </div>
            
            <div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Note: The 'system' type is not available because it's not supported by the database.
                      Message notifications are created automatically when you receive new messages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-4">Your Request Notifications:</h3>
              {userNotifications.length > 0 ? (
                <div className="space-y-3">
                  {userNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border rounded-lg ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
                    >
                      <p className="font-medium">Type: {notification.type}</p>
                      {notification.match_id && (
                        <p className="text-gray-600">Match ID: {notification.match_id}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No notifications found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNotificationPage; 