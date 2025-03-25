import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Bell, Check, MessageSquare, AlertCircle, ShoppingBag, Zap, ChevronLeft } from 'lucide-react';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Filter notifications based on selected filters
  const filteredNotifications = notifications.filter(notification => {
    // Apply read/unread filter
    if (filter === 'unread' && notification.is_read) return false;
    
    // Apply type filter if selected
    if (selectedType && notification.type !== selectedType) return false;
    
    return true;
  });
  
  // Group notifications by date
  const groupedNotifications: Record<string, Notification[]> = {};
  
  filteredNotifications.forEach(notification => {
    const date = new Date(notification.created_at).toLocaleDateString();
    if (!groupedNotifications[date]) {
      groupedNotifications[date] = [];
    }
    groupedNotifications[date].push(notification);
  });
  
  // Get notification icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case 'new_match':
      case 'match_accepted':
      case 'match_rejected':
      case 'match_completed':
        return ShoppingBag;
      case 'new_message':
        return MessageSquare;
      default:
        return Zap;
    }
  };
  
  // Get notification title based on type
  const getTitle = (type: string) => {
    switch (type) {
      case 'new_match':
        return 'New Match Request';
      case 'match_accepted':
        return 'Match Accepted';
      case 'match_rejected':
        return 'Match Rejected';
      case 'match_completed':
        return 'Match Completed';
      case 'new_message':
        return 'New Message';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };
  
  // Get notification message based on type
  const getMessage = (type: string) => {
    switch (type) {
      case 'new_match':
        return 'Someone wants to match with you!';
      case 'match_accepted':
        return 'Your match request was accepted!';
      case 'match_rejected':
        return 'Your match request was declined.';
      case 'match_completed':
        return 'A match was successfully completed.';
      case 'new_message':
        return 'You have a new message!';
      default:
        return 'You have a new notification.';
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'new_match':
      case 'match_accepted':
      case 'match_rejected':
      case 'match_completed':
        navigate('/matches');
        break;
      case 'new_message':
        navigate('/messages');
        break;
      default:
        // Default to homepage for unknown types
        navigate('/');
    }
  };
  
  // Check if there are any notifications to display
  const hasNotifications = Object.keys(groupedNotifications).length > 0;
  
  // Get unique notification types from current notifications
  const notificationTypes = [...new Set(notifications.map(n => n.type))];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Back</span>
          </button>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            
            {notifications.length > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white dark:bg-dark-bg-secondary shadow-sm rounded-lg mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Status:</span>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                className="mt-1 text-sm rounded-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 dark:bg-dark-bg-tertiary"
              >
                <option value="all">All notifications</option>
                <option value="unread">Unread only</option>
              </select>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Type:</span>
              <select 
                value={selectedType || ''}
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="mt-1 text-sm rounded-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 dark:bg-dark-bg-tertiary"
              >
                <option value="">All types</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>{getTitle(type)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Notifications List */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : !hasNotifications ? (
            <div className="text-center py-12 bg-white dark:bg-dark-bg-secondary shadow-sm rounded-lg">
              <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {filter === 'unread' 
                  ? "You don't have any unread notifications." 
                  : "You don't have any notifications yet."}
              </p>
              {filter === 'unread' && notifications.length > 0 && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
              <div key={date} className="bg-white dark:bg-dark-bg-secondary shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg-tertiary border-b dark:border-dark-border">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">{date}</h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-dark-border">
                  {dayNotifications.map(notification => {
                    const IconComponent = getIcon(notification.type);
                    return (
                      <div 
                        key={notification.id} 
                        className={`p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary ${
                          !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-full ${
                              notification.is_read 
                                ? 'bg-gray-100 dark:bg-dark-bg-tertiary' 
                                : 'bg-primary-100 dark:bg-primary-900/20'
                            }`}>
                              <IconComponent className={`h-5 w-5 ${
                                notification.is_read 
                                  ? 'text-gray-500 dark:text-gray-400' 
                                  : 'text-primary-600 dark:text-primary-400'
                              }`} />
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                notification.is_read 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-primary-600 dark:text-primary-400'
                              }`}>
                                {getTitle(notification.type)}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {getMessage(notification.type)}
                            </p>
                            {!notification.is_read && (
                              <div className="mt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                >
                                  <Check className="mr-1 h-3 w-3" />
                                  Mark as read
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 