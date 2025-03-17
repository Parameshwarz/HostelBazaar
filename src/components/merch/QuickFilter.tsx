import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '../ui/slider';

export default function QuickFilter() {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  return (
    <motion.div 
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      className="bg-white rounded-lg shadow-lg p-6 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Price Range */}
        <div>
          <h4 className="text-sm font-medium mb-3">Price Range</h4>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={1000}
            step={10}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>

        {/* Size Bubbles */}
        <div>
          <h4 className="text-sm font-medium mb-3">Size</h4>
          <div className="flex flex-wrap gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <button
                key={size}
                className="w-10 h-10 rounded-full border-2 border-violet-200 hover:border-violet-600
                flex items-center justify-center text-sm font-medium transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <h4 className="text-sm font-medium mb-3">Colors</h4>
          <div className="flex flex-wrap gap-2">
            {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 