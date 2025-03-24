import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Browse from './pages/Browse';
import { Messages } from './pages/Messages';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetails from './pages/ItemDetails';
import Profile from './pages/Profile';
import NewItem from './pages/NewItem';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import MerchPage from './pages/Merch';
import MerchDetail from './pages/MerchDetail';
import ServicesPage from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import ServiceOffer from './pages/ServiceOffer';
import PostProject from './pages/PostProject';
import ProjectDetails from './pages/ProjectDetails';
import ServicesDashboard from './pages/ServicesDashboard';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { useAuthStore } from './store/authStore';
import Trade from './pages/Trade';
import Requests from './pages/Requests';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore } from './store/themeStore';
import AISupport from './components/AISupport';
import PriceTracker from './components/PriceTracker';
import SocialProof from './components/SocialProof';
import VoiceSearch from './components/VoiceSearch';
import SmartRecommendations from './components/SmartRecommendations';
import BrowseMerch from './pages/BrowseMerch';
import StyleFeedPage from './pages/StyleFeed';
import Matches from './pages/Matches';
import { initAuth } from './store/initAuth';
import TestNotificationPage from './pages/TestNotification';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Separate component for content that needs Router context
function AppContent() {
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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:chatId" element={<Messages />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/items/:id" element={<ItemDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/items/new" element={<NewItem />} />
              <Route path="/merch" element={<MerchPage />} />
              <Route path="/browse-merch" element={<BrowseMerch />} />
              <Route path="/merch/:id" element={<MerchDetail />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/offer" element={<ServiceOffer />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/services/post-project" element={<PostProject />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/services/dashboard" element={<ServicesDashboard />} />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/:id" 
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/matches" 
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                } 
              />
              <Route path="/trade" element={<Trade />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/style-feed" element={<StyleFeedPage />} />
              <Route path="/test-notifications" element={<TestNotificationPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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

export default function App() {
  // Initialize auth when app loads
  useEffect(() => {
    const subscription = initAuth();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}