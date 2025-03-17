import React from 'react';
import { motion } from 'framer-motion';

export default function SellerCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar Skeleton */}
        <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-2">
          {/* Name Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          {/* Department Skeleton */}
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4">
        {/* Rating Skeleton */}
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-8 animate-pulse" />
        </div>
        {/* Trades Skeleton */}
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
} 