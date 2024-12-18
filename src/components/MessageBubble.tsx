import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { Message } from '../types';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

interface Props {
  message: Message;
  isOwn: boolean;
  onReact: (emoji: string) => void;
}

export const MessageBubble = ({ message, isOwn, onReact }: Props) => {
  const [showReactButton, setShowReactButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const emojis = ['😍', '👍', '❤️', '😂', '😢', '😮'];

  // Group reactions and check user's current reaction
  const reactionGroups = message.message_reactions?.reduce((acc, reaction) => {
    const emoji = reaction.reaction_type;
    if (!acc[emoji]) {
      acc[emoji] = { 
        count: 0, 
        hasUserReacted: false,
        users: [] 
      };
    }
    acc[emoji].count++;
    acc[emoji].users.push(reaction.username || 'Unknown');
    if (reaction.user_id === user?.id) {
      acc[emoji].hasUserReacted = true;
    }
    return acc;
  }, {} as Record<string, { 
    count: number; 
    hasUserReacted: boolean;
    users: string[];
  }>) || {};

  // Function to check if emoji picker would overflow
  const getEmojiPickerPosition = () => {
    if (!messageRef.current) return isOwn ? 'left-0' : 'right-0';
    
    const messageWidth = messageRef.current.offsetWidth;
    const emojiPickerWidth = 280; // Approximate width of emoji picker
    const windowWidth = window.innerWidth;
    const messageRect = messageRef.current.getBoundingClientRect();

    // Check if emoji picker would overflow on the right
    if (!isOwn && messageRect.right + emojiPickerWidth > windowWidth) {
      return 'right-auto left-0';
    }
    
    // Check if emoji picker would overflow on the left
    if (isOwn && messageRect.left - emojiPickerWidth < 0) {
      return 'left-auto right-0';
    }

    return isOwn ? 'left-0' : 'right-0';
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.react-button')?.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update the React Button click handler
  const handleReactButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event from bubbling
    // Close any other open emoji pickers
    document.querySelectorAll('.emoji-picker').forEach(picker => {
      if (picker !== emojiPickerRef.current) {
        picker.classList.add('hidden');
      }
    });
    setShowEmojiPicker(true);
  };

  return (
    <div 
      className={`group relative flex ${isOwn ? 'justify-end' : 'justify-start'} mb-24`}
    >
      <div 
        className="relative inline-block"
        ref={messageRef}
        onMouseEnter={() => setShowReactButton(true)}
        onMouseLeave={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const isInReactButton = e.clientX >= rect.left - 48 &&
                                 e.clientX <= rect.right + 48 &&
                                 e.clientY >= rect.top &&
                                 e.clientY <= rect.bottom;
          if (!isInReactButton && !showEmojiPicker) {
            setShowReactButton(false);
          }
        }}
      >
        {/* Message Content */}
        <div 
          className={`px-4 py-2 rounded-lg relative 
            ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}
          style={{ maxWidth: '400px', minWidth: '100px' }}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* Time */}
          <div className={`text-xs mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>

          {/* Reactions Display - Closer to message */}
          {Object.keys(reactionGroups).length > 0 && (
            <div 
              className={`absolute -bottom-6 flex flex-wrap gap-1 z-10 
                ${isOwn ? 'right-0' : 'left-0'}`}
            >
              {Object.entries(reactionGroups).map(([emoji, { count, hasUserReacted, users }]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className={`flex items-center bg-white rounded-full px-2 py-0.5 
                    shadow-sm hover:bg-gray-50 transition-colors
                    ${hasUserReacted ? 'ring-2 ring-blue-400' : ''}`}
                  title={`${users.join(', ')}`}
                >
                  <span className="text-base">{emoji}</span>
                  {count > 1 && (
                    <span className="ml-1 text-xs text-gray-500">{count}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* React Button */}
        {showReactButton && !showEmojiPicker && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReactButtonClick}
            className={`react-button absolute top-1/2 -translate-y-1/2 p-2 bg-white rounded-full 
              shadow-md hover:bg-gray-50 transition-colors cursor-pointer
              ${isOwn ? '-left-12' : '-right-12'}`}
            onMouseEnter={() => setShowReactButton(true)}
          >
            <Smile className="w-4 h-4 text-gray-600" />
          </motion.button>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <motion.div
            ref={emojiPickerRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`emoji-picker absolute z-50 bg-white rounded-lg shadow-lg p-2 flex gap-1 -top-12
              ${isOwn ? 'right-0' : 'left-0'}`}
          >
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji);
                  setShowEmojiPicker(false);
                }}
                className="w-8 h-8 flex items-center justify-center text-lg
                  hover:bg-gray-100 rounded-full transition-colors"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};