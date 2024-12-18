import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Laptop, Sofa, Shirt, UtensilsCrossed, Trophy, MoreHorizontal, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCategories } from '../hooks/useCategories';

export default function Home() {
  const { user } = useAuthStore();
  const { categories } = useCategories();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <motion.div 
        className="py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-5xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Your Campus
          <motion.span 
            className="text-indigo-600 ml-3"
            animate={{ 
              scale: [1, 1.1, 1],
              color: ['#4F46E5', '#6366F1', '#4F46E5'] 
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            Marketplace
          </motion.span>
        </motion.h1>

        <motion.p 
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Buy, sell, and exchange items within your hostel community. Making student life easier, one trade at a time.
        </motion.p>

        <motion.div 
          className="flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {user ? (
            <Link
              to="/items/new"
              className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Post Your Ad
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Get Started
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Link>
          )}
          <Link
            to="/browse"
            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Browse Items
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Categories Section */}
      <motion.div 
        className="py-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2 
          className="text-2xl font-bold text-gray-900 mb-8"
          variants={itemVariants}
        >
          Browse Categories
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Books', icon: BookOpen },
            { name: 'Electronics', icon: Laptop },
            { name: 'Furniture', icon: Sofa },
            { name: 'Clothing', icon: Shirt },
            { name: 'Kitchen', icon: UtensilsCrossed },
            { name: 'Sports', icon: Trophy },
            { name: 'Other', icon: MoreHorizontal },
          ].map((category) => (
            <motion.div
              key={category.name}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={`/?category=${category.name}`}
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <category.icon className="h-8 w-8 text-indigo-600 mb-3" />
                <span className="text-gray-900 font-medium">{category.name}</span>
                <span className="text-sm text-gray-500 mt-1">
                  {categories?.find(c => c.name === category.name)?.item_count || 0} items
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Featured Items Section */}
      <motion.div 
        className="py-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            className="text-2xl font-bold text-gray-900"
            variants={itemVariants}
          >
            Featured Items
          </motion.h2>
          <motion.div variants={itemVariants}>
            <Link
              to="/items"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </motion.div>
        </div>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {/* ItemCard components will be rendered here */}
        </motion.div>
      </motion.div>
    </div>
  );
}