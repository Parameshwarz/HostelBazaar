import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export default function PriceHistoryModal({ isOpen, onClose, category }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Price Trends & Analysis
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Price Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-emerald-900">Average Price</h3>
                        <p className="text-sm text-emerald-700">₹2,500</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-emerald-600">
                      +12% from last month
                    </div>
                  </div>

                  <div className="bg-teal-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-teal-900">Best Time to Buy</h3>
                        <p className="text-sm text-teal-700">End of Semester</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-teal-600">
                      20% lower prices on average
                    </div>
                  </div>

                  <div className="bg-cyan-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-cyan-900">Lowest Price</h3>
                        <p className="text-sm text-cyan-700">₹1,800</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-cyan-600">
                      Last seen 2 weeks ago
                    </div>
                  </div>
                </div>

                {/* Price Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
                  <div className="h-64 flex items-center justify-center">
                    {/* Add your chart component here */}
                    <p className="text-gray-500">Price trend chart will be displayed here</p>
                  </div>
                </div>

                {/* Price Distribution */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Price Distribution</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { range: '0-1000', count: 15 },
                      { range: '1000-2000', count: 25 },
                      { range: '2000-3000', count: 35 },
                      { range: '3000-4000', count: 20 },
                      { range: '4000+', count: 5 }
                    ].map((item) => (
                      <div key={item.range} className="text-center">
                        <div className="h-32 bg-gray-100 rounded-lg relative">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 to-teal-500 rounded-lg"
                            style={{ height: `${item.count}%` }}
                          />
                        </div>
                        <div className="mt-2 text-sm text-gray-600">{item.range}</div>
                        <div className="text-xs text-gray-500">{item.count}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Insights */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Market Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Price Factors</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Higher demand during start of semester</li>
                        <li>• Condition affects price by 30-40%</li>
                        <li>• Brand name items hold value better</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Best time to sell: Start of semester</li>
                        <li>• Best time to buy: End of semester</li>
                        <li>• Consider bulk buying for better deals</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 