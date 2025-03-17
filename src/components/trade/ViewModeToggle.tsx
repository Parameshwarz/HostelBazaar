import React from 'react';
import { motion } from 'framer-motion';
import { Grid, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange('grid')}
        className={`p-2 rounded ${
          mode === 'grid'
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label="Grid view"
      >
        <Grid className="w-4 h-4" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange('list')}
        className={`p-2 rounded ${
          mode === 'list'
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </motion.button>
    </div>
  );
} 