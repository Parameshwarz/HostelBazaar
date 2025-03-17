import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useServiceCategories } from '../hooks/useServiceCategories';
import { ServiceLevel, Service } from '../types/services';
import { supabase } from '../lib/supabase';

interface FormData {
  title: string;
  description: string;
  short_description: string;
  category_id: string;
  price_type: 'fixed' | 'hourly' | 'project';
  starting_price: number;
  delivery_time: string;
  skills: string[];
  portfolio_links: string[];
  experience_level: 'beginner' | 'intermediate' | 'expert';
  service_levels: ServiceLevel[];
}

const initialFormData: FormData = {
  title: '',
  description: '',
  short_description: '',
  category_id: '',
  price_type: 'fixed',
  starting_price: 0,
  delivery_time: '',
  skills: [],
  portfolio_links: [],
  experience_level: 'intermediate',
  service_levels: [
    {
      name: 'basic',
      price: 0,
      description: '',
      delivery_time: '',
      revisions: 1,
      features: [],
    },
    {
      name: 'standard',
      price: 0,
      description: '',
      delivery_time: '',
      revisions: 2,
      features: [],
    },
    {
      name: 'premium',
      price: 0,
      description: '',
      delivery_time: '',
      revisions: 3,
      features: [],
    },
  ],
};

const steps = [
  'Basic Information',
  'Service Details',
  'Pricing & Packages',
  'Portfolio & Skills',
  'Review & Submit',
];

export default function ServiceOffer() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useServiceCategories();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/services/offer');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setFormData((prev) => ({ ...prev, skills }));
  };

  const handleServiceLevelChange = (
    index: number,
    field: keyof ServiceLevel,
    value: any
  ) => {
    setFormData((prev) => {
      const newLevels = [...prev.service_levels];
      newLevels[index] = { ...newLevels[index], [field]: value };
      return { ...prev, service_levels: newLevels };
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to offer services');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the basic service first
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          provider_id: user.id,
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          short_description: formData.short_description,
          price_type: formData.price_type,
          starting_price: formData.starting_price,
          delivery_time: formData.delivery_time,
          skills: formData.skills,
          portfolio_links: formData.portfolio_links,
          experience_level: formData.experience_level,
          is_active: true,
          is_featured: false,
          rating: 0,
          total_reviews: 0,
          total_orders: 0
        })
        .select()
        .single();

      if (serviceError) {
        console.error('Service creation error:', serviceError);
        throw serviceError;
      }

      // Then create the service levels
      const { error: levelsError } = await supabase
        .from('service_levels')
        .insert(
          formData.service_levels.map(level => ({
            service_id: service.id,
            name: level.name,
            price: level.price,
            description: level.description,
            delivery_time: level.delivery_time,
            revisions: level.revisions,
            features: level.features || []
          }))
        );

      if (levelsError) {
        console.error('Service levels creation error:', levelsError);
        throw levelsError;
      }

      navigate(`/services/${service.id}`);
    } catch (err) {
      setError('Failed to create service. Please try again.');
      console.error('Error creating service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Professional Web Development Services"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Short Description
              </label>
              <input
                type="text"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Brief overview of your service"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Detailed Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Detailed description of what you offer"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={categoriesLoading}
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Delivery Time
              </label>
              <input
                type="text"
                name="delivery_time"
                value={formData.delivery_time}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., 2-3 days"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price Type
              </label>
              <select
                name="price_type"
                value={formData.price_type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
                <option value="project">Project Based</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Starting Price
              </label>
              <input
                type="number"
                name="starting_price"
                value={formData.starting_price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter starting price"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Service Packages</h3>
              {formData.service_levels.map((level, index) => (
                <div key={`${index}-${level.name}`} className="border rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 capitalize mb-2">
                    {level.name} Package
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={level.price}
                      onChange={(e) =>
                        handleServiceLevelChange(index, 'price', Number(e.target.value))
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Price"
                    />
                    <input
                      type="text"
                      value={level.description}
                      onChange={(e) =>
                        handleServiceLevelChange(index, 'description', e.target.value)
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Package description"
                    />
                    <input
                      type="text"
                      value={level.delivery_time}
                      onChange={(e) =>
                        handleServiceLevelChange(index, 'delivery_time', e.target.value)
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Delivery time"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={(e) =>
                  handleSkillsChange(
                    e.target.value.split(',').map((skill) => skill.trim())
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., React, TypeScript, Node.js"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Portfolio Links (comma-separated)
              </label>
              <input
                type="text"
                value={formData.portfolio_links.join(', ')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    portfolio_links: e.target.value
                      .split(',')
                      .map((link) => link.trim()),
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Add links to your previous work"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Review Your Service</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {formData.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {formData.short_description}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.description}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Starting Price
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ${formData.starting_price}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Experience Level
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {formData.experience_level}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Skills</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.skills.join(', ')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Offer Your Service</h1>
          <p className="mt-2 text-sm text-gray-600">
            Share your skills with the college community
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-indigo-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="mt-2 text-xs hidden sm:block">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={currentStep === 0}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
              currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentStep === steps.length - 1) {
                handleSubmit();
              } else {
                setCurrentStep((prev) => prev + 1);
              }
            }}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {currentStep === steps.length - 1 ? (
              isSubmitting ? (
                'Submitting...'
              ) : (
                'Submit Service'
              )
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 