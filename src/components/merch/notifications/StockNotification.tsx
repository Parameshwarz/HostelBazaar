import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Mail,
  Phone,
  Check,
  X,
  AlertCircle,
  BellRing,
} from 'lucide-react';
import { Product } from '../../../types/merch';

interface StockNotificationProps {
  product: Product;
  onClose: () => void;
}

interface NotificationPreference {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export default function StockNotification({ product, onClose }: StockNotificationProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState<NotificationPreference>({
    email: true,
    sms: false,
    push: false,
  });
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      setError('Please provide either email or phone number');
      return;
    }

    if (!selectedSize) {
      setError('Please select a size');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Here you would integrate with your notification service
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      // After 3 seconds, close the modal
      setTimeout(onClose, 3000);
    } catch (err) {
      setError('Failed to set up notification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Back in Stock Alert</h3>
              <p className="text-gray-600">Get notified when this item is available</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-20 h-20 bg-white rounded-lg overflow-hidden">
                {product.product_images?.[0]?.image_url && (
                  <img
                    src={product.product_images[0].image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h4 className="font-medium mb-1">{product.title}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  ₹{product.discount_price || product.price}
                </p>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        selectedSize === size
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2
                      focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2
                      focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Preferences
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.email}
                    onChange={(e) =>
                      setPreferences({ ...preferences, email: e.target.checked })
                    }
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Email notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.sms}
                    onChange={(e) =>
                      setPreferences({ ...preferences, sms: e.target.checked })
                    }
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">SMS notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.push}
                    onChange={(e) =>
                      setPreferences({ ...preferences, push: e.target.checked })
                    }
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Push notifications</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg
                hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent
                    rounded-full animate-spin" />
                  Setting Up Alert...
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" />
                  Notify Me
                </>
              )}
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
              justify-center mx-auto mb-4">
              <BellRing className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-lg font-medium mb-2">Alert Set Successfully!</h4>
            <p className="text-gray-600 mb-6">
              We'll notify you when {product.title} is back in stock in size {selectedSize}.
            </p>
            <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
              {preferences.email && <p>• Email notifications enabled</p>}
              {preferences.sms && <p>• SMS notifications enabled</p>}
              {preferences.push && <p>• Push notifications enabled</p>}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 