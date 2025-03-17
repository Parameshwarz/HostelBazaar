import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CategoriesGrid } from '../components/CategoriesGrid';
import { useCategories } from '../hooks/useCategories';
import { Loader } from 'lucide-react';

export default function CategoriesPage() {
  const { categories, loading } = useCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Browse Categories
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find what you need across our diverse range of categories. 
              From textbooks to electronics, we've got everything for campus life.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <CategoriesGrid categories={categories} />
        )}
      </main>

      {/* Stats Section */}
      <section className="bg-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {categories.reduce((acc, cat) => acc + cat.item_count, 0)}
              </div>
              <div className="text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 