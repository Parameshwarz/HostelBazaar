import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Search } from 'lucide-react';

interface Props {
  onReact: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_CATEGORIES = {
  recent: {
    name: 'Recently Used',
    emojis: ['👍', '❤️', '😊', '👏', '🎉', '🔥']
  },
  common: {
    name: 'Common',
    emojis: ['👍', '👎', '❤️', '😊', '😂', '😍', '🎉', '👏', '🔥', '💯', '✨', '🙌']
  },
  faces: {
    name: 'Faces',
    emojis: ['😊', '😂', '🤣', '😍', '🥰', '😘', '😅', '😉', '🙂', '🤔', '🤨', '😐']
  },
  gestures: {
    name: 'Gestures',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤝', '👊', '🤜', '🤛', '👋', '🙌', '👏']
  }
};

export const MessageReactions: React.FC<Props> = ({
  onReact,
  isOpen,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmojis = searchQuery
    ? Object.values(EMOJI_CATEGORIES)
        .flatMap(category => category.emojis)
        .filter((emoji, index, self) => self.indexOf(emoji) === index) // Remove duplicates
        .filter(emoji => emoji.includes(searchQuery))
    : EMOJI_CATEGORIES[selectedCategory].emojis;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-full mb-2 bg-white rounded-xl shadow-xl p-3 min-w-[280px] z-50 border border-gray-200/50"
          >
            {/* Search Bar */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emojis..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {!searchQuery && (
              <div className="flex gap-1 mb-2 pb-2 border-b border-gray-100 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                  <motion.button
                    key={key}
                    onClick={() => setSelectedCategory(key as keyof typeof EMOJI_CATEGORIES)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === key
                        ? 'bg-indigo-100 text-indigo-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-6 gap-1.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-1">
              {filteredEmojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    onClose();
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl flex items-center justify-center"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>

            {filteredEmojis.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No emojis found
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
