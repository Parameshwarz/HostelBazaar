import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface TrendingTopic {
  id: string;
  name: string;
  growth: number;
  icon: string;
}

interface TrendingTopicsProps {
  showTrendingTopics: boolean;
  setShowTrendingTopics: (show: boolean) => void;
  trendingTopics: TrendingTopic[];
  selectedTrend: string | null;
  handleTrendingTopicClick: (topic: TrendingTopic) => void;
}

export default function TrendingTopics({ 
  showTrendingTopics, 
  setShowTrendingTopics,
  trendingTopics,
  selectedTrend,
  handleTrendingTopicClick
}: TrendingTopicsProps) {
  return (
    <AnimatePresence>
      {showTrendingTopics && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-8 relative overflow-hidden"
        >
          {/* Add animated background pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 animate-pulse" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900">Trending in Services</h3>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  Live Updates
                </span>
              </div>
              <button
                onClick={() => setShowTrendingTopics(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendingTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  onClick={() => handleTrendingTopicClick(topic)}
                  className={`cursor-pointer rounded-xl p-4 ${
                    selectedTrend === topic.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white hover:bg-indigo-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-2">{topic.icon}</div>
                  <h4 className={`font-medium ${
                    selectedTrend === topic.id ? 'text-white' : 'text-gray-900'
                  }`}>
                    {topic.name}
                  </h4>
                  <div className={`text-sm flex items-center gap-1 ${
                    selectedTrend === topic.id ? 'text-indigo-100' : 'text-emerald-600'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {topic.growth}% growth
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 