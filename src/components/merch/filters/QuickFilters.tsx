import React from 'react';
import { TrendingUp, Zap, Trophy, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickFiltersProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function QuickFilters({ activeTab, onTabChange }: QuickFiltersProps) {
  const quickFilters = [
    { 
      id: 'trending', 
      label: 'Trending Now', 
      icon: TrendingUp,
      description: 'Most popular items'
    },
    { 
      id: 'new', 
      label: 'Just Dropped', 
      icon: Zap,
      description: 'Added this week'
    },
    { 
      id: 'premium', 
      label: 'Premium', 
      icon: Trophy,
      description: 'High-quality items'
    },
    { 
      id: 'deals', 
      label: 'Best Deals', 
      icon: Tag,
      description: 'Budget-friendly picks'
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {quickFilters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeTab === filter.id;
        
        return (
          <motion.button
            key={filter.id}
            onClick={() => onTabChange(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative group flex items-center gap-2 px-6 py-3 rounded-full transition-all
              ${isActive 
                ? 'bg-white text-violet-600 shadow-lg' 
                : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{filter.label}</span>
            
            {/* Tooltip */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-max opacity-0 group-hover:opacity-100
              bg-black/80 text-white text-sm px-3 py-1 rounded-lg transition-opacity">
              {filter.description}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
} 