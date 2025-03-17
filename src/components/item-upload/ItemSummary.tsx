import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ItemFormData } from '../../pages/NewItem';
import { Loader2 as Loader, ClipboardCheck, User, Tag, AlertCircle } from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCategories } from '../../hooks/useCategories';

export type Props = {
  data: {
    title: string;
    description: string;
    price: number;
    condition: string;
    category: string;
    category_id?: string;
    subcategory: string;
    subcategory_id?: string;
    images: File[];
    isAnonymous?: boolean;
    isNegotiable?: boolean;
    item_type: 'sell' | 'rent' | 'donate';
    urgency?: 'urgent' | 'moderate' | 'flexible';
  };
  onSubmit?: () => void;
  isUploading?: boolean;
};

export default function ItemSummary({ data, onSubmit, isUploading }: Props) {
  const { user } = useAuthStore();
  const { categories } = useCategories();
  const [showSellerName, setShowSellerName] = useState(true);
  const [isAgreed, setIsAgreed] = useState(false);

  const getCategoryName = () => {
    const category = categories.find(cat => cat.id === data.category_id);
    const subcategory = category?.subcategories?.find(sub => sub.id === data.subcategory_id);
    return subcategory ? `${category?.name} › ${subcategory.name}` : category?.name || '';
  };

  const handleSubmit = async () => {
    if (!isAgreed) {
      toast.error('Please agree to the community guidelines');
      return;
    }

    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      onSubmit && onSubmit();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit item');
    }
  };

  const isFormValid = () => {
    const valid = (
      data.title?.trim() &&
      data.description?.trim() &&
      data.price >= 0 &&
      data.category &&
      data.subcategory &&
      data.condition &&
      data.images?.length > 0
    );

    return valid;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
          <ClipboardCheck className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Review Your Listing</h2>
        <p className="mt-2 text-gray-600">Make sure everything looks good before publishing</p>
      </motion.div>

      {/* Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6"
      >
        {/* Image Preview */}
        <div className="aspect-video bg-gray-100 relative">
          {data.images && data.images.length > 0 ? (
            <img
              src={URL.createObjectURL(data.images[0])}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No images uploaded</p>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
            <p className="text-white text-sm">{data.images?.length || 0} photos</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{data.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Tag className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm text-gray-600">{getCategoryName()}</span>
                </div>
                {/* Seller Preview */}
                <div className="flex items-center gap-2 mt-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    Listed by: {showSellerName ? user?.username : 'Anonymous'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₹{data.price}</p>
                {data.isNegotiable && <p className="text-sm text-gray-500">Negotiable</p>}
              </div>
            </div>
            <p className="text-gray-700">{data.description}</p>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Listing Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Listing Settings</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Show my name on listing</span>
              </div>
              <Switch
                checked={showSellerName}
                onCheckedChange={setShowSellerName}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Terms Agreement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-gray-600">
            I confirm that my listing follows the community guidelines and I have provided accurate information
          </span>
        </label>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleSubmit}
          disabled={isUploading || !isAgreed}
          className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-all ${
            isUploading || !isAgreed
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              Uploading...
            </div>
          ) : (
            'Publish Listing'
          )}
        </button>
      </motion.div>

      {/* Guidelines */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4"
      >
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-amber-800 font-medium">Important Notes:</p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Your listing will be visible to all users in your campus</li>
              <li>• Your contact details will be shared with serious buyers</li>
              <li>• You can edit or remove your listing at any time</li>
              <li>• Keep communication within the platform for safety</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 