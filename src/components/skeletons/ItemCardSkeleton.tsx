import React from 'react';
import { motion } from 'framer-motion';

export default function ItemCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse" />
      
      {/* Title Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
      
      {/* Price Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
      
      {/* Footer Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
    </div>
  );
} 