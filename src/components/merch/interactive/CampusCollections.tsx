import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, GraduationCap, Users, Trophy } from 'lucide-react';
import { Product } from '../../../types/merch';

interface CampusCollectionsProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

interface Collection {
  id: string;
  name: string;
  type: 'college' | 'department' | 'sports';
  icon: React.ReactNode;
  products: Product[];
}

export default function CampusCollections({ products, onProductClick }: CampusCollectionsProps) {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [activeTab, setActiveTab] = useState<'colleges' | 'departments' | 'sports'>('colleges');

  // Mock collections (in real app, this would come from backend)
  const collections: Collection[] = [
    {
      id: 'engineering',
      name: 'Engineering',
      type: 'department',
      icon: <GraduationCap className="w-6 h-6" />,
      products: products.filter(p => p.category === 'engineering')
    },
    {
      id: 'arts',
      name: 'Arts & Sciences',
      type: 'department',
      icon: <School className="w-6 h-6" />,
      products: products.filter(p => p.category === 'arts')
    },
    {
      id: 'sports',
      name: 'Sports Teams',
      type: 'sports',
      icon: <Trophy className="w-6 h-6" />,
      products: products.filter(p => p.category === 'sports')
    },
    // Add more collections as needed
  ];

  const filteredCollections = collections.filter(c => c.type === activeTab);

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Campus Collections</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections featuring merchandise from different colleges,
            departments, and sports teams.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('colleges')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'colleges'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Colleges
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'departments'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveTab('sports')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sports'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sports
            </button>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCollections.map(collection => (
            <motion.div
              key={collection.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer"
              onClick={() => setSelectedCollection(collection)}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                {collection.products[0]?.product_images?.[0]?.image_url ? (
                  <img
                    src={collection.products[0].product_images[0].image_url}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    {collection.icon}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{collection.name}</h3>
                  <p className="text-white/80 text-sm">
                    {collection.products.length} Products
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Collection Modal */}
        <AnimatePresence>
          {selectedCollection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
              onClick={() => setSelectedCollection(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-8">
                    {selectedCollection.icon}
                    <h2 className="text-2xl font-bold">{selectedCollection.name}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {selectedCollection.products.map(product => (
                      <motion.div
                        key={product.id}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                        onClick={() => onProductClick(product.id)}
                      >
                        <div className="aspect-square">
                          <img
                            src={product.product_images?.[0]?.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium mb-1">{product.title}</h3>
                          <p className="text-violet-600">₹{product.price}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 