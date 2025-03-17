import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Camera, 
  Sparkles, 
  Tag, 
  MapPin,
  Bookmark,
  Award,
  Smile,
  Image as ImageIcon,
  Link as LinkIcon,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../../types/merch';

interface StylePost {
  id: string;
  user: {
    name: string;
    avatar: string;
    isDesigner: boolean;
    points: number;
    badge?: string;
  };
  image: string;
  caption: string;
  likes: number;
  comments: number;
  location?: string;
  products: Product[];
  tags: string[];
  isLiked: boolean;
  isSaved: boolean;
  timestamp: string;
}

interface CampusStyleFeedProps {
  onProductClick: (productId: string) => void;
  maxPosts?: number;
  showViewAll?: boolean;
}

export default function CampusStyleFeed({ 
  onProductClick, 
  maxPosts = 2,
  showViewAll = true 
}: CampusStyleFeedProps) {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [posts, setPosts] = useState<StylePost[]>([
    {
      id: '1',
      user: {
        name: 'Sarah Designer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        isDesigner: true,
        points: 1250,
        badge: 'Top Designer'
      },
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      caption: 'Styling our new Engineering collection with a modern twist! 🎓✨ The comfort level is amazing, perfect for those long study sessions. What do you think about this combination?',
      likes: 234,
      comments: 45,
      location: 'Engineering Building',
      products: [],
      tags: ['CampusStyle', 'EngineeringFashion', 'CollegeLife'],
      isLiked: false,
      isSaved: false,
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      user: {
        name: 'Alex Creative',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        isDesigner: false,
        points: 850,
        badge: 'Style Enthusiast'
      },
      image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800',
      caption: 'Found the perfect combo from the new CS department merch! The minimalist design speaks volumes. 💻 Loving how it represents our tech culture!',
      likes: 186,
      comments: 32,
      location: 'Computer Science Lab',
      products: [],
      tags: ['TechStyle', 'CSMerch', 'MinimalistFashion'],
      isLiked: false,
      isSaved: false,
      timestamp: '5 hours ago'
    }
  ]);

  const [showUpload, setShowUpload] = useState(false);
  const [activePost, setActivePost] = useState<StylePost | null>(null);

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      )
    );
  };

  const handleSave = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + posts.length) % posts.length);
  };

  // Get trending posts
  const trendingPosts = posts.slice(0, maxPosts);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Style Feed</h2>
          <p className="text-gray-600 mt-1">Get inspired by campus fashion trends</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700
              transition-colors flex items-center gap-2 shadow-sm"
          >
            <Camera className="w-5 h-5" />
            Share Your Style
          </button>
          {showViewAll && (
            <button
              onClick={() => navigate('/style-feed')}
              className="px-4 py-2 text-violet-600 hover:bg-violet-50 rounded-lg
                transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              View All Styles
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Style Feed Carousel */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-2 gap-8">
          {trendingPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Post Image */}
              <div 
                className="relative aspect-[4/3] cursor-pointer group"
                onClick={() => setActivePost(post)}
              >
                <img
                  src={post.image}
                  alt="Style post"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                  transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">View Details</span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{post.user.name}</span>
                      {post.user.isDesigner && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                          font-medium bg-violet-100 text-violet-800">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {post.user.badge}
                        </span>
                      )}
                    </div>
                    {post.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption - Limited to 2 lines */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.caption}</p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{post.comments}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleSave(post.id)}
                    className={`transition-colors ${
                      post.isSaved ? 'text-violet-600' : 'text-gray-600 hover:text-violet-600'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-xs text-violet-600 hover:text-violet-700 cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{post.tags.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button - Centered */}
        {showViewAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => navigate('/style-feed')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white 
                rounded-full hover:bg-violet-700 transition-colors shadow-sm"
            >
              View All Style Posts
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-gray-500 mt-2">
              Join the community and share your campus style
            </p>
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6">Share Your Style</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-violet-50 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-violet-400" />
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                        Choose Photo
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        JPG, PNG or GIF, max 5MB
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Caption
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      rows={3}
                      placeholder="Share your thoughts about your style..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tag Products
                    </label>
                    <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg
                      text-gray-500 hover:text-violet-600 hover:border-violet-300 transition-colors flex items-center justify-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      Link Products
                    </button>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowUpload(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                      Share Post
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {activePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setActivePost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex">
                {/* Image Section */}
                <div className="w-2/3">
                  <img
                    src={activePost.image}
                    alt="Style post"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details Section */}
                <div className="w-1/3 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <img
                      src={activePost.user.avatar}
                      alt={activePost.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activePost.user.name}</span>
                        {activePost.user.isDesigner && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                            font-medium bg-violet-100 text-violet-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {activePost.user.badge}
                          </span>
                        )}
                      </div>
                      {activePost.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {activePost.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm mb-4">{activePost.caption}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {activePost.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-sm text-violet-600 hover:text-violet-700 cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(activePost.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          activePost.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${activePost.isLiked ? 'fill-current' : ''}`} />
                        <span>{activePost.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-violet-600 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>{activePost.comments}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleSave(activePost.id)}
                      className={`transition-colors ${
                        activePost.isSaved ? 'text-violet-600' : 'text-gray-600 hover:text-violet-600'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${activePost.isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Add comment section here */}
                  <div className="mt-auto">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-600 hover:text-violet-700">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 