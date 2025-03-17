import React from 'react';
import { motion } from 'framer-motion';
import * as Slider from '@radix-ui/react-slider';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  histogram?: number[];
}

export default function PriceRangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  histogram = []
}: PriceRangeSliderProps) {
  // Normalize histogram values to percentages
  const maxHistValue = Math.max(...histogram);
  const normalizedHistogram = histogram.map(v => (v / maxHistValue) * 100);

  return (
    <div className="space-y-4">
      {/* Histogram */}
      {histogram.length > 0 && (
        <div className="h-12 flex items-end gap-0.5">
          {normalizedHistogram.map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              className="flex-1 bg-indigo-100 rounded-t"
            />
          ))}
        </div>
      )}

      {/* Slider */}
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={value}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        aria-label="Price Range"
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
          <Slider.Range className="absolute bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full h-full" />
        </Slider.Track>
        {value.map((_, i) => (
          <Slider.Thumb
            key={i}
            className="block w-5 h-5 bg-white border-2 border-indigo-500 rounded-full 
              hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 
              focus:ring-offset-2 transition-colors"
          />
        ))}
      </Slider.Root>
    </div>
  );
} 