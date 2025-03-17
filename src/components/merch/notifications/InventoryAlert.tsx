import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Product } from '../../../types/merch';

interface InventoryAlertProps {
  product: Product;
  threshold?: number;
}

const InventoryAlert: React.FC<InventoryAlertProps> = ({ product, threshold = 5 }) => {
  if (!product.stock || product.stock > threshold) return null;

  const isVeryLow = product.stock <= Math.ceil(threshold / 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
        isVeryLow ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      <AlertTriangle size={16} className={isVeryLow ? 'text-red-500' : 'text-yellow-500'} />
      <span>
        {isVeryLow
          ? `Only ${product.stock} left in stock!`
          : `Low stock - ${product.stock} remaining`}
      </span>
    </motion.div>
  );
};

export default InventoryAlert; 