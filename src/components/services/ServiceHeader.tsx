import { motion } from 'framer-motion';
import { Search, SearchIcon } from 'lucide-react';
import ViewToggle from './ViewToggle';

interface ServiceHeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  services: any[];
  projects: any[];
}

export default function ServiceHeader({ 
  activeView, 
  setActiveView, 
  searchQuery, 
  setSearchQuery,
  services,
  projects
}: ServiceHeaderProps) {
  return (
    <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        {/* Animated Shapes */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {activeView === 'services' 
              ? 'Discover Exceptional Services'
              : 'Find Exciting Projects'}
          </h1>
          <p className="text-xl text-white/90 mb-8">
            {activeView === 'services'
              ? 'Connect with talented professionals and find the perfect service for your needs'
              : 'Browse through projects and find opportunities that match your skills'}
          </p>

          {/* View Toggle */}
          <ViewToggle
            activeView={activeView}
            onViewChange={setActiveView}
          />
          
          {/* Enhanced Search Bar */}
          <div className="relative mt-8">
            <input
              type="text"
              placeholder={activeView === 'services' 
                ? "Search for services..."
                : "Search for projects..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg"
            />
            <SearchIcon className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 h-6 w-6" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">
                {activeView === 'services' ? services.length : projects.length}+
              </div>
              <div className="text-white/80">
                {activeView === 'services' ? 'Active Services' : 'Open Projects'}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">10</div>
              <div className="text-white/80">Categories</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">Support Available</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 