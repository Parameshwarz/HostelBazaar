import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, DoorClosed, MapPin, Info, Navigation, Home } from 'lucide-react';

type Props = {
  data: {
    hostelName: string;
    roomNumber: string;
  };
  onUpdate: (data: any) => void;
};

const POPULAR_HOSTELS = [
  "Boys Hostel Block A",
  "Boys Hostel Block B",
  "Girls Hostel Block A",
  "Girls Hostel Block B",
  "International Block",
  "PG Block"
];

export default function LocationDetails({ data, onUpdate }: Props) {
  const [isHostelFocused, setIsHostelFocused] = useState(false);
  const [isRoomFocused, setIsRoomFocused] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4 shadow-lg">
          <Navigation className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Where's Your Item Located?</h2>
        <p className="mt-2 text-gray-600">Help others find your item easily</p>
      </motion.div>

      <div className="space-y-6">
        {/* Location Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">
            {/* Hostel Name Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4 text-indigo-600" />
                Hostel Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.hostelName}
                  onChange={(e) => onUpdate({ ...data, hostelName: e.target.value })}
                  onFocus={() => setIsHostelFocused(true)}
                  onBlur={() => setIsHostelFocused(false)}
                  placeholder="Enter your hostel name"
                  className="block w-full px-4 py-3 text-lg border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <motion.div
                  initial={false}
                  animate={{
                    width: isHostelFocused || data.hostelName ? '100%' : '0%',
                    opacity: isHostelFocused || data.hostelName ? 1 : 0,
                  }}
                  className="absolute bottom-0 left-0 h-0.5 bg-indigo-600"
                />
              </div>

              {/* Quick Select Hostels */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_HOSTELS.map((hostel) => (
                    <button
                      key={hostel}
                      onClick={() => onUpdate({ ...data, hostelName: hostel })}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        data.hostelName === hostel
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      {hostel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Number Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Home className="h-4 w-4 text-indigo-600" />
                Room Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.roomNumber}
                  onChange={(e) => onUpdate({ ...data, roomNumber: e.target.value })}
                  onFocus={() => setIsRoomFocused(true)}
                  onBlur={() => setIsRoomFocused(false)}
                  placeholder="Enter your room number"
                  className="block w-full px-4 py-3 text-lg border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <motion.div
                  initial={false}
                  animate={{
                    width: isRoomFocused || data.roomNumber ? '100%' : '0%',
                    opacity: isRoomFocused || data.roomNumber ? 1 : 0,
                  }}
                  className="absolute bottom-0 left-0 h-0.5 bg-indigo-600"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100"
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Info className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-indigo-900 mb-2">Location Guidelines</h4>
              <ul className="space-y-2">
                {[
                  'Provide accurate hostel name for easy navigation',
                  'Include correct room number for precise location',
                  'Location details are only visible to confirmed buyers',
                  'Helps in smooth and quick item handover'
                ].map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-indigo-800/80"
                  >
                    <span className="text-indigo-500 mt-1">•</span>
                    {tip}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Info className="h-4 w-4" />
            Your location details are secure and only shared with confirmed buyers
          </p>
        </motion.div>
      </div>
    </div>
  );
} 