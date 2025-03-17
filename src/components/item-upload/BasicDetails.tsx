import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, AlignLeft, HelpCircle } from 'lucide-react';

type Props = {
  data: {
    title: string;
    description: string;
  };
  onUpdate: (data: any) => void;
};

export default function BasicDetails({ data, onUpdate }: Props) {
  const MAX_DESCRIPTION_LENGTH = 500;
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  const remainingChars = MAX_DESCRIPTION_LENGTH - data.description.length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Title Input Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Type className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-medium text-gray-900">Title</h3>
        </div>

        <div className="relative">
          <input
            type="text"
            value={data.title}
            onChange={(e) => onUpdate({ ...data, title: e.target.value })}
            onFocus={() => setIsTitleFocused(true)}
            onBlur={() => setIsTitleFocused(false)}
            placeholder="e.g., Dell XPS 15 Laptop"
            className="block w-full px-4 py-3 text-lg border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <motion.div
            initial={false}
            animate={{
              width: isTitleFocused || data.title ? '100%' : '0%',
              opacity: isTitleFocused || data.title ? 1 : 0,
            }}
            className="absolute bottom-0 left-0 h-0.5 bg-indigo-600"
          />
        </div>
        
        {/* Title Helper Text */}
        <p className="mt-2 text-sm text-gray-500">
          Make it clear and catchy. Include key details like brand and model.
        </p>
      </div>

      {/* Description Input Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlignLeft className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
          </div>
          
          {/* Character Count */}
          <span 
            className={`text-sm ${
              remainingChars < 50 
                ? 'text-red-500' 
                : remainingChars < 100 
                  ? 'text-yellow-500' 
                  : 'text-gray-500'
            }`}
          >
            {remainingChars} characters remaining
          </span>
        </div>

        <div className="relative">
          <textarea
            value={data.description}
            onChange={(e) => {
              if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                onUpdate({ ...data, description: e.target.value });
              }
            }}
            onFocus={() => setIsDescriptionFocused(true)}
            onBlur={() => setIsDescriptionFocused(false)}
            placeholder="Describe your item in detail..."
            rows={6}
            className="block w-full px-4 py-3 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
          />
          <motion.div
            initial={false}
            animate={{
              width: isDescriptionFocused || data.description ? '100%' : '0%',
              opacity: isDescriptionFocused || data.description ? 1 : 0,
            }}
            className="absolute bottom-0 left-0 h-0.5 bg-indigo-600"
          />
        </div>

        {/* Description Helper Text */}
        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Tips for a great description:</p>
              <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                <li>Include the condition and age of the item</li>
                <li>Mention any defects or issues</li>
                <li>List important features and specifications</li>
                <li>Add any other relevant details buyers should know</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 