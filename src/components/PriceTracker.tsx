import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, TrendingUp, X, Bell, AlertCircle, ChevronDown } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PriceTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1W');
  const [priceAlerts, setPriceAlerts] = useState<Array<{ price: number; condition: 'above' | 'below' }>>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('below');

  // Sample data - replace with real data from your backend
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Average Price',
        data: [4500, 4300, 4800, 4600, 4900, 5100, 4800],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const handleAddAlert = () => {
    if (!alertPrice) return;
    setPriceAlerts(prev => [...prev, { price: Number(alertPrice), condition: alertCondition }]);
    setAlertPrice('');
    setShowAlertForm(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-4 bg-primary-600 dark:bg-primary-500 text-white 
        rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <LineChart className="w-6 h-6" />
      </motion.button>

      {/* Price Tracker Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 left-6 w-[32rem] bg-white dark:bg-dark-bg-secondary 
            rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200 
            dark:border-dark-bg-tertiary"
          >
            {/* Header */}
            <div className="p-4 bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                <span className="font-medium">Price Tracker</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chart Section */}
            <div className="p-4">
              {/* Timeframe Selector */}
              <div className="flex gap-2 mb-4">
                {['1D', '1W', '1M', '3M', 'ALL'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTimeframe === timeframe
                        ? 'bg-primary-600 dark:bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-bg-tertiary/80'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>

              {/* Price Chart */}
              <div className="bg-white dark:bg-dark-bg-tertiary rounded-xl p-4 mb-4">
                <Line data={chartData} options={chartOptions} />
              </div>

              {/* Price Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Current Avg', value: '₹4,800', change: '+6.7%' },
                  { label: 'Lowest', value: '₹4,300', time: '2 days ago' },
                  { label: 'Highest', value: '₹5,100', time: 'Yesterday' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl p-4"
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">{stat.change || stat.time}</div>
                  </div>
                ))}
              </div>

              {/* Price Alerts */}
              <div className="border-t border-gray-200 dark:border-dark-bg-tertiary pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Price Alerts</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAlertForm(true)}
                    className="flex items-center gap-1 text-primary-600 dark:text-primary-400"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Add Alert</span>
                  </motion.button>
                </div>

                {/* Alert Form */}
                <AnimatePresence>
                  {showAlertForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 dark:bg-dark-bg-tertiary rounded-xl p-4 mb-4">
                        <div className="flex gap-2 mb-2">
                          <select
                            value={alertCondition}
                            onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')}
                            className="bg-white dark:bg-dark-bg-secondary border border-gray-200 
                            dark:border-dark-bg-tertiary rounded-lg px-3 py-2 text-gray-900 
                            dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          >
                            <option value="below">Below</option>
                            <option value="above">Above</option>
                          </select>
                          <input
                            type="number"
                            value={alertPrice}
                            onChange={(e) => setAlertPrice(e.target.value)}
                            placeholder="Enter price..."
                            className="flex-1 bg-white dark:bg-dark-bg-secondary border border-gray-200 
                            dark:border-dark-bg-tertiary rounded-lg px-3 py-2 text-gray-900 
                            dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddAlert}
                            className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white 
                            rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600"
                          >
                            Add
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Alert List */}
                <div className="space-y-2">
                  {priceAlerts.map((alert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-gray-50 dark:bg-dark-bg-tertiary 
                      rounded-xl p-3"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="text-gray-900 dark:text-white">
                          Alert when price is {alert.condition} ₹{alert.price}
                        </span>
                      </div>
                      <button
                        onClick={() => setPriceAlerts(prev => prev.filter((_, i) => i !== index))}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 