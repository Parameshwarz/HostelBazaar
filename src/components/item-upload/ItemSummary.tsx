import React from 'react';
import { motion } from 'framer-motion';
import { ItemFormData } from '../../pages/NewItem';
import { Loader2 as Loader } from 'lucide-react';

type Props = {
  data: ItemFormData;
  onSubmit: () => void;
  isUploading?: boolean;
};

export default function ItemSummary({ data, onSubmit, isUploading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h3 className="text-lg font-medium text-gray-900">Review Your Item</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <h4 className="font-medium text-gray-700">Title</h4>
          <p>{data.title}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700">Description</h4>
          <p>{data.description}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700">Price</h4>
          <p>₹{data.price} {data.isNegotiable && '(Negotiable)'}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700">Condition</h4>
          <p>{data.condition}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700">Location</h4>
          <p>{data.hostelName}, Room {data.roomNumber}</p>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isUploading}
        className={`w-full px-4 py-2 bg-indigo-600 text-white rounded-lg 
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <Loader className="w-5 h-5 animate-spin mr-2" />
            Uploading...
          </div>
        ) : (
          'Submit Listing'
        )}
      </button>
    </motion.div>
  );
} 