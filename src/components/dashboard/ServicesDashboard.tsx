import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  BarChart3, TrendingUp, Users, Star, Clock, DollarSign,
  Briefcase, Target, Award, ChevronRight, ArrowUpRight,
  Bell, Calendar, MessageSquare, Settings, PieChart,
  Activity, TrendingDown, Zap, Shield, Crown, CheckCircle,
  Timer, Package2, MessageCircle
} from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalEarnings: number;
  activeServices: number;
  completedOrders: number;
  avgRating: number;
  recentOrders: Order[];
  notifications: Notification[];
  earnings: EarningData[];
  categoryDistribution: CategoryData[];
}

interface Order {
  id: string;
  service: string;
  client: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

interface Notification {
  id: string;
  type: 'order' | 'review' | 'message';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface EarningData {
  date: string;
  amount: number;
}

interface CategoryData {
  name: string;
  orders: number;
  color: string;
}

export default function ServicesDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch dashboard data from Supabase
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user?.id);

      if (servicesError) throw servicesError;

      // Simulate data for demo (replace with actual data fetching)
      const mockStats: DashboardStats = {
        totalEarnings: 15750,
        activeServices: servicesData?.length || 0,
        completedOrders: 48,
        avgRating: 4.8,
        recentOrders: generateMockOrders(),
        notifications: generateMockNotifications(),
        earnings: generateMockEarnings(),
        categoryDistribution: generateMockCategoryData()
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const earningsChartData = {
    labels: stats?.earnings.map(e => e.date),
    datasets: [
      {
        label: 'Earnings',
        data: stats?.earnings.map(e => e.amount),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const categoryChartData = {
    labels: stats?.categoryDistribution.map(c => c.name),
    datasets: [
      {
        data: stats?.categoryDistribution.map(c => c.orders),
        backgroundColor: stats?.categoryDistribution.map(c => c.color),
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Dashboard</h1>
            <p className="text-gray-600">Monitor and manage your services</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Earnings',
              value: `$${stats?.totalEarnings.toLocaleString()}`,
              icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
              trend: '+12.5%',
              trendUp: true
            },
            {
              title: 'Active Services',
              value: stats?.activeServices,
              icon: <Briefcase className="h-5 w-5 text-blue-600" />,
              trend: '+3',
              trendUp: true
            },
            {
              title: 'Completed Orders',
              value: stats?.completedOrders,
              icon: <Target className="h-5 w-5 text-purple-600" />,
              trend: '+8',
              trendUp: true
            },
            {
              title: 'Average Rating',
              value: stats?.avgRating,
              icon: <Star className="h-5 w-5 text-amber-600" />,
              trend: '+0.2',
              trendUp: true
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trendUp ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.trend}
                  {stat.trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Earnings Overview</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            {stats && <Line data={earningsChartData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true }
              }
            }} />}
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Category Distribution</h2>
            {stats && <Pie data={categoryChartData} options={{
              responsive: true,
              plugins: {
                legend: { position: 'right' as const }
              }
            }} />}
          </motion.div>
        </div>

        {/* Recent Activity & Notifications */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Orders</h2>
            <div className="space-y-4">
              {stats?.recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      order.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {order.status === 'completed' ? <CheckCircle className="h-5 w-5" /> :
                       order.status === 'in_progress' ? <Clock className="h-5 w-5" /> :
                       <Timer className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{order.service}</div>
                      <div className="text-sm text-gray-500">by {order.client}</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">${order.amount}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>
            <div className="space-y-4">
              {stats?.notifications.map((notification, index) => (
                <div key={notification.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    notification.type === 'order' ? 'bg-blue-100 text-blue-600' :
                    notification.type === 'review' ? 'bg-amber-100 text-amber-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {notification.type === 'order' ? <Package2 className="h-5 w-5" /> :
                     notification.type === 'review' ? <Star className="h-5 w-5" /> :
                     <MessageCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{notification.title}</div>
                    <div className="text-sm text-gray-500">{notification.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Helper functions to generate mock data
function generateMockOrders(): Order[] {
  return [
    {
      id: '1',
      service: 'Web Development',
      client: 'John Doe',
      amount: 850,
      status: 'completed',
      created_at: new Date().toISOString()
    },
    // ... more mock orders
  ];
}

function generateMockNotifications(): Notification[] {
  return [
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'You have received a new order for Web Development',
      created_at: new Date().toISOString(),
      read: false
    },
    // ... more mock notifications
  ];
}

function generateMockEarnings(): EarningData[] {
  return Array.from({ length: 12 }, (_, i) => ({
    date: `2024-${(i + 1).toString().padStart(2, '0')}-01`,
    amount: Math.floor(Math.random() * 2000) + 1000
  }));
}

function generateMockCategoryData(): CategoryData[] {
  return [
    { name: 'Web Development', orders: 45, color: '#6366F1' },
    { name: 'Design', orders: 30, color: '#10B981' },
    { name: 'Writing', orders: 25, color: '#F59E0B' },
    { name: 'Marketing', orders: 20, color: '#8B5CF6' }
  ];
} 