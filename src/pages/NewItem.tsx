import React, { useState, useEffect } from 'react';
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
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { Subcategory } from '../types';

// Define component Props types
type StepProps = {
  data: ItemFormData;
  onUpdate: (data: Partial<ItemFormData>) => void;
  onSubmit?: () => void;
  isUploading?: boolean;
};

export type ItemFormData = {
  title: string;
  description: string;
  price: number;
  condition: string;
  isNegotiable: boolean;
  isAnonymous?: boolean;
  images: File[];
  category: string;
  category_id?: string;
  subcategory: string;
  subcategory_id?: string;
  item_type: 'sell' | 'rent' | 'donate';
  urgency?: 'urgent' | 'moderate' | 'flexible';
};

const steps = [
  {
    id: 1,
    title: 'Basic Details',
    component: BasicDetails as React.ComponentType<StepProps>
  },
  {
    id: 2,
    title: 'Category',
    component: CategorySelection as React.ComponentType<StepProps>
  },
  {
    id: 3,
    title: 'Images',
    component: ImageUpload as React.ComponentType<StepProps>
  },
  {
    id: 4,
    title: 'Pricing & Condition',
    component: PricingCondition as React.ComponentType<StepProps>
  },
  {
    id: 5,
    title: 'Review',
    component: ItemSummary as React.ComponentType<StepProps>
  }
];

export default function NewItem() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    price: 0,
    condition: 'Used',
    isNegotiable: false,
    images: [],
    category: '',
    subcategory: '',
    isAnonymous: false,
    item_type: 'sell',
    urgency: 'moderate'
  });

  // Check if user is authenticated
  useEffect(() => {
    const currentUser = user;
    if (!currentUser) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
  }, [user, navigate]);

  // Load subcategories when category is selected
  useEffect(() => {
    if (!formData.category) {
      setSubcategories([]);
      return;
    }

    const loadSubcategories = async () => {
      const selectedCategory = categories?.find(c => c.slug === formData.category);
      if (!selectedCategory) return;

      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', selectedCategory.id);
      
      if (error) {
        console.error('Error loading subcategories:', error);
        return;
      }
      
      setSubcategories(data || []);
    };

    loadSubcategories();
  }, [formData.category, categories]);

  const updateFormData = (data: Partial<ItemFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    const step = steps.find(s => s.id === currentStep);
    if (!step) return null;

    const Component = step.component;
    return (
      <Component
        data={formData}
        onUpdate={updateFormData}
        onSubmit={step.id === steps.length ? handleSubmit : undefined}
        isUploading={step.id === steps.length ? isUploading : undefined}
      />
    );
  };

  const uploadImage = async (file: File, retries = 3): Promise<string> => {
    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const fileName = `${currentUser.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
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
      setIsUploading(true);
      const currentUser = useAuthStore.getState().user;
      
      if (!currentUser) {
        const currentPath = window.location.pathname + window.location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Upload images first
      const imageUrls = await Promise.all(
        formData.images.map(file => uploadImage(file))
      );

      // Check if this is a request or regular item
      const isRequest = new URLSearchParams(window.location.search).get('type') === 'request';
      
      if (isRequest) {
        // Create a request item
        const { error } = await supabase
          .from('requested_items')
          .insert({
            title: formData.title,
            description: formData.description,
            min_budget: formData.price,
            max_budget: formData.price * 1.2, // 20% above the target price as max budget
            images: imageUrls,
            category_id: formData.category_id,
            subcategory_id: formData.subcategory_id,
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
            urgency: formData.urgency || 'moderate',
            status: 'active',
            is_flexible: formData.isNegotiable,
            is_anonymous: formData.isAnonymous,
            specifications: {
              condition: formData.condition,
              listing_type: formData.item_type
            }
          });

        if (error) throw error;
        
        navigate('/requests');
        toast.success('Request posted successfully!');
      } else {
        // Create a regular item
        const { error } = await supabase
          .from('items')
          .insert({
            title: formData.title,
            description: formData.description,
            price: formData.price,
            condition: formData.condition,
            images: imageUrls,
            category_id: formData.category_id,
            subcategory_id: formData.subcategory_id,
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
            is_anonymous: formData.isAnonymous,
            item_type: formData.item_type
          });

        if (error) throw error;
        
        navigate('/');
        toast.success('Item listed successfully!');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create listing');
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