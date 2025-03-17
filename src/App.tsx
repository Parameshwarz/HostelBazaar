import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore } from './store/themeStore';
import AISupport from './components/AISupport';
import PriceTracker from './components/PriceTracker';
import SocialProof from './components/SocialProof';
import VoiceSearch from './components/VoiceSearch';
import SmartRecommendations from './components/SmartRecommendations';

export default function App() {
  const location = useLocation();
  const { isDarkMode } = useThemeStore();

  // Apply dark mode class to html element
  React.useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-gray-900 dark:text-dark-text-primary"
        >
          <main className="flex-1">
            <Outlet />
          </main>
        </motion.div>
      </AnimatePresence>
      <Footer />
      <AISupport />
      <PriceTracker />
      <SocialProof />
      <VoiceSearch />
      <SmartRecommendations />
    </div>
  );
}