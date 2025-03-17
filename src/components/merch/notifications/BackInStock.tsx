import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../../types/merch';

interface BackInStockProps {
  product: Product;
  selectedSize?: string;
  onNotificationSet: () => void;
}

export default function BackInStock({ product, selectedSize, onNotificationSet }: BackInStockProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      onNotificationSet();
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Bell className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Back in Stock Alert</h3>
            <p className="text-gray-600">
              Get notified when {product.title} {selectedSize ? `in size ${selectedSize}` : ''} is back
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2
                      focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                {error && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <p>You'll receive a one-time email when this item is back in stock.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg
                  hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Notify Me'
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">You're all set!</h4>
              <p className="text-gray-600">
                We'll email you at {email} when this item is back in stock.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 