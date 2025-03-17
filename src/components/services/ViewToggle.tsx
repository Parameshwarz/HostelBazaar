import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Search } from 'lucide-react';

interface ViewToggleProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm p-1">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('services')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'services'
              ? 'bg-white text-indigo-600'
              : 'text-white/90 hover:text-white'
          }`}
        >
          Services
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('projects')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'projects'
              ? 'bg-white text-indigo-600'
              : 'text-white/90 hover:text-white'
          }`}
        >
          Projects
        </motion.button>
      </div>
    </div>
  );
} 