import React from 'react';
import { motion } from 'framer-motion';
import { ItemFormData } from '../../pages/NewItem';

type Props = {
  data: ItemFormData;
  onUpdate: (data: Partial<ItemFormData>) => void;
};

export default function PricingCondition({ data, onUpdate }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (₹)
        </label>
        <input
          type="number"
          id="price"
          min="0"
          value={data.price}
          onChange={(e) => onUpdate({ price: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter price"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="negotiable"
          checked={data.isNegotiable}
          onChange={(e) => onUpdate({ isNegotiable: e.target.checked })}
          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
        />
        <label htmlFor="negotiable" className="ml-2 text-sm text-gray-700">
          Price is negotiable
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition
        </label>
        <div className="space-y-2">
          {['New', 'Like New', 'Used'].map((condition) => (
            <label key={condition} className="flex items-center">
              <input
                type="radio"
                name="condition"
                value={condition}
                checked={data.condition === condition}
                onChange={(e) => onUpdate({ condition: e.target.value as ItemFormData['condition'] })}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">{condition}</span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 