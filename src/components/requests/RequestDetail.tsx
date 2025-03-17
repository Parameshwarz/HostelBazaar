import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  AlertTriangle, 
  ThumbsUp, 
  Tag, 
  User,
  Calendar,
  X,
  MessageCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { RequestItem, TradingItem } from '../../types/trade';
import SimilarItemsSection from './SimilarItemsSection';

interface RequestDetailProps {
  request: RequestItem;
  onClose: () => void;
  onMatch: (request: RequestItem) => void;
  onQuickResponse: (request: RequestItem) => void;
  onSelectSimilarItem?: (item: TradingItem, request: RequestItem) => void;
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

export default function RequestDetail({ 
  request, 
  onClose, 
  onMatch,
  onQuickResponse,
  onSelectSimilarItem
}: RequestDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? (request.images.length - 1) : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === request.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleSelectSimilarItem = (item: TradingItem) => {
    onSelectSimilarItem?.(item, request);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${urgencyColors[request.urgency]}`}>
              {urgencyIcons[request.urgency]}
              {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Images */}
            <div>
              {request.images && request.images.length > 0 ? (
                <div className="relative rounded-lg overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-100">
                    <img 
                      src={request.images[currentImageIndex]} 
                      alt={request.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {request.images.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 shadow-sm"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 shadow-sm"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-700" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {request.images.map((_, index) => (
                          <div 
                            key={index}
                            className={`h-1.5 rounded-full ${
                              index === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white bg-opacity-60'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">No images provided</p>
                </div>
              )}

              {/* Similar Items Section */}
              <SimilarItemsSection 
                request={request} 
                onSelectItem={handleSelectSimilarItem}
              />
            </div>

            {/* Right Column - Details */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{request.title}</h2>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  {request.profiles?.username || 'Anonymous'}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </div>
              </div>

              <p className="text-gray-700 mb-6">{request.description}</p>

              {/* Budget Range */}
              {(request.min_budget || request.max_budget) && (
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">
                    Budget: {request.min_budget ? `₹${request.min_budget}` : ''}
                    {request.min_budget && request.max_budget ? ' - ' : ''}
                    {request.max_budget ? `₹${request.max_budget}` : ''}
                  </span>
                </div>
              )}

              {/* Category */}
              {request.categories && (
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {request.categories.name}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm">
                    <span className="font-medium">{request.matches_count || 0}</span> matches
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">
                    <span className="font-medium">{formatDistanceToNow(new Date(request.created_at))}</span> ago
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => onQuickResponse(request)}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  I Have This!
                </button>
                <button
                  onClick={() => onMatch(request)}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Respond
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 