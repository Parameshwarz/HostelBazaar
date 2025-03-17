import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  Clock,
  AlertTriangle,
  ThumbsUp,
  TrendingUp,
  BookOpen,
  Laptop,
  Sofa,
  Shirt,
  UtensilsCrossed,
  BarChart3,
  SlidersHorizontal,
  X,
  ChevronDown,
  Calendar,
  MapPin,
  Plus,
  CheckCircle
} from 'lucide-react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import RequestCard from '../components/requests/RequestCard';
import RequestDetail from '../components/requests/RequestDetail';
import type { RequestItem, RequestFilters, UrgencyLevel, RequestStatus, TradingItem } from '../types/trade';
import { Helmet } from 'react-helmet';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 12;

// Urgency options with icons
const urgencyOptions = [
  { value: 'high', label: 'High Priority', icon: AlertTriangle, color: 'text-rose-600' },
  { value: 'medium', label: 'Medium Priority', icon: Clock, color: 'text-amber-600' },
  { value: 'low', label: 'Low Priority', icon: ThumbsUp, color: 'text-emerald-600' }
];

// Status options
const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'matched', label: 'Matched' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'closed', label: 'Closed' }
];

// Sort options
const sortOptions = [
  { value: 'urgency', label: 'Most Urgent', icon: AlertTriangle },
  { value: 'created_at', label: 'Latest First', icon: Clock },
  { value: 'budget', label: 'Budget: High to Low', icon: TrendingUp },
  { value: 'matches', label: 'Most Matches', icon: ThumbsUp }
];

// Time frame options
const timeFrameOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' }
];

// Quick Response Modal Component
interface QuickResponseModalProps {
  request: RequestItem | null;
  onClose: () => void;
  onSubmit: (requestId: string, itemId: string, message: string) => Promise<void>;
}

