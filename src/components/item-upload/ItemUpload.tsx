import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Eye, EyeOff, User, MapPin, Tag, Info, AlertCircle, Book, IndianRupee } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import ReviewListing from './ReviewListing';

const ItemUpload = () => {
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    price: '',
    condition: '',
    hostelName: '',
    roomNumber: '',
    category: '',
    images: []
  });

  const handleFinalSubmit = () => {
    // Handle final submission
  };

  return (
    <div>
      {/* ... existing content ... */}

      {currentStep === 6 && (
        <ReviewListing
          data={uploadData}
          onSubmit={handleFinalSubmit}
        />
      )}
    </div>
  );
};

export default ItemUpload; 