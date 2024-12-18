import React from 'react';
import { motion } from 'framer-motion';
import { ItemFormData } from '../../pages/NewItem';

type Props = {
  data: ItemFormData;
  onUpdate: (data: Partial<ItemFormData>) => void;
};

export default function HostelAddress({ data, onUpdate }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="hostelName" className="block text-sm font-medium text-gray-700">
          Hostel Name
        </label>
        <input
          type="text"
          id="hostelName"
          value={data.hostelName}
          onChange={(e) => onUpdate({ hostelName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter your hostel name"
        />
      </div>

      <div>
        <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
          Room Number
        </label>
        <input
          type="text"
          id="roomNumber"
          value={data.roomNumber}
          onChange={(e) => onUpdate({ roomNumber: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter your room number"
        />
      </div>
    </motion.div>
  );
} 