function QuickResponseModal({ request, onClose, onSubmit }: QuickResponseModalProps) {
  const [userItems, setUserItems] = useState<TradingItem[]>([]);
  const [isQuickResponse, setIsQuickResponse] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state for quick response
  const [quickResponseForm, setQuickResponseForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'good' as const,
  });

  useEffect(() => {
    const fetchUserItems = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_type', 'sell');
      
      if (error) {
        console.error('Error fetching user items:', error);
        return;
      }
      
      setUserItems(data || []);
    };

    fetchUserItems();
  }, [user]);

  const handleQuickResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !request) return;

    setIsLoading(true);
    try {
      // First create a new item
      const { data: newItem, error: itemError } = await supabase
        .from('items')
        .insert({
          title: quickResponseForm.title,
          description: quickResponseForm.description,
          price: parseFloat(quickResponseForm.price),
          condition: quickResponseForm.condition,
          user_id: user.id,
          item_type: 'sell',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Then create the match record
      const { error: matchError } = await supabase
        .from('request_matches')
        .insert({
          request_id: request.id,
          item_id: newItem.id,
          user_id: user.id,
          message: message || null,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (matchError) throw matchError;

      // Update the matches count
      await supabase
        .from('requested_items')
        .update({ 
          matches_count: supabase.rpc('increment', { x: 1 }),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      toast.success('Quick response sent successfully!');
      onClose();
    } catch (err) {
      console.error('Error sending quick response:', err);
      toast.error('Failed to send response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Respond to Request
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {!isQuickResponse ? (
            <>
              <div className="mb-8">
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setIsQuickResponse(false)}
                    className="flex-1 py-3 px-4 rounded-lg bg-emerald-600 text-white font-medium"
                  >
                    Select Existing Item
                  </button>
                  <button
                    onClick={() => setIsQuickResponse(true)}
                    className="flex-1 py-3 px-4 rounded-lg border-2 border-emerald-600 text-emerald-600 font-medium hover:bg-emerald-50"
                  >
                    Quick Response
                  </button>
                </div>

                {userItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {userItems.map((item) => (
                      <label
                        key={item.id}
                        className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer
                          ${selectedItemId === item.id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-emerald-200'}`}
                      >
                        <input
                          type="radio"
                          name="item"
                          value={item.id}
                          checked={selectedItemId === item.id}
                          onChange={(e) => setSelectedItemId(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex gap-4">
                          {item.images?.[0] && (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            <p className="text-sm font-medium text-emerald-600 mt-1">₹{item.price}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">You haven't listed any items yet.</p>
                    <button
                      onClick={() => setIsQuickResponse(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Quick Response
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell them about your item and why it's a good match..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSubmit(request.id, selectedItemId!, message)}
                  disabled={!selectedItemId || isLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? 'Sending...' : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Send Response
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleQuickResponse} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={quickResponseForm.title}
                  onChange={(e) => setQuickResponseForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter item title"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={quickResponseForm.description}
                  onChange={(e) => setQuickResponseForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your item..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  required
                  value={quickResponseForm.price}
                  onChange={(e) => setQuickResponseForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter price"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={quickResponseForm.condition}
                  onChange={(e) => setQuickResponseForm(prev => ({ ...prev, condition: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell them about your item and why it's a good match..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuickResponse(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? 'Sending...' : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Send Response
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Requests() {
  // URL params and routing
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [watchedRequests, setWatchedRequests] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    matched: 0,
    fulfilled: 0
  });
  const [quickResponseRequest, setQuickResponseRequest] = useState<RequestItem | null>(null);

  // Filters state
  const [filters, setFilters] = useState<RequestFilters>({
    categories: searchParams.getAll('category'),
    urgency: (searchParams.getAll('urgency') as UrgencyLevel[]) || [],
    status: (searchParams.getAll('status') as RequestStatus[]) || ['open'],
    budget_min: searchParams.get('budget_min') ? Number(searchParams.get('budget_min')) : undefined,
    budget_max: searchParams.get('budget_max') ? Number(searchParams.get('budget_max')) : undefined,
    search: searchParams.get('search') || '',
    sortBy: (searchParams.get('sortBy') as RequestFilters['sortBy']) || 'urgency',
    timeframe: (searchParams.get('timeframe') as RequestFilters['timeframe']) || 'all'
  });

  // Load requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('request_details')
          .select('*');

        // Apply filters
        if (filters.categories?.length) {
          query = query.in('category_id', filters.categories);
        }

        if (filters.urgency?.length) {
          query = query.in('urgency', filters.urgency);
        }

        if (filters.status?.length) {
          query = query.in('status', filters.status);
        }

        if (filters.budget_min !== undefined) {
          query = query.gte('min_budget', filters.budget_min);
        }

        if (filters.budget_max !== undefined) {
          query = query.lte('max_budget', filters.budget_max);
        }

        if (filters.search) {
          query = query.textSearch('title', filters.search);
        }

        // Apply sorting
        switch (filters.sortBy) {
          case 'urgency':
            query = query.order('urgency', { ascending: false });
            break;
          case 'created_at':
            query = query.order('created_at', { ascending: false });
            break;
          case 'budget':
            query = query.order('max_budget', { ascending: false });
            break;
          case 'matches':
            query = query.order('matches_count', { ascending: false });
            break;
        }

        // Apply time frame filter
        if (filters.timeframe && filters.timeframe !== 'all') {
          const now = new Date();
          let startDate;

          switch (filters.timeframe) {
            case 'today':
              startDate = new Date(now.setHours(0, 0, 0, 0));
              break;
            case 'week':
              startDate = new Date(now.setDate(now.getDate() - 7));
              break;
            case 'month':
              startDate = new Date(now.setMonth(now.getMonth() - 1));
              break;
          }

          if (startDate) {
            query = query.gte('created_at', startDate.toISOString());
          }
        }

        // Fetch data
        const { data, error: fetchError } = await query.limit(ITEMS_PER_PAGE);

        if (fetchError) throw fetchError;

        setRequests(data || []);

        // Fetch stats
        const { data: statsData } = await supabase
          .from('requested_items')
          .select('status, urgency', { count: 'exact' });

        if (statsData) {
          setStats({
            total: statsData.length,
            urgent: statsData.filter(r => r.urgency === 'urgent').length,
            matched: statsData.filter(r => r.status === 'matched').length,
            fulfilled: statsData.filter(r => r.status === 'fulfilled').length
          });
        }

      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load requests. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [filters]);

  // Load watched requests
  useEffect(() => {
    if (!user) return;

    const fetchWatchedRequests = async () => {
      const { data } = await supabase
        .from('request_watchers')
        .select('request_id')
        .eq('user_id', user.id);

      if (data) {
        setWatchedRequests(data.map(w => w.request_id));
      }
    };

    fetchWatchedRequests();
  }, [user]);

  // Handlers
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setSearchParams(prev => {
      prev.set('search', query);
      return prev;
    });
  };

  const handleFilterChange = (key: keyof RequestFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSearchParams(prev => {
      if (Array.isArray(value)) {
        prev.delete(key);
        value.forEach(v => prev.append(key, v));
      } else if (value === undefined || value === '') {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      return prev;
    });
  };

  const handleQuickView = (request: RequestItem) => {
    setSelectedRequest(request);
  };

  const handleSelectSimilarItem = (item: TradingItem, request: RequestItem) => {
    // Close the detail view
    setSelectedRequest(null);
    
    // Open the quick response modal with the selected item
    setQuickResponseRequest(request);
    
    // We could pre-select the item in the modal here if we had a way to pass it
    toast.success(`Selected "${item.title}" as a match for this request`);
  };

  const handleMatch = async (request: RequestItem) => {
    if (!user) {
      // Instead of error, redirect to login with return URL
      const returnUrl = `/requests?highlight=${request.id}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      toast.error('Please sign in to respond to requests');
      return;
    }

    // Navigate to chat/match page
    // TODO: Implement matching logic
    toast.success('Match feature coming soon!');
  };

  const handleWatch = async (request: RequestItem) => {
    if (!user) {
      // Instead of error, redirect to login with return URL
      const returnUrl = `/requests?highlight=${request.id}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      toast.error('Please sign in to watch requests');
      return;
    }

    try {
      const isWatching = watchedRequests.includes(request.id);

      if (isWatching) {
        await supabase
          .from('request_watchers')
          .delete()
          .eq('user_id', user.id)
          .eq('request_id', request.id);

        setWatchedRequests(prev => prev.filter(id => id !== request.id));
        toast.success('Request removed from watchlist');
      } else {
        await supabase
          .from('request_watchers')
          .insert({
            user_id: user.id,
            request_id: request.id
          });

        setWatchedRequests(prev => [...prev, request.id]);
        toast.success('Request added to watchlist');
      }
    } catch (err) {
      console.error('Error updating watch status:', err);
      toast.error('Failed to update watch status');
    }
  };

  const handleQuickResponse = (request: RequestItem) => {
    if (!user) {
      // Instead of error, redirect to login with return URL
      const returnUrl = `/requests?highlight=${request.id}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      toast.error('Please sign in to respond to requests');
      return;
    }

    setQuickResponseRequest(request);
  };

  const handleSubmitQuickResponse = async (requestId: string, itemId: string, message: string) => {
    try {
      // Create a match record
      const { error } = await supabase
        .from('request_matches')
        .insert({
          request_id: requestId,
          item_id: itemId,
          user_id: user!.id,
          message: message || null,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update the matches count
      await supabase
        .from('requested_items')
        .update({ 
          matches_count: supabase.rpc('increment', { x: 1 }),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      toast.success('Your response has been sent!');
      setQuickResponseRequest(null); // Close the modal after successful submission
    } catch (err) {
      console.error('Error creating match:', err);
      toast.error('Failed to send response. Please try again.');
      throw err;
    }
  };

  return (
    <>
      <Helmet>
        <title>Campus Requests | HostelBazaar</title>
        <meta 
          name="description" 
          content="Browse and respond to student requests for items, books, and services on campus." 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Campus Requests
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Browse student requests and help fulfill their needs. Find opportunities to sell, rent, or share your items.
              </p>

              {/* Search Bar and Create Request Button */}
              <div className="flex items-center gap-4 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {user ? (
                  <Link
                    to="/items/new?type=request"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Create Request
                  </Link>
                ) : (
                  <Link
                    to="/login?redirect=/items/new?type=request"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Sign in to Request
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Requests', value: stats.total, icon: BarChart3, color: 'text-indigo-600' },
              { label: 'Urgent Needs', value: stats.urgent, icon: AlertTriangle, color: 'text-rose-600' },
              { label: 'Matched', value: stats.matched, icon: ThumbsUp, color: 'text-emerald-600' },
              { label: 'Fulfilled', value: stats.fulfilled, icon: Clock, color: 'text-amber-600' }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filters.categories?.[0] || ''}
                  onChange={(e) => handleFilterChange('categories', e.target.value ? [e.target.value] : [])}
                  className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Urgency Filter */}
              <div className="relative">
                <select
                  value={filters.urgency?.[0] || ''}
                  onChange={(e) => handleFilterChange('urgency', e.target.value ? [e.target.value] : [])}
                  className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  {urgencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filters.status?.[0] || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : [])}
                  className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Time Frame Filter */}
              <div className="relative">
                <select
                  value={filters.timeframe || 'all'}
                  onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {timeFrameOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort By */}
              <div className="relative ml-auto">
                <select
                  value={filters.sortBy || 'urgency'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Requests Grid */}
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : requests.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 mb-4">No requests found matching your criteria.</p>
                  <button
                    onClick={() => setFilters({})}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onQuickView={handleQuickView}
                    onMatch={handleMatch}
                    onWatch={handleWatch}
                    onQuickResponse={handleQuickResponse}
                    isWatching={watchedRequests.includes(request.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetail
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onMatch={handleMatch}
          onQuickResponse={handleQuickResponse}
          onSelectSimilarItem={handleSelectSimilarItem}
        />
      )}
      
      {/* Quick Response Modal */}
      {quickResponseRequest && (
        <QuickResponseModal
          request={quickResponseRequest}
          onClose={() => setQuickResponseRequest(null)}
          onSubmit={handleSubmitQuickResponse}
        />
      )}
    </>
  );
} 