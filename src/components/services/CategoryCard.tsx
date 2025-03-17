import { motion } from 'framer-motion';
import { Folder, TrendingUp, TrendingDown } from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: React.ReactNode;
    total_services: number;
    growth_rate: number;
    trend: 'up' | 'down' | 'stable';
  };
  isSelected: boolean;
  onClick: () => void;
}

export default function CategoryCard({ category, isSelected, onClick }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-4 ${
        isSelected
          ? 'bg-indigo-600 text-white'
          : 'bg-white hover:bg-indigo-50'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${
          isSelected ? 'bg-white/10' : 'bg-indigo-50'
        }`}>
          {category.icon}
        </div>
        <h3 className={`font-medium ${
          isSelected ? 'text-white' : 'text-gray-900'
        }`}>
          {category.name}
        </h3>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`text-sm ${
          isSelected ? 'text-white/80' : 'text-gray-500'
        }`}>
          {category.total_services} services
        </span>
        <div className={`flex items-center gap-1 text-sm ${
          category.trend === 'up' 
            ? isSelected ? 'text-white' : 'text-emerald-600'
            : category.trend === 'down'
            ? isSelected ? 'text-white' : 'text-red-600'
            : isSelected ? 'text-white' : 'text-gray-600'
        }`}>
          {category.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
           category.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
           null}
          <span>{category.growth_rate}%</span>
        </div>
      </div>
    </motion.div>
  );
} 