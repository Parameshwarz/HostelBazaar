import React from 'react';
import { X, Reply } from 'lucide-react';
import { Message } from '../types';
import { motion } from 'framer-motion';

interface Props {
  replyingTo: Message | null;
  onCancelReply: () => void;
}

export const ReplyPreview: React.FC<Props> = ({ replyingTo, onCancelReply }) => {
  if (!replyingTo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-2 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50 flex items-start justify-between shadow-sm"
    >
      <div className="flex items-start gap-2">
        <Reply className="w-4 h-4 text-gray-400 mt-1" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Replying to {replyingTo.sender?.username || 'message'}
          </div>
          <div className="text-sm text-gray-500 line-clamp-2 pr-4">
            {replyingTo.content}
          </div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onCancelReply}
        className="p-1 hover:bg-gray-200/80 rounded-full transition-colors"
      >
        <X className="w-4 h-4 text-gray-500" />
      </motion.button>
    </motion.div>
  );
}; 