import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Upload, Camera, Video } from 'lucide-react';
import { Product } from '../../types/merch';
import { toast } from 'react-hot-toast';

interface ProductReviewsProps {
  product: Product | null;
  onClose: () => void;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
  media?: { type: 'image' | 'video'; url: string }[];
}

// One-time animation variants
const reviewVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ratingBarVariants = {
  hidden: { width: 0 },
  visible: (width: number) => ({
    width: `${width}%`,
    transition: { duration: 0.5 }
  })
};

export default function ProductReviews({ product, onClose }: ProductReviewsProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      rating: 5,
      comment: 'Great quality and perfect fit! Highly recommend.',
      userName: 'John D.',
      date: '2024-01-15',
      media: [{ type: 'image', url: 'https://picsum.photos/seed/review1/400/300' }]
    },
    {
      id: '2',
      rating: 4,
      comment: 'Nice design and comfortable material.',
      userName: 'Sarah M.',
      date: '2024-01-10'
    }
  ]);

  if (!product) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast.error('Please upload only images or videos');
      }
      return isValid;
    });
    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the review to your backend
    toast.success('Review submitted successfully!');
    setComment('');
    setRating(5);
    setMediaFiles([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="mb-6 text-2xl font-bold">Reviews - {product.title}</h2>

        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="mb-2 block">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded border p-2"
                rows={4}
                placeholder="Share your experience with this product..."
              />
            </div>

            <div>
              <label className="mb-2 block">Add Photos/Videos</label>
              <div className="flex space-x-4">
                <label className="flex cursor-pointer items-center space-x-2 rounded bg-gray-100 px-4 py-2 hover:bg-gray-200">
                  <Camera size={20} />
                  <span>Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                </label>
                <label className="flex cursor-pointer items-center space-x-2 rounded bg-gray-100 px-4 py-2 hover:bg-gray-200">
                  <Video size={20} />
                  <span>Add Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                </label>
              </div>
              {mediaFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="h-20 w-20 rounded bg-gray-200 p-2">
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMediaFiles(files => files.filter((_, i) => i !== index))}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Submit Review
            </button>
          </form>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-xl font-semibold">Customer Reviews</h3>
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                variants={reviewVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="border-b pb-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={16}
                          fill={index < review.rating ? 'currentColor' : 'none'}
                          className="text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="font-medium">{review.userName}</span>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
                {review.media && (
                  <div className="mt-3 flex gap-2">
                    {review.media.map((media, index) => (
                      <div key={index} className="h-24 w-24 overflow-hidden rounded">
                        {media.type === 'image' && (
                          <img
                            src={media.url}
                            alt={`Review ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 