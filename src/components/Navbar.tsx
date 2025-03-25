import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, User, LogOut, ShoppingBag, MessageCircle, Mail, Package, 
  Briefcase, LayoutDashboard, ShoppingCart, Bell, ChevronDown, 
  Settings, UserCircle, CreditCard, Heart, Clock, Menu as MenuIcon,
  X, Home, BookOpen, Laptop, Sofa, Shirt, Coffee, Dumbbell, Gift,
  PlusCircle, HelpCircle, BarChart3, Volume2, VolumeX, Keyboard, Activity, Check, X as XMark, 
  MessageSquare, ArrowRight, AlertCircle, Zap, 
  Plus, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { toast } from 'react-hot-toast';
import { useFuzzySearch } from '../hooks/useFuzzySearch';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import DarkModeToggle from './DarkModeToggle';
import useSound from 'use-sound';
import { useHotkeys } from 'react-hotkeys-hook';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../hooks/useNotifications';
import { createSampleNotification } from '../services/notificationService';
import { signOutCompletely } from '../utils/auth';

interface NavLink {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  items?: {
    name: string;
    href: string;
    icon: React.ElementType;
    description: string;
  }[];
}

interface ProfileMenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

interface QuickAction {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

interface NotificationCategory {
  id: string;
  name: string;
  color: string;
  icon: React.ElementType;
}

interface Notification {
  id: string;
  user_id: string;
  match_id?: string;
  type: 'new_match' | 'match_accepted' | 'match_rejected' | 'match_completed' | 'system' | 'new_message';
  is_read: boolean;
  created_at: string;
}

export default function Navbar() {
  const { user, signOut, setUser } = useAuthStore();
  const unreadCount = useUnreadMessages();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { 
    notifications, 
    unreadCount: unreadNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const { items: searchResults, loading: searchLoading } = useFuzzySearch(searchTerm);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Add notification sound
  const [playNotificationSound] = useSound('/sounds/notification.mp3', { volume: 0.5 });

  // Notification categories
  const notificationCategories: NotificationCategory[] = [
    { id: 'trade', name: 'Trades', color: 'text-green-500', icon: ShoppingBag },
    { id: 'message', name: 'Messages', color: 'text-blue-500', icon: MessageSquare },
    { id: 'alert', name: 'Alerts', color: 'text-yellow-500', icon: AlertCircle },
    { id: 'system', name: 'System', color: 'text-purple-500', icon: Zap }
  ];

  // Keyboard shortcuts
  useHotkeys('shift+/', () => setShowKeyboardShortcuts(true));
  useHotkeys('esc', () => {
    setShowKeyboardShortcuts(false);
    setShowQuickActions(false);
  });

  // Quick actions
  const quickActionsList = [
    { name: 'New Trade Post', href: '/trade/new', icon: ShoppingBag },
    { name: 'New Service', href: '/services/new', icon: Briefcase },
    { name: 'Recent Activity', href: '#', icon: Activity, action: () => setShowQuickActions(true) }
  ];

  // Handle notification action
  const handleNotificationAction = (action: string, notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Mark notification as read first (for all actions)
    markAsRead(notificationId);
    
    // Play sound if enabled (for user feedback)
    if (soundEnabled) playNotificationSound();

    // Handle specific actions
    switch (action) {
      case 'accept':
        toast.success('Match request accepted');
        // Additional logic for accepting a match request
        break;
        
      case 'decline':
        toast.error('Match request declined');
        // Additional logic for declining a match request
        break;
        
      case 'reply':
        navigate('/messages');
        // The notification has already been marked as read
        toast.success('Navigating to messages to reply');
        break;
        
      case 'view':
        // Navigate to the appropriate page based on notification type
        if (notification.type === 'new_message') {
          navigate('/messages');
        } else if (notification.match_id) {
          navigate('/matches');
        }
        break;
    }
  };

  // Check if current path is services-related
  const isServicesSection = location.pathname.startsWith('/services');
  const isMerchSection = location.pathname.startsWith('/merch');
  const isTradeSection = location.pathname.startsWith('/trade');

  // Navigation links with dropdowns
  const navLinks: NavLink[] = [
    {
      name: 'Trade',
      href: '/trade',
      icon: ShoppingBag,
      description: 'Buy, sell, or exchange items with other students',
      items: [
        { 
          name: 'Electronics', 
          href: '/trade?category=electronics', 
          icon: Laptop,
          description: 'Laptops, phones, and other gadgets'
        },
        { 
          name: 'Books', 
          href: '/trade?category=books', 
          icon: BookOpen,
          description: 'Textbooks and study materials'
        },
        { 
          name: 'Furniture', 
          href: '/trade?category=furniture', 
          icon: Sofa,
          description: 'Dorm and room furniture'
        },
        { 
          name: 'Clothing', 
          href: '/trade?category=clothing', 
          icon: Shirt,
          description: 'Used clothing and accessories'
        }
      ]
    },
    {
      name: 'Services',
      href: '/services',
      icon: Briefcase,
      description: 'Find or offer student services',
      items: [
        { 
          name: 'Tutoring', 
          href: '/services?category=tutoring', 
          icon: BookOpen,
          description: 'Academic help and tutoring'
        },
        { 
          name: 'Technical', 
          href: '/services?category=technical', 
          icon: Laptop,
          description: 'Programming and tech support'
        },
        { 
          name: 'Projects', 
          href: '/services?category=projects', 
          icon: PlusCircle,
          description: 'Project collaboration'
        },
        { 
          name: 'Other', 
          href: '/services?category=other', 
          icon: HelpCircle,
          description: 'Other student services'
        }
      ]
    },
    {
      name: 'Merch',
      href: '/merch',
      icon: Package,
      description: 'Official college merchandise',
      items: [
        { 
          name: 'College Wear', 
          href: '/merch?category=college-wear', 
          icon: Shirt,
          description: 'Official college clothing'
        },
        { 
          name: 'Accessories', 
          href: '/merch?category=accessories', 
          icon: Gift,
          description: 'Bags, caps, and more'
        },
        { 
          name: 'Stationery', 
          href: '/merch?category=stationery', 
          icon: BookOpen,
          description: 'College branded stationery'
        },
        { 
          name: 'Memorabilia', 
          href: '/merch?category=memorabilia', 
          icon: Heart,
          description: 'Special college items'
        }
      ]
    }
  ];

  // Profile menu items
  const profileMenuItems: ProfileMenuItem[] = [
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserCircle,
      description: 'View and edit your profile'
    },
    { 
      name: 'Matches', 
      href: '/matches', 
      icon: MessageSquare,
      description: 'View and manage your request matches'
    },
    { 
      name: 'Dashboard', 
      href: '/services/dashboard', 
      icon: LayoutDashboard,
      description: 'Manage your services and analytics'
    },
    { 
      name: 'Orders', 
      href: '/orders', 
      icon: ShoppingCart,
      description: 'Track your orders and purchases'
    },
    { 
      name: 'Wishlist', 
      href: '/wishlist', 
      icon: Heart,
      description: 'Items you saved for later'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'Manage your preferences'
    },
    { 
      name: 'Help', 
      href: '/help', 
      icon: HelpCircle,
      description: 'Get support and FAQs'
    }
  ];

  // Quick action buttons that appear in the profile dropdown
  const quickActions: QuickAction[] = [
    {
      name: 'Sell Item',
      href: '/items/new',
      icon: PlusCircle,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      name: 'Offer Service',
      href: '/services/offer',
      icon: Briefcase,
      color: 'text-blue-600 dark:text-blue-400'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const searchParams = new URLSearchParams();
    searchParams.set('search', searchTerm.trim());
    if (searchResults.length > 0) {
      searchParams.set('fuzzy', 'true');
    }
    
    navigate(`/browse?${searchParams.toString()}`);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
  };

  // Add scroll progress tracking
  const { scrollYProgress } = useScroll();

  // Check localStorage for auth info if user is null
  useEffect(() => {
    if (!user) {
      const storedAuth = localStorage.getItem('hostelbazaar_auth');
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          console.log('Restoring auth from localStorage:', authData);
          
          // Fetch full profile from Supabase
          supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.userId)
            .single()
            .then(({ data: profile, error }) => {
              if (!error && profile) {
                setUser({
                  id: authData.userId,
                  email: authData.email,
                  username: profile.username,
                  avatar_url: profile.avatar_url
                });
              } else {
                console.error('Error restoring profile from localStorage:', error);
              }
            });
        } catch (err) {
          console.error('Failed to parse stored auth:', err);
        }
      }
    }
  }, [user, setUser]);

  const quickActionsPopover = (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg overflow-hidden w-96 border dark:border-dark-border">
      <div className="border-b dark:border-dark-border">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <button 
              onClick={() => setShowQuickActions(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Primary Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  className="flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg-tertiary 
                    hover:bg-gray-100 dark:hover:bg-dark-bg-quaternary rounded-lg p-4 transition-colors"
                  onClick={() => {
                    navigate(action.href);
                    setShowQuickActions(false);
                  }}
                >
                  <div className={`p-3 rounded-full ${action.color} mb-2`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              <div 
                className="flex items-center p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg 
                hover:bg-gray-100 dark:hover:bg-dark-bg-quaternary transition-colors cursor-pointer"
                onClick={() => {
                  if (user) {
                    // Create a sample notification
                    createSampleNotification(user.id);
                  } else {
                    toast.error('You must be logged in to create notifications');
                  }
                  setShowQuickActions(false);
                }}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Recent Activity Sample</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tap to create a sample notification</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => {
    // Filter out read notifications for the navbar display
    const unreadNotificationsOnly = notifications.filter(n => !n.is_read);
    
    return (
      <div className="max-h-96 overflow-y-auto">
        {unreadNotificationsOnly.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-dark-border">
            {unreadNotificationsOnly.map((notification) => {
              // Determine title and message based on notification type
              let title = 'Notification';
              let message = '';
              let icon = notificationCategories.find(c => c.id === 'system')?.icon;
              
              switch (notification.type) {
                case 'new_match':
                  title = 'New Match Request';
                  message = 'Someone wants to match with you!';
                  icon = notificationCategories.find(c => c.id === 'trade')?.icon;
                  break;
                case 'match_accepted':
                  title = 'Match Accepted';
                  message = 'Your match request was accepted!';
                  icon = notificationCategories.find(c => c.id === 'trade')?.icon;
                  break;
                case 'match_rejected':
                  title = 'Match Rejected';
                  message = 'Your match request was declined.';
                  icon = notificationCategories.find(c => c.id === 'alert')?.icon;
                  break;
                case 'match_completed':
                  title = 'Match Completed';
                  message = 'A match was successfully completed.';
                  icon = notificationCategories.find(c => c.id === 'trade')?.icon;
                  break;
                case 'new_message':
                  title = 'New Message';
                  message = 'You have a new message!';
                  icon = notificationCategories.find(c => c.id === 'message')?.icon;
                  break;
                default:
                  title = `${notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
                  message = 'You have a new notification.';
                  icon = notificationCategories.find(c => c.id === 'system')?.icon;
              }
              
              const IconComponent = icon || Bell;
              
              return (
                <div 
                  key={notification.id}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <IconComponent className="h-5 w-5 text-gray-500 dark:text-dark-text-secondary" />
                    </div>
                    <div className="ml-3 w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                        {title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
                        {message}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        {notification.type === 'new_match' && (
                          <>
                            <button
                              onClick={() => handleNotificationAction('accept', notification.id)}
                              className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleNotificationAction('decline', notification.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {notification.type === 'new_message' && (
                          <button
                            onClick={() => handleNotificationAction('reply', notification.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Reply
                          </button>
                        )}
                        <button
                          onClick={() => handleNotificationAction('view', notification.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-400 dark:text-dark-text-tertiary">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-dark-text-secondary">
            <Bell className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-dark-text-tertiary" />
            <p className="text-sm">No new notifications</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-bg-tertiary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
                <ShoppingBag className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  Hostel Bazaar
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                {navLinks.map((link) => (
                  <div key={link.name} className="relative group">
                    <Link
                      to={link.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        location.pathname.startsWith(link.href)
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10'
                          : 'text-gray-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      <link.icon className="h-5 w-5 mr-1.5" />
                      {link.name}
                      {link.items && (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Link>

                    {/* Mega Menu Dropdown */}
                    {link.items && (
                      <div className="absolute left-0 w-screen max-w-md mt-2 px-2 opacity-0 invisible 
                      group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="relative grid gap-6 bg-white dark:bg-dark-bg-secondary p-6 
                        rounded-2xl shadow-xl border border-gray-100 dark:border-dark-bg-tertiary">
                          {link.items.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-start p-3 -m-3 rounded-lg hover:bg-gray-50 
                              dark:hover:bg-dark-bg-tertiary transition-colors"
                            >
                              <item.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl px-8">
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search laptops, phones, used items under ₹5000..."
                  className="w-full pl-10 pr-20 py-2.5 bg-gray-50 dark:bg-dark-bg-tertiary border 
                  border-gray-200 dark:border-dark-bg-tertiary rounded-full text-gray-900 
                  dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
                  transition-all duration-200"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 
                  bg-primary-600 dark:bg-primary-500 text-white text-sm font-medium rounded-full
                  hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Search Results Dropdown */}
              <div className="relative">
                <AnimatePresence>
                  {showResults && searchTerm.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute w-full mt-2 bg-white dark:bg-dark-bg-secondary rounded-lg 
                      shadow-lg border border-gray-100 dark:border-dark-bg-tertiary max-h-96 
                      overflow-auto z-50"
                    >
                      {searchLoading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-2">
                          {searchResults.slice(0, 5).map((item) => (
                            <Link
                              key={item.id}
                              to={`/items/${item.id}`}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 
                              dark:hover:bg-dark-bg-tertiary transition-colors"
                              onClick={() => setShowResults(false)}
                            >
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {item.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ₹{item.price}
                                </p>
                              </div>
                            </Link>
                          ))}
                          {searchResults.length > 5 && (
                            <button
                              onClick={handleSearch}
                              className="w-full px-4 py-2 text-sm text-primary-600 
                              dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary 
                              transition-colors"
                            >
                              View all {searchResults.length} results
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No exact matches found. Try the search to see similar items.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2">
              <DarkModeToggle />

              {user ? (
                <>
                  {/* Notifications Dropdown */}
                  <Menu as="div" className="relative ml-2">
                    <Menu.Button className="relative p-1.5 text-gray-500 dark:text-dark-text-secondary rounded-full
                      hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-primary-600">
                      <span className="absolute -inset-1.5" />
                      <Bell className="h-6 w-6" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      )}
                    </Menu.Button>
                    <Transition
                      as={React.Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-30 mt-2 w-96 max-w-[90vw] origin-top-right rounded-lg bg-white 
                        dark:bg-dark-bg-secondary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-2">
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-dark-border">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</h3>
                            {notifications.length > 0 && (
                              <button
                                onClick={() => markAllAsRead()}
                                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 
                                dark:hover:text-primary-300 transition-colors"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                        </div>
                        {renderNotifications()}
                        <Link
                          to="/notifications"
                          className="block mt-2 px-3 py-2 text-sm text-center text-primary-600 
                          hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          View all notifications
                          <ChevronRight className="ml-1 inline-block h-4 w-4" />
                        </Link>
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* Messages */}
                  <Link 
                    to="/messages" 
                    className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 
                    dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100 
                    dark:hover:bg-dark-bg-tertiary"
                  >
                    <MessageCircle className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full 
                      text-[10px] text-white flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Profile Dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 
                    dark:hover:text-primary-400 transition-colors rounded-full hover:bg-gray-100 
                    dark:hover:bg-dark-bg-tertiary">
                      <User className="h-6 w-6" />
                    </Menu.Button>
                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-in"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Menu.Items className="absolute right-0 w-80 mt-2 bg-white dark:bg-dark-bg-secondary 
                      rounded-xl shadow-lg border border-gray-100 dark:border-dark-bg-tertiary 
                      focus:outline-none overflow-hidden">
                        {/* User Info */}
                        <div className="p-4 bg-gray-50 dark:bg-dark-bg-tertiary border-b 
                        border-gray-100 dark:border-dark-bg-tertiary">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 
                            flex items-center justify-center">
                              <UserCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user?.email || 'Your Account'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                View and edit profile
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-2 border-b border-gray-100 dark:border-dark-bg-tertiary">
                          <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action) => (
                              <Link
                                key={action.name}
                                to={action.href}
                                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 
                                dark:hover:bg-dark-bg-tertiary transition-colors"
                              >
                                <action.icon className={`h-6 w-6 ${action.color}`} />
                                <span className={`text-xs font-medium mt-1 ${action.color}`}>
                                  {action.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          {profileMenuItems.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  className={`flex items-start gap-3 px-3 py-2 text-sm rounded-lg ${
                                    active 
                                      ? 'bg-gray-50 dark:bg-dark-bg-tertiary text-primary-600 dark:text-primary-400' 
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  <item.icon className="h-5 w-5 mt-0.5" />
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                          <hr className="my-2 border-gray-100 dark:border-dark-bg-tertiary" />
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  // Only clear auth-related items
                                  const authKeysToRemove = [
                                    'hostelbazaar-auth',
                                    'hostelbazaar_auth',
                                    'supabase.auth.token',
                                    'sb-localhost-auth-token', 
                                    'sb:token',
                                    'supabase.auth.refreshToken',
                                    'supabase.auth.accessToken',
                                    // Safari-specific items
                                    'sb-' + window.location.hostname + '-auth-token'
                                  ];
                                  
                                  // Clear all keys from localStorage - needed for Safari
                                  for (let i = 0; i < localStorage.length; i++) {
                                    const key = localStorage.key(i);
                                    if (key && (key.includes('auth') || key.includes('token') || 
                                        key.includes('sb-') || key.includes('supabase'))) {
                                      localStorage.removeItem(key);
                                    }
                                  }
                                  
                                  // Clear ALL session storage (Safari's handling is different)
                                  sessionStorage.clear();
                                  
                                  // Force removal of auth cookies - handle Safari specially
                                  document.cookie.split(";").forEach(c => {
                                    // Safari requires more specific cookie clearing
                                    const cookieName = c.split("=")[0].trim();
                                    
                                    // Delete cookie with all possible path/domain combinations
                                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
                                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                                  });
                                  
                                  // Call Supabase sign out directly (needed for Safari)
                                  try {
                                    supabase.auth.signOut();
                                  } catch (e) {
                                    console.error("Error signing out from Supabase:", e);
                                  }
                                  
                                  // Reset auth state
                                  setUser(null);
                                  
                                  // Safari sometimes caches the page - force a full reload, not just navigation
                                  setTimeout(() => {
                                    window.location.href = window.location.origin + '/?t=' + new Date().getTime();
                                  }, 100);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                                  active 
                                    ? 'bg-gray-50 dark:bg-dark-bg-tertiary text-red-600 dark:text-red-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                <LogOut className="h-5 w-5" />
                                <div>
                                  <p className="font-medium">Sign Out</p>
                                  <p className="text-xs text-red-500/80 dark:text-red-400/80 mt-0.5">
                                    Log out of your account
                                  </p>
                                </div>
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm 
                  font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 
                  dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 
                  dark:focus:ring-offset-dark-bg-secondary"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-dark-bg-secondary 
              shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 
              dark:border-dark-bg-tertiary">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 
                  dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {user && (
                  <Link
                    to="/matches"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                  >
                    <MessageSquare className="h-6 w-6 mr-3 text-primary-600 dark:text-primary-400" />
                    Matches
                  </Link>
                )}
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      to={link.href}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-900 
                      dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                    >
                      <link.icon className="h-6 w-6 mr-3 text-primary-600 dark:text-primary-400" />
                      {link.name}
                    </Link>
                    {link.items && (
                      <div className="ml-8 mt-2 space-y-2">
                        {link.items.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-600 
                            dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                          >
                            <item.icon className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-xl w-full max-w-lg 
              overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Keyboard className="w-5 h-5" />
                    Keyboard Shortcuts
                  </h2>
                  <button
                    onClick={() => setShowKeyboardShortcuts(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                    dark:hover:text-gray-200"
                  >
                    <XMark className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid gap-4">
                  {[
                    { key: '?', description: 'Show keyboard shortcuts' },
                    { key: 'N', description: 'Create new post' },
                    { key: 'M', description: 'Go to messages' },
                    { key: 'P', description: 'Go to profile' },
                    { key: 'S', description: 'Search' },
                    { key: 'Esc', description: 'Close modals' }
                  ].map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-bg-tertiary rounded text-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-dark-bg-secondary shadow-xl z-50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                  dark:hover:text-gray-200"
                >
                  <XMark className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {quickActionsList.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    onClick={action.action}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 
                    dark:hover:bg-dark-bg-tertiary group transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/10 
                    text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 
                    dark:group-hover:bg-primary-900/20 transition-colors">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.name}
                      </h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 
                    dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors" />
                  </Link>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 
                      dark:hover:bg-dark-bg-tertiary transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg-tertiary">
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Quick Post Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-6 bottom-6 p-4 bg-primary-600 dark:bg-primary-500 text-white 
        rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => navigate('/items/new')}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-500 
        origin-left z-50"
        style={{
          scaleX: scrollYProgress
        }}
      />
    </>
  );
}