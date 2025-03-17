import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Maximize2, MinusCircle, PlusCircle, Tape, User } from 'lucide-react';

interface SizeChartProps {
  category: string;
  onClose: () => void;
}

interface Measurement {
  size: string;
  chest: number;
  waist: number;
  hips: number;
  length: number;
  shoulders?: number;
  sleeve?: number;
}

interface SizeGuide {
  category: string;
  measurements: Measurement[];
  fitTips: string[];
  measurementGuide: {
    title: string;
    description: string;
    icon: keyof typeof measurementIcons;
  }[];
}

export default function SizeChart({ category, onClose }: SizeChartProps) {
  const [unit, setUnit] = useState<'cm' | 'inches'>('inches');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const measurementIcons = {
    chest: Maximize2,
    waist: Ruler,
    hips: Tape,
    length: User,
  };

  const sizeGuides: Record<string, SizeGuide> = {
    tshirt: {
      category: 'T-Shirts',
      measurements: [
        { size: 'S', chest: 36, waist: 30, hips: 36, length: 27, shoulders: 16, sleeve: 8 },
        { size: 'M', chest: 38, waist: 32, hips: 38, length: 28, shoulders: 17, sleeve: 8.5 },
        { size: 'L', chest: 40, waist: 34, hips: 40, length: 29, shoulders: 18, sleeve: 9 },
        { size: 'XL', chest: 42, waist: 36, hips: 42, length: 30, shoulders: 19, sleeve: 9.5 },
        { size: 'XXL', chest: 44, waist: 38, hips: 44, length: 31, shoulders: 20, sleeve: 10 },
      ],
      fitTips: [
        'Regular fit, true to size',
        'Model is 6\'0" and wearing size M',
        'Pre-washed fabric to prevent shrinkage',
        'Stretch cotton for comfort',
      ],
      measurementGuide: [
        {
          title: 'Chest',
          description: 'Measure around the fullest part of your chest, keeping the tape horizontal',
          icon: 'chest',
        },
        {
          title: 'Waist',
          description: 'Measure around your natural waistline, keeping the tape comfortably loose',
          icon: 'waist',
        },
        {
          title: 'Length',
          description: 'Measure from the highest point of the shoulder to the bottom hem',
          icon: 'length',
        },
      ],
    },
    // Add more categories as needed
  };

  const guide = sizeGuides[category] || sizeGuides.tshirt;
  const convertMeasurement = (value: number) => unit === 'cm' ? (value * 2.54).toFixed(1) : value;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Ruler className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{guide.category} Size Guide</h3>
              <p className="text-gray-600">Find your perfect fit</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 rounded-lg text-sm ${
                unit === 'inches' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-lg text-sm ${
                unit === 'cm' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              cm
            </button>
          </div>
        </div>

        {/* Size Chart Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Size</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Chest</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Waist</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Hips</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Length</th>
                {guide.measurements[0].shoulders && (
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Shoulders</th>
                )}
                {guide.measurements[0].sleeve && (
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Sleeve</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {guide.measurements.map((measurement) => (
                <motion.tr
                  key={measurement.size}
                  className={`cursor-pointer ${
                    selectedSize === measurement.size ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSize(measurement.size)}
                  whileHover={{ scale: 1.01 }}
                >
                  <td className="px-4 py-3 font-medium">{measurement.size}</td>
                  <td className="px-4 py-3">{convertMeasurement(measurement.chest)}</td>
                  <td className="px-4 py-3">{convertMeasurement(measurement.waist)}</td>
                  <td className="px-4 py-3">{convertMeasurement(measurement.hips)}</td>
                  <td className="px-4 py-3">{convertMeasurement(measurement.length)}</td>
                  {measurement.shoulders && (
                    <td className="px-4 py-3">{convertMeasurement(measurement.shoulders)}</td>
                  )}
                  {measurement.sleeve && (
                    <td className="px-4 py-3">{convertMeasurement(measurement.sleeve)}</td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fit Tips */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Fit Tips</h4>
          <ul className="space-y-2">
            {guide.fitTips.map((tip, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Measurement Guide */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">How to Measure</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guide.measurementGuide.map((guide) => {
              const Icon = measurementIcons[guide.icon];
              return (
                <div key={guide.title} className="flex gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg h-fit">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">{guide.title}</h5>
                    <p className="text-sm text-gray-600">{guide.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Size Recommendation */}
        {selectedSize && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-50 rounded-lg"
          >
            <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
              <User className="w-5 h-5" />
              Size Recommendation
            </div>
            <p className="text-sm text-gray-600">
              Based on average customer feedback, size {selectedSize} typically fits a 
              {selectedSize === 'S' && ' 34-36" chest and 28-30" waist'}
              {selectedSize === 'M' && ' 36-38" chest and 30-32" waist'}
              {selectedSize === 'L' && ' 38-40" chest and 32-34" waist'}
              {selectedSize === 'XL' && ' 40-42" chest and 34-36" waist'}
              {selectedSize === 'XXL' && ' 42-44" chest and 36-38" waist'}.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 