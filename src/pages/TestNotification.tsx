import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

/**
 * Simple test page to directly test request notifications
 */
const TestNotificationPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  
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
      const { error } = await supabase
        .from('request_notifications')
        .insert([
          {
            user_id: user.id,
            type: 'system',
            is_read: false
          }
        ]);

      if (error) {
        throw error;
      }
      
      toast.success('Test notification created!');
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
            <h2 className="text-xl font-semibold text-gray-900">Request Notification System Test</h2>
            <p className="text-sm text-gray-500 mt-1">
              Test the request notification system directly
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <p className="text-gray-700 mb-4">
                {user ? `Logged in as: ${user.email}` : 'Not logged in'}
              </p>

              <button
                onClick={createTestNotification}
                disabled={loading || !user}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Test Request Notification'}
              </button>
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