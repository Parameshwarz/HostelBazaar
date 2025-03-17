import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  viewMode?: 'grid' | 'list';
}

export default function ItemCardSkeleton({ viewMode = 'grid' }: Props) {
  return (
    <motion.div
      className={`group relative bg-white rounded-xl shadow-sm overflow-hidden ${
        viewMode === 'list' ? 'flex' : 'block'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Image Skeleton */}
      <div 
        className={`relative ${
          viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'
        } bg-gray-100 animate-pulse`}
      />

      {/* Content Skeleton */}
      <div className={`${viewMode === 'list' ? 'flex-1' : ''} p-4 space-y-4`}>
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>

        {/* Price Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />

        {/* Seller Info Skeleton */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
} 