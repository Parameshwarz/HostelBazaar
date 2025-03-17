import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  AlertTriangle,
  Eye, 
  MessageCircle,
  Tag,
  Bookmark,
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { RequestItem } from '../../types/trade';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { QuickResponseDialog } from '../QuickResponseDialog';

interface RequestCardProps {
  request: RequestItem;
  onQuickView?: (request: RequestItem) => void;
  onMatch?: (request: RequestItem) => void;
  onWatch?: (request: RequestItem) => void;
  onQuickResponse?: (request: RequestItem) => void;
  isWatching?: boolean;
  onUpdate?: () => void;
}

const urgencyColors = {
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-rose-100 text-rose-800'
};

const urgencyIcons = {
  low: <Clock className="h-4 w-4" />,
  medium: <AlertTriangle className="h-4 w-4" />,
  high: <AlertTriangle className="h-4 w-4" />
};

export default function RequestCard({ 
  request, 
  onQuickView, 
  onMatch, 
  onWatch,
  onQuickResponse,
  isWatching,
  onUpdate
}: RequestCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    title,
    min_budget,
    max_budget,
    urgency,
    created_at,
    images
  } = request;

  const handleIHaveThisClick = () => {
    if (!user) {
      const returnUrl = `/requests?highlight=${request.id}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      toast.error('Please sign in to respond to requests');
      return;
    }
    onQuickResponse?.(request);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      {/* Cover Image with Quick View Button */}
      <div className="relative group">
        {images && images.length > 0 ? (
          <div className="aspect-[16/9] relative overflow-hidden">
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Quick View Button */}
            <button
              onClick={() => onQuickView?.(request)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        ) : (
          <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center relative">
            <p className="text-gray-400 text-sm">No image</p>
            {/* Quick View Button */}
            <button
              onClick={() => onQuickView?.(request)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Header with Urgency Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${urgencyColors[urgency]}`}>
            {urgencyIcons[urgency]}
            {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
          </div>
          <button
            onClick={() => onWatch?.(request)}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isWatching 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

        {/* Budget Range */}
        {(min_budget || max_budget) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Tag className="h-4 w-4" />
            <span>
              Budget: {min_budget ? `₹${min_budget}` : ''}
              {min_budget && max_budget ? ' - ' : ''}
              {max_budget ? `₹${max_budget}` : ''}
            </span>
          </div>
        )}

        {/* Posted Time */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4" />
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={handleIHaveThisClick}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <CheckCircle className="h-4 w-4" />
            I Have This!
          </button>
          <button
            onClick={() => onMatch?.(request)}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <MessageCircle className="h-4 w-4" />
            Respond
          </button>
        </div>
      </div>

      {/* Quick Response Dialog */}
      {user && (
        <QuickResponseDialog
          requestId={request.id}
          requestTitle={request.title}
          categoryId={request.category_id}
        />
      )}
    </motion.div>
  );
} 