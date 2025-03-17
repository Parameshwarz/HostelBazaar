import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Wand2, Bot, Book, ShoppingBag } from 'lucide-react';
import { Product } from '../../../types/merch';

interface SmartRecommendationsProps {
  product: Product;
  similarProducts: Product[];
  onProductClick: (productId: string) => void;
}

export default function SmartRecommendations({
  product,
  similarProducts,
  onProductClick,
}: SmartRecommendationsProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    chest: '',
    waist: '',
  });

  const recommendedSize = () => {
    // Implement size recommendation logic based on measurements
    return 'M';
  };

  return (
    <div className="space-y-8">
      {/* Smart Size Recommendations */}
      <div className="bg-violet-50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-violet-100 rounded-lg">
            <Ruler className="w-6 h-6 text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Smart Size Guide</h3>
            <p className="text-gray-600 mb-4">
              Get personalized size recommendations based on your measurements
            </p>
            <button
              onClick={() => setShowSizeGuide(true)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700
                transition-colors inline-flex items-center gap-2"
            >
              <Wand2 className="w-5 h-5" />
              Find My Size
            </button>
          </div>
        </div>
      </div>

      {/* Complete the Look */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Complete the Look</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {similarProducts.slice(0, 3).map(item => (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className="cursor-pointer"
              onClick={() => onProductClick(item.id)}
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-2">
                <img
                  src={item.product_images?.[0]?.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-sm font-medium">{item.title}</h4>
              <p className="text-sm text-violet-600">₹{item.price}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Virtual Shopping Assistant */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Virtual Shopping Assistant</h3>
            <p className="text-white/80 mb-4">
              Get personalized styling advice and outfit recommendations
            </p>
            <button
              onClick={() => setShowAssistant(true)}
              className="px-4 py-2 bg-white text-violet-600 rounded-lg hover:bg-white/90
                transition-colors inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping Session
            </button>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Find Your Perfect Size</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={measurements.height}
                      onChange={e => setMeasurements(prev => ({
                        ...prev,
                        height: e.target.value
                      }))}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-violet-500
                        focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={measurements.weight}
                      onChange={e => setMeasurements(prev => ({
                        ...prev,
                        weight: e.target.value
                      }))}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-violet-500
                        focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chest (cm)
                    </label>
                    <input
                      type="number"
                      value={measurements.chest}
                      onChange={e => setMeasurements(prev => ({
                        ...prev,
                        chest: e.target.value
                      }))}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-violet-500
                        focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waist (cm)
                    </label>
                    <input
                      type="number"
                      value={measurements.waist}
                      onChange={e => setMeasurements(prev => ({
                        ...prev,
                        waist: e.target.value
                      }))}
                      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-violet-500
                        focus:border-violet-500"
                    />
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Recommended Size</p>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full
                    bg-violet-100 text-violet-600 text-xl font-bold">
                    {recommendedSize()}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping Assistant Modal */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowAssistant(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 h-full flex flex-col">
                <h3 className="text-xl font-bold mb-4">Virtual Shopping Assistant</h3>
                <div className="flex-1 overflow-y-auto">
                  {/* Add chat interface here */}
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask me anything about campus fashion..."
                      className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-violet-500
                        focus:border-violet-500"
                    />
                    <button
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700
                        transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 