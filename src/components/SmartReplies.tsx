import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  lastMessage: string;
  onReplySelect: (reply: string) => void;
  itemDetails?: {
    title: string;
    price: number;
    condition: string;
  };
}

export default function SmartReplies({ lastMessage, onReplySelect, itemDetails }: Props) {
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem('smartRepliesExpanded');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('smartRepliesExpanded', isExpanded.toString());
  }, [isExpanded]);

  // Function to generate contextual replies based on the last message
  const generateSmartReplies = (): string[] => {
    const lowercaseMessage = lastMessage.toLowerCase();
    
    // Price negotiation patterns
    if (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost') || lowercaseMessage.includes('₹')) {
      return [
        'Yes, that price works for me',
        'Could you go a bit lower?',
        'What\'s your best price?',
        'I\'ll think about it'
      ];
    }

    // Meeting arrangement patterns
    if (lowercaseMessage.includes('meet') || lowercaseMessage.includes('where') || lowercaseMessage.includes('location')) {
      return [
        'How about meeting at a public place?',
        'I\'m available tomorrow',
        'What time works best for you?',
        'Could you suggest a location?'
      ];
    }

    // Item condition queries
    if (lowercaseMessage.includes('condition') || lowercaseMessage.includes('quality')) {
      return [
        'The item is in great condition',
        'Would you like to see more photos?',
        'It\'s exactly as described in the listing',
        'I can show you in person'
      ];
    }

    // Availability checks
    if (lowercaseMessage.includes('available') || lowercaseMessage.includes('still')) {
      return [
        'Yes, it\'s still available',
        'When would you like to see it?',
        'I have other interested buyers',
        'It\'s on hold for you'
      ];
    }

    // Default responses
    return [
      'Thanks for your interest',
      'Could you provide more details?',
      'I\'ll get back to you soon',
      'Let me know if you have questions'
    ];
  };

  const smartReplies = generateSmartReplies();

  return (
    <div className="py-2 px-4 bg-white border-t">
      {/* Header with toggle button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 mb-2 hover:bg-gray-50 p-1 rounded transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-sm text-gray-600">Suggested Replies</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Animated content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2">
              {smartReplies.map((reply, index) => (
                <motion.button
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onReplySelect(reply)}
                  className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 
                    text-gray-700 rounded-full transition-colors whitespace-nowrap"
                >
                  {reply}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 