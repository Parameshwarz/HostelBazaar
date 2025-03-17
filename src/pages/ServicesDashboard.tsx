import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';
import {
  Briefcase,
  Users,
  Clock,
  DollarSign,
  Star,
  ChevronRight,
  MessageSquare,
  Bell,
  BarChart,
  Settings,
  Plus,
  Filter,
  Search,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  LineChart,
  Target,
  Lightbulb,
  Bot,
  Package,
  Smartphone,
  Brain,
  Zap,
  PieChart,
  Heart,
  Coins,
  TrendingDown,
  Award,
  GraduationCap,
  Circle,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Service {
  id: string;
  title: string;
  short_description: string;
  starting_price: number;
  rating: number;
  total_orders: number;
  is_active: boolean;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  status: string;
  created_at: string;
  total_proposals: number;
}

interface Stats {
  total_earnings: number;
  active_orders: number;
  completed_orders: number;
  avg_rating: number;
}

interface Notification {
  id: string;
  type: 'proposal' | 'message' | 'review' | 'order';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface EarningsData {
  labels: string[];
  earnings: number[];
}

interface SkillProgress {
  skill: string;
  progress: number;
  level: string;
}

interface ClientMetric {
  metric: string;
  value: string;
  trend: number;
}

interface ProjectSuccess {
  factor: string;
  score: number;
}

interface MarketTrend {
  category: string;
  growth: number;
  avgPrice: number;
  demand: 'High' | 'Medium' | 'Low';
}

interface CompetitionInsight {
  metric: string;
  value: string;
  change: number;
}

export default function ServicesDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'projects'>('overview');
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_earnings: 0,
    active_orders: 0,
    completed_orders: 0,
    avg_rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [earningsData, setEarningsData] = useState<EarningsData>({
    labels: [],
    earnings: [],
  });
  const [skills, setSkills] = useState<SkillProgress[]>([
    { skill: 'Web Development', progress: 85, level: 'Expert' },
    { skill: 'UI/UX Design', progress: 75, level: 'Advanced' },
    { skill: 'Mobile Development', progress: 60, level: 'Intermediate' },
  ]);
  const [clientMetrics, setClientMetrics] = useState<ClientMetric[]>([
    { metric: 'Response Rate', value: '98%', trend: 5 },
    { metric: 'Client Satisfaction', value: '4.9/5', trend: 3 },
    { metric: 'Repeat Clients', value: '85%', trend: 8 },
  ]);
  const [projectSuccessFactors] = useState<ProjectSuccess[]>([
    { factor: 'Clear Requirements', score: 95 },
    { factor: 'Budget Alignment', score: 88 },
    { factor: 'Timeline Feasibility', score: 90 }
  ]);
  const [marketTrends] = useState<MarketTrend[]>([
    { category: 'Web Development', growth: 45, avgPrice: 2500, demand: 'High' },
    { category: 'Mobile Apps', growth: 38, avgPrice: 3500, demand: 'High' },
    { category: 'UI/UX Design', growth: 32, avgPrice: 1800, demand: 'Medium' }
  ]);
  const [competitionInsights] = useState<CompetitionInsight[]>([
    { metric: 'Market Position', value: 'Top 10%', change: 5 },
    { metric: 'Service Coverage', value: '85%', change: 3 },
    { metric: 'Price Competitiveness', value: 'Optimal', change: 2 }
  ]);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user?.id)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('project_requests')
        .select('*, project_proposals(count)')
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // TODO: Fetch actual stats from the backend
      setStats({
        total_earnings: 1250,
        active_orders: 3,
        completed_orders: 12,
        avg_rating: 4.8,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // TODO: Replace with actual notifications fetch
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'proposal',
          title: 'New Proposal',
          message: 'You received a new proposal for "Web Development Project"',
          created_at: new Date().toISOString(),
          read: false,
        },
        {
          id: '2',
          type: 'message',
          title: 'New Message',
          message: 'Client sent you a message about your service',
          created_at: new Date().toISOString(),
          read: false,
        },
        {
          id: '3',
          type: 'review',
          title: 'New Review',
          message: 'You received a 5-star review!',
          created_at: new Date().toISOString(),
          read: true,
        },
      ];
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchEarningsData = async () => {
    try {
      // TODO: Replace with actual earnings data fetch
      const mockEarnings: EarningsData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        earnings: [150, 300, 200, 400, 300, 500],
      };
      setEarningsData(mockEarnings);
    } catch (err) {
      console.error('Error fetching earnings data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchEarningsData();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'open':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'proposal':
        return <Briefcase className="h-5 w-5 text-indigo-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'order':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services Dashboard</h1>
            <p className="text-gray-600">Manage your services and projects</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 relative"
              >
                <Bell className="h-6 w-6" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}
                      >
                        <div className="flex gap-3">
                          {getNotificationIcon(notification.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/services/post-project')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post a Project
              </button>
              <button
                onClick={() => navigate('/services/offer')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Offer Service
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <h3 className="text-xl font-bold text-gray-900">${stats.total_earnings}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <h3 className="text-xl font-bold text-gray-900">{stats.active_orders}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <h3 className="text-xl font-bold text-gray-900">{stats.completed_orders}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <h3 className="text-xl font-bold text-gray-900">{stats.avg_rating}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Earnings Overview</h2>
            <select className="border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: earningsData.labels,
                datasets: [
                  {
                    label: 'Earnings',
                    data: earningsData.earnings,
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: 'rgb(99, 102, 241)',
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
                      callback: function(tickValue: number | string) {
                        return `$${tickValue}`;
                      },
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* AI Insights & Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h2>
              </div>
              <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                Updated just now
              </span>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: TrendingUp,
                  color: 'text-green-600',
                  bg: 'bg-green-100',
                  title: 'Growth Opportunity',
                  message: 'Your "Web Development" service is trending. Consider creating more packages in this category.',
                  action: 'View Analytics'
                },
                {
                  icon: Clock,
                  color: 'text-blue-600',
                  bg: 'bg-blue-100',
                  title: 'Delivery Optimization',
                  message: 'Reducing delivery time by 2 days could increase your orders by 30% based on market data.',
                  action: 'Adjust Delivery'
                },
                {
                  icon: DollarSign,
                  color: 'text-yellow-600',
                  bg: 'bg-yellow-100',
                  title: 'Pricing Strategy',
                  message: 'Your prices are 15% below market average. Consider optimizing for better earnings.',
                  action: 'View Pricing'
                }
              ].map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-white rounded-lg shadow-sm"
                >
                  <div className={`p-2 rounded-lg ${insight.bg} self-start`}>
                    <insight.icon className={`h-5 w-5 ${insight.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                      {insight.action} →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
              <select className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
              </select>
            </div>
            <div className="space-y-6">
              {[
                {
                  label: 'Response Rate',
                  value: 92,
                  change: 5,
                  color: 'text-green-600',
                  bg: 'bg-green-100'
                },
                {
                  label: 'Order Completion',
                  value: 98,
                  change: 2,
                  color: 'text-blue-600',
                  bg: 'bg-blue-100'
                },
                {
                  label: 'Client Satisfaction',
                  value: 4.8,
                  change: 0.3,
                  color: 'text-yellow-600',
                  bg: 'bg-yellow-100',
                  suffix: '/5'
                }
              ].map((metric, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {metric.value}{metric.suffix || '%'}
                      </span>
                      <span className={`flex items-center text-sm ${metric.color}`}>
                        <ArrowUpRight className="h-4 w-4" />
                        +{metric.change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className={`h-full rounded-full ${metric.bg}`}
                    />
                  </div>
                </div>
              ))}

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  {
                    label: 'Avg. Response Time',
                    value: '2.5 hrs',
                    icon: Clock,
                    color: 'text-purple-600',
                    bg: 'bg-purple-100'
                  },
                  {
                    label: 'Repeat Clients',
                    value: '45%',
                    icon: Users,
                    color: 'text-pink-600',
                    bg: 'bg-pink-100'
                  },
                  {
                    label: 'On-time Delivery',
                    value: '96%',
                    icon: CheckCircle,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-100'
                  },
                  {
                    label: 'Profile Views',
                    value: '1.2K',
                    icon: Search,
                    color: 'text-cyan-600',
                    bg: 'bg-cyan-100'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar and Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Calendar View */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                View Calendar
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  title: 'Mobile App Development',
                  deadline: '2024-01-15',
                  type: 'project',
                  status: 'in_progress'
                },
                {
                  id: 2,
                  title: 'Logo Design Service',
                  deadline: '2024-01-18',
                  type: 'service',
                  status: 'pending'
                },
                {
                  id: 3,
                  title: 'Content Writing',
                  deadline: '2024-01-20',
                  type: 'service',
                  status: 'in_progress'
                }
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'project' ? 'bg-green-100' : 'bg-indigo-100'
                    }`}>
                      {item.type === 'project' ? (
                        <Briefcase className={`h-5 w-5 ${
                          item.type === 'project' ? 'text-green-600' : 'text-indigo-600'
                        }`} />
                      ) : (
                        <Star className="h-5 w-5 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Due {new Date(item.deadline).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'in_progress' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/services/offer')}
                className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="h-6 w-6 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-indigo-900">New Service</span>
              </button>
              <button
                onClick={() => navigate('/services/post-project')}
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Briefcase className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-900">New Project</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <MessageSquare className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-900">Messages</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Settings className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-900">Settings</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors col-span-2">
                <BarChart className="h-6 w-6 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-yellow-900">View Analytics</span>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    icon: MessageSquare,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100',
                    text: 'New message from John about your service',
                    time: '5 minutes ago'
                  },
                  {
                    id: 2,
                    icon: Star,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-100',
                    text: 'Received a 5-star review',
                    time: '2 hours ago'
                  },
                  {
                    id: 3,
                    icon: DollarSign,
                    color: 'text-green-600',
                    bg: 'bg-green-100',
                    text: 'New order completed',
                    time: '1 day ago'
                  }
                ].map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activity.bg}`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Task Automation Hub */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Smart Task Automation Hub</h2>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Configure Automations →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Auto-Response',
                description: 'Automatically respond to inquiries based on your availability',
                status: 'Active',
                icon: MessageSquare,
                color: 'text-emerald-600',
                bg: 'bg-emerald-100'
              },
              {
                title: 'Smart Scheduling',
                description: 'AI-powered scheduling based on your work patterns',
                status: 'Active',
                icon: Calendar,
                color: 'text-purple-600',
                bg: 'bg-purple-100'
              },
              {
                title: 'Review Management',
                description: 'Automated review collection and response system',
                status: 'Configure',
                icon: Star,
                color: 'text-yellow-600',
                bg: 'bg-yellow-100'
              }
            ].map((automation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${automation.bg}`}>
                    <automation.icon className={`h-5 w-5 ${automation.color}`} />
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    automation.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {automation.status}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{automation.title}</h3>
                <p className="text-sm text-gray-600">{automation.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Advanced Analytics & Predictions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Advanced Analytics & Predictions</h2>
            </div>
            <select className="text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500">
              <option>Next 30 Days</option>
              <option>Next Quarter</option>
              <option>Next Year</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Revenue Forecast</h3>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">$8,540</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <ArrowUpRight className="h-4 w-4" />
                    +12.3% vs last month
                  </p>
                </div>
                <div className="flex-1 h-16">
                  {/* Mini chart placeholder */}
                  <div className="h-full bg-gradient-to-t from-purple-200 to-pink-200 rounded" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Growth Opportunities</h3>
              <div className="space-y-2">
                {[
                  { skill: 'React Development', demand: 85 },
                  { skill: 'UI/UX Design', demand: 72 },
                  { skill: 'Mobile Apps', demand: 68 }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.skill}</span>
                      <span className="font-medium">{item.demand}% demand</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.demand}%` }}
                        className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Service Portfolio */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Interactive Service Portfolio</h2>
            </div>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              Customize Display →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {/* Service thumbnail placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{service.short_description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-900 ml-1">{service.rating}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      From ${service.starting_price}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI-powered Client Success Hub */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Client Success Hub</h2>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
              AI-Powered
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Relationship Score */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-900">Client Relationship Score</h3>
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-emerald-600">94</span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3"
                      strokeDasharray="94, 100"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Communication', score: 98 },
                  { label: 'Satisfaction', score: 95 },
                  { label: 'Retention', score: 89 }
                ].map((metric, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{metric.label}</span>
                      <span className="font-medium text-gray-900">{metric.score}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.score}%` }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="space-y-4">
              {[
                {
                  title: 'Personalized Follow-up',
                  message: 'Send a personalized thank you message to Sarah for her recent 5-star review',
                  priority: 'High',
                  icon: MessageSquare,
                  color: 'text-blue-600',
                  bg: 'bg-blue-100'
                },
                {
                  title: 'Upsell Opportunity',
                  message: 'Client "TechCorp" shows interest in additional services based on their usage patterns',
                  priority: 'Medium',
                  icon: TrendingUp,
                  color: 'text-purple-600',
                  bg: 'bg-purple-100'
                },
                {
                  title: 'Client Milestone',
                  message: '1-year partnership anniversary with "DesignPro" coming up next week',
                  priority: 'Medium',
                  icon: Star,
                  color: 'text-yellow-600',
                  bg: 'bg-yellow-100'
                }
              ].map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-lg ${recommendation.bg} self-start`}>
                      <recommendation.icon className={`h-5 w-5 ${recommendation.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{recommendation.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          recommendation.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {recommendation.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{recommendation.message}</p>
                      <button className="mt-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                        Take Action →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Business Growth Hub */}
        <div className="bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-rose-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Smart Business Growth Hub</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 bg-rose-100 px-2 py-1 rounded-full">
                Live Market Data
              </span>
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                AI Predictions
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Market Position Analysis */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center justify-between">
                Market Position
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Top 10%
                </span>
              </h3>
              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">Market Share</span>
                    <span className="text-xs font-semibold text-gray-700">8.5%</span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-rose-400 to-amber-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Competitive Index</p>
                    <p className="text-lg font-bold text-gray-900">92/100</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Growth Rate</p>
                    <p className="text-lg font-bold text-green-600">+28%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Opportunities */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Growth Opportunities</h3>
              <div className="space-y-3">
                {[
                  {
                    category: 'Mobile Development',
                    potential: 95,
                    trend: 'Rapidly Growing',
                    color: 'from-blue-400 to-indigo-400'
                  },
                  {
                    category: 'AI Integration',
                    potential: 88,
                    trend: 'Emerging',
                    color: 'from-purple-400 to-pink-400'
                  },
                  {
                    category: 'Cloud Solutions',
                    potential: 82,
                    trend: 'Steady Growth',
                    color: 'from-cyan-400 to-blue-400'
                  }
                ].map((opportunity, index) => (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-900">{opportunity.category}</span>
                      <span className="text-xs text-gray-500">{opportunity.trend}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${opportunity.potential}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${opportunity.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Strategic Actions</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Service Expansion',
                    description: 'Add mobile app development services to capture growing market demand',
                    impact: 'High Impact',
                    icon: Plus,
                    color: 'text-green-600',
                    bg: 'bg-green-100'
                  },
                  {
                    title: 'Price Optimization',
                    description: 'Increase premium tier pricing by 15% to match market value',
                    impact: 'Medium Impact',
                    icon: DollarSign,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100'
                  },
                  {
                    title: 'Skill Enhancement',
                    description: 'Focus on AI/ML certifications to stay competitive',
                    impact: 'Long-term Impact',
                    icon: TrendingUp,
                    color: 'text-purple-600',
                    bg: 'bg-purple-100'
                  }
                ].map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${action.bg}`}>
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                          {action.impact}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Intelligence Dashboard */}
        <div className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-100 rounded-lg">
                <LineChart className="h-5 w-5 text-violet-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Competitor Intelligence</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
                Real-time Analysis
              </span>
              <button className="text-sm text-violet-600 hover:text-violet-800 font-medium">
                View Details →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Market Position */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Competitive Position</h3>
              <div className="relative">
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-violet-600">87</span>
                        <p className="text-xs text-gray-500">Competitive Score</p>
                      </div>
                    </div>
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        fill="none"
                        stroke="#F3E8FF"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="8"
                        strokeDasharray={`${87 * 3.78} 378`}
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Price Competitiveness', value: 92 },
                    { label: 'Service Quality', value: 88 },
                    { label: 'Market Share', value: 82 }
                  ].map((metric, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{metric.label}</span>
                        <span className="font-medium text-gray-900">{metric.value}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Competitor Analysis */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Top Competitors</h3>
              <div className="space-y-4">
                {[
                  { name: 'TechPro Services', strength: 'Technical Expertise', threat: 'High' },
                  { name: 'DesignMaster', strength: 'UI/UX Focus', threat: 'Medium' },
                  { name: 'CloudSolutions', strength: 'Enterprise Clients', threat: 'Medium' }
                ].map((competitor, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      competitor.threat === 'High' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      <Target className={`h-4 w-4 ${
                        competitor.threat === 'High' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">{competitor.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          competitor.threat === 'High'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {competitor.threat} Threat
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Key Strength: {competitor.strength}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Differentiation */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Your Unique Advantages</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Pricing Strategy',
                    description: '15% lower than market average with premium quality',
                    icon: DollarSign,
                    color: 'text-green-600',
                    bg: 'bg-green-100'
                  },
                  {
                    title: 'Service Quality',
                    description: 'Higher customer satisfaction rate (98% vs avg 85%)',
                    icon: Star,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-100'
                  },
                  {
                    title: 'Innovation',
                    description: 'Early adoption of AI technologies in service delivery',
                    icon: Lightbulb,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100'
                  }
                ].map((advantage, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${advantage.bg}`}>
                      <advantage.icon className={`h-4 w-4 ${advantage.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{advantage.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{advantage.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Service Innovation Lab */}
        <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-cyan-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Service Innovation Lab</h2>
            </div>
            <span className="text-xs text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">
              AI-Powered Insights
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Innovation Opportunities */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Innovation Opportunities</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'AI Integration',
                    description: 'Implement AI-powered customer support automation',
                    impact: 'High ROI',
                    timeline: '3 months',
                    icon: Bot,
                    color: 'text-purple-600',
                    bg: 'bg-purple-100'
                  },
                  {
                    title: 'Service Bundling',
                    description: 'Create premium packages combining top services',
                    impact: 'Medium ROI',
                    timeline: '1 month',
                    icon: Package,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100'
                  },
                  {
                    title: 'Mobile Experience',
                    description: 'Develop a mobile app for service tracking',
                    impact: 'Long-term Growth',
                    timeline: '6 months',
                    icon: Smartphone,
                    color: 'text-green-600',
                    bg: 'bg-green-100'
                  }
                ].map((innovation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${innovation.bg}`}>
                        <innovation.icon className={`h-5 w-5 ${innovation.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{innovation.title}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                            {innovation.timeline}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{innovation.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium text-cyan-600">{innovation.impact}</span>
                          <button className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">
                            Explore →
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Service Enhancement */}
            <div className="space-y-6">
              {/* Quality Metrics */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Service Quality Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'User Satisfaction', value: '96%', trend: '+2.3%' },
                    { label: 'Delivery Speed', value: '99%', trend: '+1.5%' },
                    { label: 'Support Quality', value: '94%', trend: '+3.7%' }
                  ].map((metric, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-xs text-gray-600">{metric.label}</p>
                      <p className="text-xs text-green-600 flex items-center justify-center mt-1">
                        <ArrowUpRight className="h-3 w-3" />
                        {metric.trend}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Innovation Insights */}
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">AI-Generated Insights</h3>
                <div className="space-y-3">
                  {[
                    'Client feedback suggests demand for weekend support hours',
                    'Adding video consultations could increase engagement by 40%',
                    'Implementing automated progress tracking highly requested'
                  ].map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">{insight}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 px-4 bg-white rounded-lg text-sm font-medium text-blue-600 hover:text-blue-800">
                  Generate More Insights
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Market Trend Predictor */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Market Trend Predictor</h2>
            </div>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              AI-Powered Forecasting
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trend Analysis */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Emerging Market Trends</h3>
              <div className="space-y-4">
                {[
                  {
                    trend: 'AI Development Services',
                    growth: 156,
                    confidence: 'Very High',
                    icon: Zap,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-100'
                  },
                  {
                    trend: 'Blockchain Integration',
                    growth: 98,
                    confidence: 'High',
                    icon: PieChart,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100'
                  },
                  {
                    trend: 'Sustainable Tech Solutions',
                    growth: 78,
                    confidence: 'Medium',
                    icon: TrendingUp,
                    color: 'text-green-600',
                    bg: 'bg-green-100'
                  }
                ].map((trend, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${trend.bg}`}>
                      <trend.icon className={`h-5 w-5 ${trend.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{trend.trend}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          trend.confidence === 'Very High' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : trend.confidence === 'High'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {trend.confidence}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">Growth Potential</span>
                        <span className="text-sm font-medium text-green-600">+{trend.growth}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Market Predictions */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Market Size Predictions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Market Size</span>
                    <span className="text-lg font-bold text-gray-900">$4.2B</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Projected Growth (2024)</span>
                    <span className="text-lg font-bold text-green-600">$6.8B</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "62%" }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Strategic Recommendations</h3>
                <div className="space-y-3">
                  {[
                    'Focus on AI and ML service offerings for maximum growth',
                    'Develop blockchain expertise to capture emerging market',
                    'Invest in sustainable tech solutions training'
                  ].map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-1 bg-indigo-100 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      </div>
                      <p className="text-sm text-gray-600">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Success Patterns */}
        <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Client Success Patterns</h2>
            </div>
            <span className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
              Deep Learning Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Success Metrics */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Success Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: 'Client Retention', value: 94, target: 90 },
                  { label: 'Satisfaction Score', value: 98, target: 95 },
                  { label: 'Repeat Business', value: 82, target: 75 }
                ].map((metric, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{metric.value}%</span>
                        <span className="text-xs text-green-600">
                          +{(metric.value - metric.target).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern Analysis */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Success Patterns</h3>
              <div className="space-y-4">
                {[
                  {
                    pattern: 'Quick Response Time',
                    impact: 'High Impact',
                    description: 'Clients value response within 2 hours',
                    icon: Clock,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100'
                  },
                  {
                    pattern: 'Proactive Updates',
                    impact: 'Medium Impact',
                    description: 'Regular progress updates increase satisfaction',
                    icon: Bell,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-100'
                  },
                  {
                    pattern: 'Quality Delivery',
                    impact: 'Critical',
                    description: 'Consistent quality leads to referrals',
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bg: 'bg-green-100'
                  }
                ].map((pattern, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${pattern.bg}`}>
                        <pattern.icon className={`h-4 w-4 ${pattern.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-900">{pattern.pattern}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            pattern.impact === 'Critical'
                              ? 'bg-red-100 text-red-800'
                              : pattern.impact === 'High Impact'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pattern.impact}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{pattern.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Client Insights */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Client Insights</h3>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Findings</h4>
                  <div className="space-y-2">
                    {[
                      'Most successful projects start with clear requirements',
                      'Regular video updates increase client satisfaction by 45%',
                      'Clients prefer structured milestone deliveries'
                    ].map((finding, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="p-1 bg-rose-100 rounded-full mt-1">
                          <div className="w-1 h-1 rounded-full bg-rose-500" />
                        </div>
                        <p className="text-sm text-gray-600">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Success Rate by Service</h4>
                  <div className="space-y-2">
                    {[
                      { service: 'Web Development', rate: 96 },
                      { service: 'Mobile Apps', rate: 92 },
                      { service: 'UI/UX Design', rate: 94 }
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{item.service}</span>
                          <span className="font-medium text-gray-900">{item.rate}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.rate}%` }}
                            className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Optimization Engine */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Coins className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Optimization Engine</h2>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
              Smart Pricing Analytics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Analysis */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Price Optimization</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Current Average Price</span>
                    <span className="text-lg font-bold text-gray-900">$85/hr</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Recommended Price</span>
                    <span className="text-lg font-bold text-emerald-600">$95/hr</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "89%" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Market Average</span>
                    <span className="text-sm font-medium text-gray-900">$92/hr</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Top Competitor</span>
                    <span className="text-sm font-medium text-gray-900">$98/hr</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Market Range</span>
                    <span className="text-sm font-medium text-gray-900">$75-110/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Insights */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Revenue Insights</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Premium Package Potential',
                    message: 'Introducing premium packages could increase revenue by 35%',
                    action: 'Create Package',
                    icon: TrendingUp,
                    color: 'text-green-600',
                    bg: 'bg-green-100'
                  },
                  {
                    title: 'Seasonal Pricing',
                    message: 'Adjust prices during peak seasons (Nov-Jan) for 20% higher earnings',
                    action: 'View Calendar',
                    icon: Calendar,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100'
                  },
                  {
                    title: 'Service Bundle',
                    message: 'Bundle related services to increase average order value',
                    action: 'Create Bundle',
                    icon: Package,
                    color: 'text-purple-600',
                    bg: 'bg-purple-100'
                  }
                ].map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${insight.bg}`}>
                        <insight.icon className={`h-4 w-4 ${insight.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
                        <button className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 font-medium">
                          {insight.action} →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Optimization Suggestions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Optimization Suggestions</h3>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Wins</h4>
                  <div className="space-y-2">
                    {[
                      'Increase base rate for new clients by 12%',
                      'Add rush delivery option with 25% premium',
                      'Introduce loyalty discounts for repeat clients'
                    ].map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="p-1 bg-teal-100 rounded-full mt-1">
                          <div className="w-1 h-1 rounded-full bg-teal-500" />
                        </div>
                        <p className="text-sm text-gray-600">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Revenue Impact</h4>
                  <div className="space-y-3">
                    {[
                      { action: 'Premium Packages', impact: '+35%' },
                      { action: 'Rush Delivery', impact: '+25%' },
                      { action: 'Service Bundles', impact: '+20%' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{item.action}</span>
                        <span className="text-sm font-medium text-green-600">{item.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'services', 'projects'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Recent Services */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Services</h2>
                  <button
                    onClick={() => setActiveTab('services')}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {services.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/services/${service.id}`)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{service.title}</h3>
                        <p className="text-sm text-gray-600">{service.short_description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {project.total_proposals} proposals
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Your Services</h2>
                  <div className="flex gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search services..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Filter className="h-5 w-5 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{service.short_description}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Starting at ${service.starting_price}
                          </span>
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400" />
                            {service.rating.toFixed(1)}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {service.total_orders} orders
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-sm text-gray-500 mt-1">
                            Created {new Date(service.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/services/${service.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
                  <div className="flex gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search projects..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Filter className="h-5 w-5 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Budget: ${project.budget_min} - ${project.budget_max}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {project.total_proposals} proposals
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500 mt-1">
                            Posted {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Growth & Development Hub */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Growth & Development Hub</h2>
            </div>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View Detailed Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Portfolio Enhancement */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-medium text-gray-900">Portfolio Enhancer</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Profile Strength</span>
                  <span className="font-medium text-gray-900">85%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-full w-[85%] bg-emerald-500 rounded-full" />
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Portfolio examples added
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Skills verified
                  </li>
                  <li className="flex items-center gap-2 opacity-50">
                    <Circle className="h-4 w-4" />
                    Get client testimonials
                  </li>
                </ul>
              </div>
            </div>

            {/* Skill Development */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Skill Development</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Learning Path</h4>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Brain className="h-4 w-4" />
                    Full-Stack Development Mastery
                  </div>
                </div>
                <div className="space-y-3">
                  {skills.map((item) => (
                    <div key={item.skill}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.skill}</span>
                        <span className="text-gray-900 font-medium">{item.level}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Client Success Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900">Client Success</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">Communication Style</h4>
                  <p className="text-sm text-purple-700">Professional & Proactive</p>
                </div>
                <div className="space-y-3">
                  {clientMetrics.map((metric) => (
                    <div key={metric.metric} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{metric.value}</span>
                        <div className="flex items-center text-xs text-emerald-600">
                          <TrendingUp className="h-3 w-3" />
                          {metric.trend}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Experience Enhancement */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-gray-900">Client Experience</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Smart Requirements Builder */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-violet-100">
                  <Lightbulb className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="font-medium text-gray-900">Smart Requirements Builder</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                AI-powered tool to help create detailed project requirements
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1 rounded-full bg-violet-100">
                    <Check className="h-3 w-3 text-violet-600" />
                  </div>
                  <span className="text-gray-700">Project scope definition</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1 rounded-full bg-violet-100">
                    <Check className="h-3 w-3 text-violet-600" />
                  </div>
                  <span className="text-gray-700">Timeline estimation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1 rounded-full bg-violet-100">
                    <Check className="h-3 w-3 text-violet-600" />
                  </div>
                  <span className="text-gray-700">Budget recommendation</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 px-4 bg-violet-100 rounded-lg text-sm font-medium text-violet-600 hover:bg-violet-200 transition-colors flex items-center justify-center gap-2">
                Create New Project
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Project Success Estimator */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900">Project Success Estimator</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-900">Success Score</span>
                    <span className="text-sm font-medium text-purple-900">92%</span>
                  </div>
                  <div className="h-2 bg-purple-200 rounded-full">
                    <div className="h-full w-[92%] bg-purple-500 rounded-full" />
                  </div>
                </div>
                <div className="space-y-3">
                  {projectSuccessFactors.map((item) => (
                    <div key={item.factor}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.factor}</span>
                        <span className="text-gray-900 font-medium">{item.score}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Intelligence */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Market Intelligence</h2>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Full Analysis
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Market Trends */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Market Trends</h3>
              </div>
              <div className="space-y-4">
                {marketTrends.map((trend) => (
                  <div key={trend.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{trend.category}</span>
                      <div className="flex items-center gap-1 text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>{trend.growth}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Avg. Price: ${trend.avgPrice}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        trend.demand === 'High' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {trend.demand} Demand
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competition Analysis */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-medium text-gray-900">Competition Analysis</h3>
              </div>
              <div className="space-y-4">
                {competitionInsights.map((insight) => (
                  <div key={insight.metric} className="p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{insight.metric}</span>
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{insight.change}%</span>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{insight.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Optimization */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-medium text-gray-900">Price Optimization</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-900">Recommended Range</span>
                    <span className="text-sm font-medium text-emerald-900">$75-150/hr</span>
                  </div>
                  <div className="h-2 bg-emerald-200 rounded-full">
                    <div className="h-full w-[80%] bg-emerald-500 rounded-full" />
                  </div>
                  <p className="mt-2 text-xs text-emerald-700">
                    Based on market demand and your expertise level
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Market Average</span>
                    <span className="font-medium text-gray-900">$85/hr</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Top Earners</span>
                    <span className="font-medium text-gray-900">$150/hr</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Your Current Rate</span>
                    <span className="font-medium text-gray-900">$95/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 