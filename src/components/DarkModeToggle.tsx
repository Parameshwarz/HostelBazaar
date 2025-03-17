import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleDarkMode}
      className={`p-2.5 rounded-full transition-all duration-300 ${
        isDarkMode 
          ? 'bg-dark-bg-tertiary text-yellow-400 hover:bg-dark-bg-tertiary/80' 
          : 'bg-gray-100 text-primary-600 hover:bg-gray-200'
      }`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDarkMode ? 180 : 0,
          scale: [1, 0.9, 1]
        }}
        transition={{ 
          duration: 0.3,
          ease: 'easeInOut'
        }}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
} 