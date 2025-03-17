import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Product } from '../../types/merch';

interface SizeChartProps {
  product: Product | null;
  onClose: () => void;
}

const SizeChart: React.FC<SizeChartProps> = ({ product, onClose }) => {
  if (!product) return null;

  const sizeData = {
    'XS': { chest: '32-34 (81-86)', waist: '26-28 (66-71)', length: '26 (66)' },
    'S': { chest: '35-37 (89-94)', waist: '29-31 (74-79)', length: '27 (69)' },
    'M': { chest: '38-40 (97-102)', waist: '32-34 (81-86)', length: '28 (71)' },
    'L': { chest: '41-43 (104-109)', waist: '35-37 (89-94)', length: '29 (74)' },
    'XL': { chest: '44-46 (112-117)', waist: '38-40 (97-102)', length: '30 (76)' },
    '2XL': { chest: '47-49 (119-124)', waist: '41-43 (104-109)', length: '31 (79)' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="mb-6 text-2xl font-bold">Size Chart - {product.title}</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Size</th>
                <th className="border p-2">Chest (in/cm)</th>
                <th className="border p-2">Waist (in/cm)</th>
                <th className="border p-2">Length (in/cm)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sizeData).map(([size, measurements]) => (
                <tr key={size} className="hover:bg-gray-50">
                  <td className="border p-2 text-center font-medium">{size}</td>
                  <td className="border p-2 text-center">{measurements.chest}</td>
                  <td className="border p-2 text-center">{measurements.waist}</td>
                  <td className="border p-2 text-center">{measurements.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>* Measurements are shown in inches (centimeters)</p>
          <p>* These are general guidelines. Actual fit may vary by style and design.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SizeChart; 