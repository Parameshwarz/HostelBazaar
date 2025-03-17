import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { Service as BaseService } from '../types/services';
import { useServiceCategories } from '../hooks/useServiceCategories';
import {
  Briefcase, Search, Filter, Star, Clock, DollarSign, Users,
  Sparkles, Building, Laptop, Target, Heart, Zap, Rocket,
  TrendingUp, Award, Shield, Gem, Crown, Cpu, Code, Palette,
  Lightbulb, Wrench, GraduationCap, PenTool, BarChart, Box,
  Smartphone, Search as SearchIcon, Sliders, TrendingDown,
  BadgeCheck, Clock4, Flame, ThumbsUp, ArrowRight, Share2,
  Keyboard, Sparkle, Scale, Brain, Plus, Package, LineChart, Calendar,
  Folder, CheckCircle, Circle, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AIMatchmaker from '../components/services/AIMatchmaker';
import ViewToggle from '../components/services/ViewToggle';
import { formatDistanceToNow } from 'date-fns';
import ServiceHeader from '../components/services/ServiceHeader';
import ViewMetrics from '../components/services/ViewMetrics';
import MarketInsights from '../components/services/MarketInsights';
import TopProviders from '../components/services/TopProviders';
import MarketTrends from '../components/services/MarketTrends';
import TrendingTopics from '../components/services/TrendingTopics';
import CategorySection from '../components/services/CategoriesSection';

interface ServiceLevel {
  name: string;
  price: number;
  description: string;
  delivery_time: string;
  revisions: number;
  features: string[];
}

interface Service extends BaseService {
  images?: string[];
  is_featured: boolean;
  service_levels?: ServiceLevel[];
  provider?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Project {
  id: number;
  category_id: number;
  budget_min: number;
  budget_max: number;
  title: string;
  description: string;
  required_skills: string[];
  deadline: string;
  total_proposals: number;
  status: string;
  client: {
    id: number;
    username: string;
    avatar_url: string | null;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface FilterTag {
  id: string;
  label: string;
  type: 'category' | 'price' | 'level' | 'delivery' | 'rating' | 'sort';
  value: string | number | [number, number];
}

interface TrendingTopic {
  id: string;
  name: string;
  growth: number;
  icon: string;
}

interface SkillBadge {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  color: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ServiceCategoryStats {
  id: number;
  name: string;
  slug: string;
  count: number;
  label: string;
  type: 'service';
  avgRating: number;
}

interface ProjectCategoryStats {
  id: number;
  name: string;
  slug: string;
  count: number;
  label: string;
  type: 'project';
  avgBudget: number;
}

type CategoryStats = ServiceCategoryStats | ProjectCategoryStats;

interface ViewMetrics {
  id: string;
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

interface ServiceMetrics extends ViewMetrics {
  type: 'service';
  avgRating: number;
  completionRate: number;
}

interface ProjectMetrics extends ViewMetrics {
  type: 'project';
  avgBudget: number;
  proposalRate: number;
}

type Metrics = ServiceMetrics | ProjectMetrics;

interface TrendingSkill {
  name: string;
  growth: string;
}

interface MetricItem {
  label: string;
  value: string;
}

interface PriceInsight {
  label: string;
  value: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

interface TopProvider {
  id: number;
  username: string;
  avatar_url: string | null;
  rating: number;
  total_orders: number;
  completion_rate: number;
  response_time: string;
  skills: string[];
}

interface MarketTrend {
  category: string;
  growth_rate: number;
  avg_price: number;
  demand_level: 'High' | 'Medium' | 'Low';
  trend: 'up' | 'down' | 'stable';
}

interface SkillRecommendation {
  skill: string;
  relevance: number;
  projects_count: number;
  avg_budget: number;
}

// Add this constant at the top of the file
const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={project.client.avatar_url || DEFAULT_AVATAR}
            alt={project.client.username}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = DEFAULT_AVATAR;
            }}
          />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            ${project.budget_min.toLocaleString()} - ${project.budget_max.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.required_skills.map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Due {project.deadline}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Posted {formatDistanceToNow(new Date(project.deadline))} ago</span>
        </div>
      </div>
    </div>
  );
};

// Add these new interfaces after the existing interfaces
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CategoryInsight {
  id: number;
  name: string;
  count: number;
  trend: 'up' | 'down' | 'neutral';
  change: number;
}

// Add this new component before the main Services component
const CategoryCard: React.FC<{ category: CategoryStats; onClick: () => void; isSelected: boolean }> = ({ 
  category, 
  onClick, 
  isSelected 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-4 transition-all ${
        isSelected 
          ? 'bg-indigo-50 border-2 border-indigo-500' 
          : 'bg-white border border-gray-100 hover:border-indigo-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">{category.name}</h3>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {category.count}
        </span>
      </div>
      
      <div className="text-sm text-gray-500">
        {category.type === 'service' ? (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400 fill-current" />
            <span>{category.avgRating.toFixed(1)} avg rating</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span>${category.avgBudget.toLocaleString()} avg budget</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function Services() {
  const navigate = useNavigate();
  const { categories } = useServiceCategories();
  const [activeView, setActiveView] = useState('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    maxDeliveryTime: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    search: '',
    sortBy: 'rating_desc',
    experienceLevel: ''
  });
  const [activeFilters, setActiveFilters] = useState<FilterTag[]>([]);
  const [priceRangeValue, setPriceRangeValue] = useState<[number, number]>([0, 1000]);
  const [showTrendingTopics, setShowTrendingTopics] = useState(true);
  const [trendingTopics] = useState<TrendingTopic[]>([
    { id: '1', name: 'AI Development', growth: 127, icon: '🤖' },
    { id: '2', name: 'Mobile Apps', growth: 85, icon: '📱' },
    { id: '3', name: 'UI/UX Design', growth: 73, icon: '🎨' },
    { id: '4', name: 'Data Science', growth: 68, icon: '📊' },
  ]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [compareList, setCompareList] = useState<Service[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [lastViewedServices, setLastViewedServices] = useState<Service[]>([]);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [topProviders, setTopProviders] = useState<TopProvider[]>([]);
  const [marketInsights, setMarketInsights] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('asc');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [deliveryTimeFilter, setDeliveryTimeFilter] = useState<string | null>(null);
  const [skillRecommendations, setSkillRecommendations] = useState<SkillRecommendation[]>([]);
  const [showSkillRecommendations, setShowSkillRecommendations] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (activeView === 'services') {
      fetchServices();
    } else if (activeView === 'projects') {
      fetchProjects();
    }
  }, [activeView, searchQuery, selectedCategory, filters]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('services')
        .select(`
          *,
          category:service_categories!services_category_id_fkey(*),
          service_levels(*),
          provider:profiles!services_provider_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .eq('is_active', true);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq('category.name', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('project_requests')
        .select(`
          *,
          category:service_categories(id, name, slug),
          client:profiles!project_requests_client_id_fkey(
            id,
            username,
            avatar_url
          )
        `);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq('category.name', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      const transformedProjects = data?.map(project => ({
        ...project,
        id: project.id,
        category_id: project.category?.id || 0,
        budget_min: project.budget_min || 0,
        budget_max: project.budget_max || 0,
        total_proposals: 0,
        client: {
          id: project.client?.id || '',
          username: project.client?.username || 'Anonymous',
          avatar_url: project.client?.avatar_url || DEFAULT_AVATAR
        },
        category: project.category ? {
          id: project.category.id,
          name: project.category.name,
          slug: project.category.slug
        } : undefined
      })) as Project[];

      setProjects(transformedProjects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortServices = (services: Service[]) => {
    switch (sortBy) {
      case 'popular':
        return [...services].sort((a, b) => b.total_orders - a.total_orders);
      case 'newest':
        return [...services].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'rating':
        return [...services].sort((a, b) => b.rating - a.rating);
      default:
        return services;
    }
  };

  const filteredServices = sortServices(services).filter(service => 
    service.starting_price >= priceRange[0] && 
    service.starting_price <= priceRange[1] &&
    (!selectedLevel || (service.service_levels && service.service_levels.some(level => level.name === selectedLevel)))
  );

  // Enhanced category selection handler
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(prev => prev === categoryName ? null : categoryName);
    const existingCategoryFilter = activeFilters.find(f => f.type === 'category');
    if (existingCategoryFilter) {
      setActiveFilters(prev => prev.filter(f => f.type !== 'category'));
    }
    if (categoryName) {
      setActiveFilters(prev => [...prev, {
        id: `category-${categoryName}`,
        label: categoryName,
        type: 'category',
        value: categoryName
      }]);
    }
  };

  // Enhanced price range handler
  const handlePriceRangeChange = (values: [number, number]) => {
    setPriceRangeValue(values);
    const existingPriceFilter = activeFilters.find(f => f.type === 'price');
    if (existingPriceFilter) {
      setActiveFilters(prev => prev.filter(f => f.type !== 'price'));
    }
    setActiveFilters(prev => [...prev, {
      id: `price-range`,
      label: `$${values[0]} - $${values[1]}`,
      type: 'price' as const,
      value: values
    }]);
  };

  // Remove filter tag
  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    const filter = activeFilters.find(f => f.id === filterId);
    if (filter?.type === 'category') {
      setSelectedCategory(null);
    } else if (filter?.type === 'price') {
      setPriceRangeValue([0, 1000]);
    }
  };

  // Apply filters to services
  const getFilteredServices = () => {
    return services.filter(service => {
      const categoryFilter = activeFilters.find(f => f.type === 'category');
      const priceFilter = activeFilters.find(f => f.type === 'price');
      const levelFilter = activeFilters.find(f => f.type === 'level');
      const ratingFilter = activeFilters.find(f => f.type === 'rating');
      const deliveryFilter = activeFilters.find(f => f.type === 'delivery');

      const matchesCategory = !categoryFilter || service.category?.name === categoryFilter.value;
      const matchesPrice = !priceFilter || (
        service.starting_price >= (priceFilter.value as [number, number])[0] &&
        service.starting_price <= (priceFilter.value as [number, number])[1]
      );
      const matchesLevel = !levelFilter || service.service_levels?.some(level => 
        level.name.toLowerCase() === levelFilter.value
      );
      const matchesRating = !ratingFilter || service.rating >= (ratingFilter.value as number);
      const matchesDelivery = !deliveryFilter || service.delivery_time.includes(deliveryFilter.value as string);

      return matchesCategory && matchesPrice && matchesLevel && matchesRating && matchesDelivery;
    });
  };

  // Smooth scroll function
  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Enhanced trending topic click handler
  const handleTrendingTopicClick = (topic: TrendingTopic) => {
    if (selectedTrend === topic.id) {
      // If clicking the same topic again, clear the selection and filters
      setSelectedTrend(null);
      setSearchQuery('');
      // Add a subtle animation before scrolling back up
      const header = document.querySelector('.bg-gradient-to-br');
      header?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Select new topic and scroll to results
      setSelectedTrend(topic.id);
      setSearchQuery(topic.name);
      setTimeout(scrollToResults, 100);
    }
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        // Quick search
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      } else if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        // Toggle filters
        e.preventDefault();
        setShowFilters(prev => !prev);
      } else if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        // Toggle comparison
        e.preventDefault();
        setShowComparison(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Handle service comparison
  const toggleCompare = (service: Service) => {
    if (compareList.find(s => s.id === service.id)) {
      setCompareList(prev => prev.filter(s => s.id !== service.id));
    } else if (compareList.length < 3) {
      setCompareList(prev => [...prev, service]);
      // Trigger confetti effect when adding to compare
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.6 }
      });
    }
  };

  // Track last viewed services
  const handleServiceView = (service: Service) => {
    setLastViewedServices(prev => {
      const filtered = prev.filter(s => s.id !== service.id);
      return [service, ...filtered].slice(0, 3);
    });
    navigate(`/services/${service.id}`);
  };

  // Generate smart suggestions based on user behavior
  const getSmartSuggestions = () => {
    const suggestions = [];
    
    // Based on last viewed services
    if (lastViewedServices.length > 0) {
      const categories = lastViewedServices.map(s => s.category?.name);
      suggestions.push({
        type: 'category',
        title: 'Based on your recent views',
        services: services.filter(s => 
          categories.includes(s.category?.name) && 
          !lastViewedServices.find(ls => ls.id === s.id)
        ).slice(0, 3)
      });
    }

    // High-rated services in popular categories
    suggestions.push({
      type: 'rating',
      title: 'Highly Rated Services',
      services: services
        .filter(s => s.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
    });

    return suggestions;
  };

  // Service Categories Insights
  const getCategoryStats = async (): Promise<CategoryStats[]> => {
    if (activeView === 'services') {
      const { data: categories } = await supabase
        .from('service_categories')
        .select('id, name, slug');

      if (!categories) return [];

      const typedCategories = categories as Category[];
      const typedServices = services as Service[];
      
      return typedCategories.map(category => ({
        ...category,
        count: typedServices.filter(service => Number(service.category_id) === category.id).length,
        label: 'Active Services',
        type: 'service' as const,
        avgRating: typedServices
          .filter(service => Number(service.category_id) === category.id)
          .reduce((acc, service) => acc + (service.rating || 0), 0) / typedServices.length || 0
      }));
    } else {
      const { data: categories } = await supabase
        .from('service_categories')
        .select('id, name, slug');

      if (!categories) return [];

      const typedCategories = categories as Category[];
      const typedProjects = projects as Project[];
      
      return typedCategories.map(category => ({
        ...category,
        count: typedProjects.filter(project => Number(project.category_id) === category.id).length,
        label: 'Open Projects',
        type: 'project' as const,
        avgBudget: typedProjects
          .filter(project => Number(project.category_id) === category.id)
          .reduce((acc, project) => acc + (project.budget_min + project.budget_max) / 2, 0) / typedProjects.length || 0
      }));
    }
  };

  // Update the useEffect to handle async function
  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getCategoryStats();
      setCategoryStats(stats);
    };
    
    fetchStats();
  }, [activeView, services, projects]);

  // Popular Filters
  const getPopularFilters = () => {
    if (activeView === 'services') {
      return [
        { label: '⚡ Fast Delivery (24h)', type: 'delivery', value: '24h' },
        { label: '⭐ Top Rated (4.5+)', type: 'rating', value: 4.5 },
        { label: '💎 Premium Services', type: 'level', value: 'premium' },
        { label: '🔥 Most Popular', type: 'sort', value: 'popular' },
      ];
    } else {
      return [
        { label: '💰 High Budget ($1000+)', type: 'budget', value: 1000 },
        { label: '⚡ Urgent Projects', type: 'deadline', value: 'urgent' },
        { label: '🎯 Beginner Friendly', type: 'level', value: 'beginner' },
        { label: '🆕 Newest First', type: 'sort', value: 'newest' },
      ];
    }
  };

  // Replace the existing popularFilters state with the dynamic function
  const [popularFilters] = useState(getPopularFilters());

  // Add getViewMetrics function
  const getViewMetrics = () => {
    if (activeView === 'services') {
      return [
        {
          id: 'total_services',
          title: 'Active Services',
          value: services.length,
          change: 12,
          icon: <Package className="h-5 w-5 text-indigo-600" />,
          trend: 'up',
          type: 'service',
          avgRating: 4.5,
          completionRate: 95
        },
        {
          id: 'total_orders',
          title: 'Total Orders',
          value: services.reduce((acc, s) => acc + s.total_orders, 0),
          change: 8,
          icon: <Briefcase className="h-5 w-5 text-emerald-600" />,
          trend: 'up',
          type: 'service',
          avgRating: 4.2,
          completionRate: 92
        }
      ] as ServiceMetrics[];
    } else {
      return [
        {
          id: 'open_projects',
          title: 'Open Projects',
          value: projects.length,
          change: 15,
          icon: <Target className="h-5 w-5 text-indigo-600" />,
          trend: 'up',
          type: 'project',
          avgBudget: 2500,
          proposalRate: 85
        },
        {
          id: 'total_proposals',
          title: 'Total Proposals',
          value: projects.reduce((acc, p) => acc + (p.total_proposals || 0), 0),
          change: 20,
          icon: <Users className="h-5 w-5 text-emerald-600" />,
          trend: 'up',
          type: 'project',
          avgBudget: 3000,
          proposalRate: 90
        }
      ] as ProjectMetrics[];
    }
  };

  useEffect(() => {
    setMetrics(getViewMetrics());
  }, [activeView, services, projects]);

  const fetchTopProviders = async () => {
    try {
      const { data: providers, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          rating,
          total_orders
        `)
        .order('rating', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Transform the data to include default values for missing fields
      const transformedProviders = providers?.map(provider => ({
        ...provider,
        completion_rate: 98, // Default value
        response_time: '< 24 hours', // Default value
        skills: ['Web Development', 'UI/UX Design'] // Default skills
      })) as TopProvider[];

      setTopProviders(transformedProviders || []);
    } catch (error) {
      console.error('Error fetching top providers:', error);
    }
  };

  // Remove the market trends fetching since the table doesn't exist
  useEffect(() => {
    fetchTopProviders();
    // Remove fetchMarketTrends call
  }, []);

  // Add static market trends data
  const staticMarketTrends: MarketTrend[] = [
    {
      category: 'Web Development',
      growth_rate: 45,
      avg_price: 2500,
      demand_level: 'High',
      trend: 'up'
    },
    {
      category: 'Mobile Apps',
      growth_rate: 38,
      avg_price: 3500,
      demand_level: 'High',
      trend: 'up'
    },
    {
      category: 'UI/UX Design',
      growth_rate: 32,
      avg_price: 1800,
      demand_level: 'Medium',
      trend: 'up'
    },
    {
      category: 'Data Science',
      growth_rate: 28,
      avg_price: 4000,
      demand_level: 'High',
      trend: 'up'
    }
  ];

  // Update useEffect to set static market trends
  useEffect(() => {
    setMarketTrends(staticMarketTrends);
  }, []);

  const getFilteredResults = () => {
    if (activeView === 'services') {
      let results = [...services];

      // Apply skill filters for services
      if (selectedSkills.length > 0) {
        results = results.filter(service => 
          service.skills?.some(skill => selectedSkills.includes(skill))
        );
      }

      // Apply rating filter for services
      if (ratingFilter) {
        results = results.filter(service => service.rating >= ratingFilter);
      }

      // Apply delivery time filter for services
      if (deliveryTimeFilter) {
        results = results.filter(service => 
          parseInt(service.delivery_time) <= parseInt(deliveryTimeFilter)
        );
      }

      // Apply price sorting for services
      results.sort((a, b) => {
        return priceSort === 'asc' 
          ? a.starting_price - b.starting_price
          : b.starting_price - a.starting_price;
      });

      return results;
    } else {
      let results = [...projects];

      // Apply skill filters for projects
      if (selectedSkills.length > 0) {
        results = results.filter(project => 
          project.required_skills.some(skill => selectedSkills.includes(skill))
        );
      }

      // Apply budget sorting for projects
      results.sort((a, b) => {
        const avgBudgetA = (a.budget_min + a.budget_max) / 2;
        const avgBudgetB = (b.budget_min + b.budget_max) / 2;
        return priceSort === 'asc' 
          ? avgBudgetA - avgBudgetB
          : avgBudgetB - avgBudgetA;
      });

      return results;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ServiceHeader 
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        services={services}
        projects={projects}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ViewMetrics metrics={metrics} />

        {/* Market Insights */}
        <MarketInsights activeView={activeView} />

        {/* Top Providers Section */}
        <TopProviders topProviders={topProviders} />

        {/* Market Trends Section */}
        <MarketTrends marketTrends={marketTrends} />

        {/* Add AI Matchmaker */}
        <AIMatchmaker className="mb-8" />

        {/* Enhanced Trending Topics */}
        <TrendingTopics 
          showTrendingTopics={showTrendingTopics}
          setShowTrendingTopics={setShowTrendingTopics}
          trendingTopics={trendingTopics}
          selectedTrend={selectedTrend}
          handleTrendingTopicClick={handleTrendingTopicClick}
        />

        {/* AI-Powered Recommendations */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6" />
              <h3 className="text-xl font-semibold">AI-Powered Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5" />
                  <span className="font-medium">Based on Your Profile</span>
                </div>
                <p className="text-sm text-white/80">
                  Services matching your skills and interests
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Community Picks</span>
                </div>
                <p className="text-sm text-white/80">
                  Highly rated by similar users
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Market Trends</span>
                </div>
                <p className="text-sm text-white/80">
                  Growing service categories
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'post',
                title: activeView === 'services' ? 'Post a Service' : 'Post a Project',
                description: activeView === 'services' 
                  ? 'Share your expertise with potential clients'
                  : 'Get help from skilled professionals',
                icon: <Plus className="h-5 w-5 text-white" />,
                action: () => navigate(activeView === 'services' ? '/post-service' : '/post-project')
              },
              {
                id: 'ai',
                title: 'AI Matchmaker',
                description: 'Find the perfect match with AI assistance',
                icon: <Brain className="h-5 w-5 text-white" />,
                action: () => setShowSmartSuggestions(true)
              },
              {
                id: 'saved',
                title: 'Saved Items',
                description: 'View your bookmarked services and projects',
                icon: <Heart className="h-5 w-5 text-white" />,
                action: () => navigate('/saved')
              },
              {
                id: 'insights',
                title: 'Market Insights',
                description: 'Explore trends and opportunities',
                icon: <BarChart className="h-5 w-5 text-white" />,
                action: () => setShowTrendingTopics(true)
              }
            ].map((action) => (
              <motion.div
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 cursor-pointer group hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:from-indigo-600 group-hover:to-purple-700 transition-colors">
                    {action.icon}
                </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Enhanced Categories Section */}
        <CategorySection 
          categoryStats={categoryStats}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Active Filters */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {activeFilters.map(filter => (
                <motion.span
                  key={filter.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm"
                >
                  {filter.label}
                  <button
                    onClick={() => handleRemoveFilter(filter.id)}
                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
              <button
                onClick={() => setActiveFilters([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Popular Filters */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Filters</h3>
          <div className="flex flex-wrap gap-2">
            {popularFilters.map((filter, index) => (
              <motion.button
                key={filter.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  const newFilter: FilterTag = {
                    id: `popular-${filter.type}-${filter.value}`,
                    label: filter.label,
                    type: filter.type as any,
                    value: filter.value
                  };
                  setActiveFilters(prev => [...prev.filter(f => f.type !== filter.type), newFilter]);
                }}
                className="px-4 py-2 rounded-full bg-gray-50 text-gray-700 text-sm hover:bg-gray-100 transition-colors"
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Enhanced Advanced Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredServices.length} results
      </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                  {/* Price Range Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Price Range: ${priceRangeValue[0]} - ${priceRangeValue[1]}
                    </label>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={priceRangeValue[0]}
                        onChange={(e) => handlePriceRangeChange([Number(e.target.value), priceRangeValue[1]])}
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={priceRangeValue[1]}
                        onChange={(e) => handlePriceRangeChange([priceRangeValue[0], Number(e.target.value)])}
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer mt-2"
                      />
                    </div>
                  </div>

                  {/* Enhanced Service Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Level</label>
                    <div className="space-y-2">
                      {['basic', 'standard', 'premium'].map(level => (
                        <button
                          key={level}
                          onClick={() => {
                            const existingLevel = activeFilters.find(f => f.type === 'level');
                            if (existingLevel?.value === level) {
                              setActiveFilters(prev => prev.filter(f => f.type !== 'level'));
                            } else {
                              setActiveFilters(prev => [
                                ...prev.filter(f => f.type !== 'level'),
                                {
                                  id: `level-${level}`,
                                  label: `${level.charAt(0).toUpperCase()}${level.slice(1)} Level`,
                                  type: 'level',
                                  value: level
                                }
                              ]);
                            }
                          }}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium capitalize flex items-center justify-between ${
                            activeFilters.some(f => f.type === 'level' && f.value === level)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {level}
                          {activeFilters.some(f => f.type === 'level' && f.value === level) && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-2 w-2 rounded-full bg-white"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Delivery Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                    <div className="space-y-2">
                      {[
                        { value: '24h', label: 'Up to 24 hours' },
                        { value: '3d', label: 'Up to 3 days' },
                        { value: '7d', label: 'Up to 7 days' },
                        { value: '14d', label: 'Up to 14 days' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            const existingDelivery = activeFilters.find(f => f.type === 'delivery');
                            if (existingDelivery?.value === option.value) {
                              setActiveFilters(prev => prev.filter(f => f.type !== 'delivery'));
                            } else {
                              setActiveFilters(prev => [
                                ...prev.filter(f => f.type !== 'delivery'),
                                {
                                  id: `delivery-${option.value}`,
                                  label: option.label,
                                  type: 'delivery',
                                  value: option.value
                                }
                              ]);
                            }
                          }}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                            activeFilters.some(f => f.type === 'delivery' && f.value === option.value)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {option.label}
                          {activeFilters.some(f => f.type === 'delivery' && f.value === option.value) && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-2 w-2 rounded-full bg-white"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results Count */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 pt-4 border-t text-sm text-gray-500"
                >
                  Found {getFilteredServices().length} services matching your filters
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Skill Filtering */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-600" />
              Skills & Expertise
            </h2>
            <button
              onClick={() => setShowSkillRecommendations(!showSkillRecommendations)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <Sparkle className="h-4 w-4" />
              Get Recommendations
            </button>
          </div>

          {/* Selected Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium flex items-center gap-1"
              >
                {skill}
                <button
                  onClick={() => setSelectedSkills(skills => skills.filter(s => s !== skill))}
                  className="hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Popular Skills */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'TypeScript', 'Python', 'UI/UX', 'Mobile Dev'].map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    if (!selectedSkills.includes(skill)) {
                      setSelectedSkills([...selectedSkills, skill]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-indigo-100 text-indigo-700 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Recommendations */}
          <AnimatePresence>
            {showSkillRecommendations && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Recommended Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        skill: 'Machine Learning',
                        relevance: 95,
                        projects_count: 120,
                        avg_budget: 2500
                      },
                      {
                        skill: 'Blockchain',
                        relevance: 88,
                        projects_count: 85,
                        avg_budget: 3000
                      },
                      {
                        skill: 'Cloud Architecture',
                        relevance: 82,
                        projects_count: 95,
                        avg_budget: 2800
                      }
                    ].map((rec) => (
                      <div
                        key={rec.skill}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          if (!selectedSkills.includes(rec.skill)) {
                            setSelectedSkills([...selectedSkills, rec.skill]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{rec.skill}</span>
                          <span className="text-sm text-emerald-600 font-medium">
                            {rec.relevance}% match
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-500">
                          <div className="flex items-center justify-between">
                            <span>Active Projects</span>
                            <span className="font-medium text-gray-700">{rec.projects_count}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Avg. Budget</span>
                            <span className="font-medium text-gray-700">
                              ${rec.avg_budget.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Filtering UI */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as 'asc' | 'desc')}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-8 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={ratingFilter || ''}
              onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-8 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
            <Star className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={deliveryTimeFilter || ''}
              onChange={(e) => setDeliveryTimeFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-8 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Any Delivery Time</option>
              <option value="24">Up to 24 hours</option>
              <option value="72">Up to 3 days</option>
              <option value="168">Up to 1 week</option>
            </select>
            <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Content Grid */}
        <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {activeView === 'services' ? (
            getFilteredServices().map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {service.images?.[0] && (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {service.is_featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                    Featured
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                      {service.provider?.avatar_url ? (
                        <img
                          src={service.provider.avatar_url}
                          alt={service.provider.username}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-indigo-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-500">by {service.provider?.username}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                  {service.short_description}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {service.rating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        ({service.total_reviews})
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.delivery_time}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Starting from</p>
                    <p className="text-xl font-bold text-indigo-600">
                      ${service.starting_price}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium 
                    hover:bg-indigo-100 transition-colors flex items-center gap-2"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Add Skill Badges */}
                <div className="px-6 py-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {service.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs font-medium rounded-full
                          bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600"
                      >
                        {skill}
                      </span>
                    ))}
                    {service.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        +{service.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <Heart className="h-4 w-4 text-rose-500" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <Share2 className="h-4 w-4 text-indigo-500" />
                  </motion.button>
                </div>

                {/* Service Level Badge */}
                {service.service_levels?.[0] && (
                  <div className="absolute top-4 right-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 
                      text-white text-xs font-medium rounded-full shadow-lg"
                    >
                      {service.service_levels[0].name.toUpperCase()}
                    </motion.div>
                  </div>
                )}
              </div>
              </motion.div>
            ))
          ) : (
            projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))
          )}
        </div>

        {/* Service Categories Insights */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {activeView === 'services' ? 'Service Categories' : 'Project Categories'} Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryStats.map((category) => (
                <div key={category.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg">
                      {getCategoryIcon(category.name)}
                    </div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{category.label}</span>
                    <span className="font-medium text-gray-900">{category.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {category.type === 'service' ? 'Avg. Rating' : 'Avg. Budget'}
                    </span>
                    <span className="font-medium text-gray-900">
                      {category.type === 'service' 
                        ? `⭐ ${category.avgRating}`
                        : `$${category.avgBudget}`}
                    </span>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          {activeView === 'services' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/services/offer')}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl 
            text-sm font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 
            transition-all flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Offer Your Service
          </motion.button>
          ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/services/post-project')}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl 
            text-sm font-medium shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 
            transition-all flex items-center gap-2"
          >
            <Rocket className="h-5 w-5" />
            Post a Project
          </motion.button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowKeyboardShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </h3>
              <div className="space-y-3">
                {[
                  { keys: ['⌘', '/'], description: 'Quick search' },
                  { keys: ['⌘', 'F'], description: 'Toggle filters' },
                  { keys: ['⌘', 'C'], description: 'Toggle comparison' },
                ].map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span
                          key={keyIndex}
                          className="px-2 py-1 bg-gray-100 rounded text-sm font-medium"
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Comparison Drawer */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Compare Services ({compareList.length}/3)
                </h3>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {compareList.map(service => (
                  <div key={service.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{service.title}</h4>
                      <button
                        onClick={() => toggleCompare(service)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price</span>
                        <span className="font-medium">${service.starting_price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rating</span>
                        <span className="font-medium">{service.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery</span>
                        <span className="font-medium">{service.delivery_time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {Array.from({ length: 3 - compareList.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center text-gray-400"
                  >
                    Add service to compare
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Suggestions */}
      {showSmartSuggestions && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-violet-600" />
                <h3 className="font-semibold text-gray-900">Smart Suggestions</h3>
              </div>
              <button
                onClick={() => setShowSmartSuggestions(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="space-y-6">
              {getSmartSuggestions().map((section, index) => (
                <div key={section.type}>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkle className="h-4 w-4 text-amber-500" />
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {section.services.map(service => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                            {service.provider?.avatar_url ? (
                              <img
                                src={service.provider.avatar_url}
                                alt={service.provider.username}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <Users className="h-5 w-5 text-violet-500" />
                            )}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 line-clamp-1">
                              {service.title}
                            </h5>
                            <p className="text-sm text-gray-500">
                              by {service.provider?.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-400" />
                            <span>{service.rating.toFixed(1)}</span>
                          </div>
                          <span className="font-medium text-violet-600">
                            ${service.starting_price}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowKeyboardShortcuts(true)}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Keyboard className="h-5 w-5 text-gray-700" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComparison(true)}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Scale className="h-5 w-5 text-gray-700" />
          {compareList.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center">
              {compareList.length}
            </span>
          )}
        </motion.button>
      </div>

      {/* Growth & Development Hub */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Growth & Development Hub</h2>
                </div>
          <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View All Resources
              </button>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  Add portfolio examples
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Complete skill assessments
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
                <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended Path</h4>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Target className="h-4 w-4" />
                  Full-Stack Development Mastery
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { skill: 'React Advanced', progress: 75 },
                  { skill: 'Node.js APIs', progress: 60 },
                  { skill: 'Database Design', progress: 45 }
                ].map((item) => (
                  <div key={item.skill}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.skill}</span>
                      <span className="text-gray-900 font-medium">{item.progress}%</span>
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
                    
          {/* Client Success Tools */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Client Success Tools</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-purple-900 mb-2">Communication Style</h4>
                <p className="text-sm text-purple-700">Professional & Proactive</p>
              </div>
              <div className="space-y-3">
                {[
                  { metric: 'Response Rate', value: '98%' },
                  { metric: 'Client Satisfaction', value: '4.9/5' },
                  { metric: 'Repeat Clients', value: '85%' }
                ].map((item) => (
                  <div key={item.metric} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.metric}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
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
            <Gem className="h-5 w-5 text-violet-600" />
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
            <button className="w-full mt-4 py-2 px-4 bg-violet-100 rounded-lg text-sm font-medium text-violet-600 hover:bg-violet-200 transition-colors">
              Build Requirements
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
                {[
                  { factor: 'Clear Requirements', score: 95 },
                  { factor: 'Budget Alignment', score: 88 },
                  { factor: 'Timeline Feasibility', score: 90 }
                ].map((item) => (
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
    </div>
  );
}

// Helper function to get category icon
function getCategoryIcon(iconName: string) {
  const icons: { [key: string]: React.ReactNode } = {
    Code: <Code className="h-4 w-4" />,
    Palette: <Palette className="h-4 w-4" />,
    Wrench: <Wrench className="h-4 w-4" />,
    GraduationCap: <GraduationCap className="h-4 w-4" />,
    PenTool: <PenTool className="h-4 w-4" />,
    BarChart: <BarChart className="h-4 w-4" />,
    Box: <Box className="h-4 w-4" />,
    Cpu: <Cpu className="h-4 w-4" />,
    Smartphone: <Smartphone className="h-4 w-4" />,
    SearchIcon: <SearchIcon className="h-4 w-4" />,
  };
  return icons[iconName] || <Lightbulb className="h-4 w-4" />;
} 