import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  MessageSquare,
  Star,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';

interface Order {
  id: string;
  service: {
    id: string;
    title: string;
    provider: {
      username: string;
      avatar_url?: string;
    };
  };
  service_level: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  delivery_date: string;
  created_at: string;
  rating?: number;
  review_comment?: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [user, activeTab, filter]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          service:services (
            id,
            title,
            provider:profiles (
              username,
              avatar_url
            )
          )
        `)
        .eq(activeTab === 'buyer' ? 'client_id' : 'provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter orders based on status if filter is not 'all'
      const filteredOrders = filter === 'all' 
        ? data 
        : data.filter(order => order.status === filter);

      setOrders(filteredOrders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'pending':
        return AlertCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Manage your orders and transactions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('buyer')}
                className={`flex-1 px-6 py-3 text-sm font-medium text-center ${
                  activeTab === 'buyer'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders as Buyer
              </button>
              <button
                onClick={() => setActiveTab('seller')}
                className={`flex-1 px-6 py-3 text-sm font-medium text-center ${
                  activeTab === 'seller'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders as Seller
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 flex gap-2">
            {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                  filter === status
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                      {React.createElement(getStatusIcon(order.status), { className: 'h-5 w-5' })}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{order.service.title}</h3>
                      <p className="text-sm text-gray-500">
                        by {order.service.provider.username}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{order.price}</p>
                    <p className="text-sm text-gray-500 capitalize">{order.service_level} Package</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Ordered {new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  {order.delivery_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Due {new Date(order.delivery_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {order.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{order.rating}/5</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium
                      hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/messages?order=${order.id}`)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium
                      hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {activeTab === 'buyer' 
                ? "You haven't placed any orders yet"
                : "You haven't received any orders yet"}
            </p>
            {activeTab === 'buyer' && (
              <button
                onClick={() => navigate('/services')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent 
                  rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Services
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 