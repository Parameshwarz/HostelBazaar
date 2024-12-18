import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

interface MessageReactionsProps {
  reactions: any[];
  isOwn: boolean;
  onReact: (messageId: string, emoji: string) => void;
}

const EMOJI_OPTIONS = ['❤️', '👍', '😂', '😢', '😮'];

export const MessageReactions = ({ reactions, onReact, isOwn }: MessageReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  // Group reactions by emoji and count them
  const reactionGroups = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = {
      count: (acc[reaction.emoji]?.count || 0) + 1,
      users: [...(acc[reaction.emoji]?.users || []), reaction.username]
    };
    return acc;
  }, {} as Record<string, { count: number; users: string[] }>);

  // Find user's current reaction if any
  const userReaction = reactions.find(r => r.user_id === user.id);

  return (
    <div className="relative group">
      <div className={`flex -space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {Object.entries(reactionGroups).map(([emoji, { count, users }]) => {
          const isUserReaction = userReaction?.emoji === emoji;
          
          return (
            <motion.button
              key={emoji}
              onClick={() => onReact(emoji)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center px-2 py-1 text-xs rounded-full hover:bg-gray-100 transition-colors ${
                isUserReaction 
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100'
              }`}
              title={`${emoji} - ${users.join(', ')} (${count})`}
            >
              {emoji}
            </motion.button>
          );
        })}
      </div>

      {/* Emoji Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`absolute ${isOwn ? 'left-0' : 'right-0'} bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-gray-100`}
      >
        <span className="text-gray-500 text-sm">😊</span>
      </button>

      {/* Emoji Picker Popup */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute bottom-8 ${isOwn ? 'left-0' : 'right-0'} bg-white shadow-lg rounded-lg p-2 z-50`}
          >
            <div className="flex gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    setShowPicker(false);
                  }}
                  className="hover:bg-gray-100 p-1 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
