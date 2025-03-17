import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Image as ImageIcon,
  Camera,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  onClose: () => void;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  size?: string;
  fit?: 'small' | 'true' | 'large';
}

export default function ProductReviews({ productId, onClose }: ProductReviewsProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'write'>('reviews');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [fit, setFit] = useState<'small' | 'true' | 'large'>('true');
  const [media, setMedia] = useState<File[]>([]);
  const [filter, setFilter] = useState<'all' | 'with_media' | 'verified'>('all');
  const [sort, setSort] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John D.',
      rating: 5,
      title: 'Perfect fit and great quality!',
      comment: 'The material is super comfortable and the size guide was spot on. Highly recommend!',
      date: '2024-01-15',
      helpful: 12,
      verified: true,
      media: [
        {
          type: 'image',
          url: 'https://picsum.photos/seed/review1/400/400',
        },
      ],
      size: 'M',
      fit: 'true',
    },
    // Add more mock reviews
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement review submission logic
    console.log({
      rating,
      title,
      comment,
      selectedSize,
      fit,
      media,
    });
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMedia((prev) => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredReviews = reviews
    .filter((review) => {
      if (filter === 'with_media') return review.media && review.media.length > 0;
      if (filter === 'verified') return review.verified;
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Customer Reviews</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'reviews'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Read Reviews
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'write'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Write a Review
            </button>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-20">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{rating}</span>
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((ratingCounts[rating] || 0) / reviews.length) * 100}%`,
                      }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">
                    {ratingCounts[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Filter & Sort</h4>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50
                  rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </div>
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as typeof filter)}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="all">All Reviews</option>
                      <option value="with_media">With Photos/Videos</option>
                      <option value="verified">Verified Purchases</option>
                    </select>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as typeof sort)}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                      <option value="helpful">Most Helpful</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {activeTab === 'reviews' ? (
          // Reviews List
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b pb-6"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.verified && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium mb-1">{review.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                    {review.size && (
                      <p className="text-sm text-gray-500">
                        Size: {review.size} · Fits: {review.fit === 'true' ? 'True to size' : review.fit === 'small' ? 'Runs small' : 'Runs large'}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{review.date}</div>
                </div>

                {/* Review Media */}
                {review.media && review.media.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.media.map((item, index) => (
                      <div key={index} className="relative w-20 h-20">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={`Review ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <Camera className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful})
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <MessageCircle className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Write Review Form
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2
                  focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Details
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike? How was the fit?"
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2
                  focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Size and Fit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size Purchased
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Size</option>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How does it fit?
                </label>
                <select
                  value={fit}
                  onChange={(e) => setFit(e.target.value as typeof fit)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="small">Runs Small</option>
                  <option value="true">True to Size</option>
                  <option value="large">Runs Large</option>
                </select>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos/Videos
              </label>
              <div className="flex flex-wrap gap-4">
                {media.map((file, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2
                  border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500
                  transition-colors"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can upload up to 5 photos or videos
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg
                hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 