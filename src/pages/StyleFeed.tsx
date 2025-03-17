import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter,
  TrendingUp,
  Clock,
  Star,
  Search,
  Grid,
  List,
  Hash,
  Users,
  Camera,
  Award,
  Flame,
  Sparkles
} from 'lucide-react';
import CampusStyleFeed from '../components/merch/social/CampusStyleFeed';
import { useNavigate } from 'react-router-dom';

type SortOption = 'trending' | 'recent' | 'popular';
type ViewMode = 'grid' | 'list';

export default function StyleFeedPage() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const sortOptions = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'popular', label: 'Popular', icon: Star },
  ];

  // Trending tags data
  const trendingTags = [
    { tag: 'CampusStyle', posts: 234 },
    { tag: 'WinterCollection', posts: 189 },
    { tag: 'SportsMerch', posts: 156 },
    { tag: 'CasualWear', posts: 145 },
    { tag: 'CollegeLife', posts: 132 },
    { tag: 'Sustainable', posts: 98 },
  ];

  // Featured designers data
  const featuredDesigners = [
    {
      id: '1',
      name: 'Sarah Designer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      badge: 'Top Designer',
      followers: '2.5k',
      posts: 48
    },
    {
      id: '2',
      name: 'Alex Creative',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      badge: 'Style Expert',
      followers: '1.8k',
      posts: 36
    },
    {
      id: '3',
      name: 'Emma Fashion',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      badge: 'Trendsetter',
      followers: '3.2k',
      posts: 65
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Campus Style Feed</h1>
              <p className="text-violet-100 mt-2">Discover and share your campus fashion</p>
            </div>
            <button
              onClick={() => navigate('/merch')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg
                transition-colors backdrop-blur-sm font-medium"
            >
              Back to Merch
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            {[
              { label: 'Active Users', value: '5K+', icon: Users },
              { label: 'Posts Today', value: '120+', icon: Camera },
              { label: 'Top Designers', value: '50+', icon: Award },
              { label: 'Trending Styles', value: '25+', icon: Flame }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-violet-200">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="w-72">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search styles, tags, or users..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 
                    focus:ring-violet-500 focus:border-violet-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id as SortOption)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                    ${sortBy === option.id 
                      ? 'bg-violet-100 text-violet-700' 
                      : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <option.icon className="w-5 h-5" />
                  {option.label}
                </button>
              ))}

              {/* View Mode Toggle */}
              <div className="border-l pl-2 ml-2">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Trending Tags */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold text-gray-900">Trending Tags</h3>
              </div>
              <div className="space-y-3">
                {trendingTags.map((tag, index) => (
                  <button
                    key={tag.tag}
                    onClick={() => setSelectedTag(tag.tag)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg
                      transition-colors ${selectedTag === tag.tag 
                        ? 'bg-violet-50 text-violet-700' 
                        : 'hover:bg-gray-50'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span>#{tag.tag}</span>
                    </span>
                    <span className="text-sm text-gray-500">{tag.posts} posts</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Designers */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold text-gray-900">Featured Designers</h3>
              </div>
              <div className="space-y-4">
                {featuredDesigners.map((designer) => (
                  <div 
                    key={designer.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50
                      transition-colors cursor-pointer"
                  >
                    <img
                      src={designer.avatar}
                      alt={designer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{designer.name}</span>
                        <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                          {designer.badge}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {designer.followers} followers · {designer.posts} posts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1">
            <CampusStyleFeed 
              onProductClick={(id) => navigate(`/merch/${id}`)}
              maxPosts={50}
              showViewAll={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 