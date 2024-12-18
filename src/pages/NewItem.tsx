import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import BasicDetails from '../components/item-upload/BasicDetails';
import CategorySelection from '../components/item-upload/CategorySelection';
import PricingCondition from '../components/item-upload/PricingCondition';
import ImageUpload from '../components/item-upload/ImageUpload';
import HostelAddress from '../components/item-upload/HostelAddress';
import ItemSummary from '../components/item-upload/ItemSummary';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export type ItemFormData = {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  isNegotiable: boolean;
  condition: 'New' | 'Like New' | 'Used';
  images: File[];
  hostelName: string;
  roomNumber: string;
};

const steps = [
  { id: 1, title: 'Basic Details' },
  { id: 2, title: 'Category' },
  { id: 3, title: 'Pricing' },
  { id: 4, title: 'Images' },
  { id: 5, title: 'Location' },
  { id: 6, title: 'Review' },
];

export default function NewItem() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: 0,
    isNegotiable: false,
    condition: 'Used',
    images: [],
    hostelName: '',
    roomNumber: '',
  });

  const updateFormData = (data: Partial<ItemFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicDetails
            data={formData}
            onUpdate={updateFormData}
          />
        );
      case 2:
        return (
          <CategorySelection
            data={formData}
            onUpdate={updateFormData}
          />
        );
      case 3:
        return (
          <PricingCondition
            data={formData}
            onUpdate={updateFormData}
          />
        );
      case 4:
        return (
          <ImageUpload
            data={formData}
            onUpdate={updateFormData}
          />
        );
      case 5:
        return (
          <HostelAddress
            data={formData}
            onUpdate={updateFormData}
          />
        );
      case 6:
        return (
          <ItemSummary
            data={formData}
            onSubmit={handleSubmit}
            isUploading={isUploading}
          />
        );
    }
  };

  const uploadImage = async (file: File, retries = 3): Promise<string> => {
    try {
      const { user } = useAuthStore.getState();
      const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying upload, ${retries} attempts remaining`);
        return uploadImage(file, retries - 1);
      }
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('You must be logged in to post an item');

      setIsUploading(true);

      // Upload images first
      const imageUrls = await Promise.all(
        formData.images.map(file => uploadImage(file))
      );

      // Create the item
      const { error: itemError } = await supabase
        .from('items')
        .insert({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          condition: formData.condition,
          category_id: categories?.find(c => c.slug === formData.category)?.id,
          subcategory_id: categories?.find(c => c.slug === formData.category)?.subcategories.find(s => s.slug === formData.subcategory)?.id,
          images: imageUrls,
          uploader_id: user.id,
          hostel_name: formData.hostelName,
          room_number: formData.roomNumber,
          is_negotiable: formData.isNegotiable
        });

      if (itemError) throw itemError;

      // Success! Navigate to browse page
      navigate('/browse');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create item. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <motion.div
              key={step.id}
              className={`flex items-center ${
                step.id === currentStep ? 'text-indigo-600' : 'text-gray-500'
              }`}
              animate={{ scale: step.id === currentStep ? 1.1 : 1 }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.id === currentStep
                    ? 'bg-indigo-600 text-white'
                    : step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className="hidden sm:block ml-2 text-sm font-medium">
                {step.title}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <motion.div
            className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 1}
          className="flex items-center px-4 py-2 text-gray-600 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>
        {currentStep < steps.length ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        ) : null}
      </div>
    </div>
  );
}