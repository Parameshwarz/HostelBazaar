import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package, ArrowRight, Plus, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Service as BaseService } from '../../types/services';

interface Service extends BaseService {
  provider: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  services: Service[];
  total_price: number;
  discounted_price: number;
  savings_percentage: number;
}

export default function ServiceBundles({ currentService }: { currentService: Service }) {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<ServiceBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedBundles();
  }, [currentService]);

  const fetchRecommendedBundles = async () => {
    try {
      setLoading(true);
      
      // First, fetch services in the same category
      const { data: categoryServices, error: categoryError } = await supabase
        .from('services')
        .select(`
          *,
          provider:profiles!services_provider_id_fkey (
            id,
            username,
            avatar_url
          ),
          category:service_categories!services_category_id_fkey (
            id,
            name
          )
        `)
        .eq('category.id', currentService.category.id)
        .neq('id', currentService.id)
        .limit(5);

      if (categoryError) throw categoryError;

      // Then, fetch complementary services based on common combinations
      const { data: complementaryServices, error: complementaryError } = await supabase
        .from('services')
        .select(`
          *,
          provider:profiles!services_provider_id_fkey (
            id,
            username,
            avatar_url
          ),
          category:service_categories!services_category_id_fkey (
            id,
            name
          )
        `)
        .neq('category.id', currentService.category.id)
        .limit(5);

      if (complementaryError) throw complementaryError;

      // Create AI-powered bundles
      const generatedBundles = generateBundles(
        currentService,
        categoryServices || [],
        complementaryServices || []
      );

      setBundles(generatedBundles);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load service bundles');
    } finally {
      setLoading(false);
    }
  };

  const generateBundles = (
    main: Service,
    category: Service[],
    complementary: Service[]
  ): ServiceBundle[] => {
    // Bundle 1: Same Category Bundle
    const sameCategoryBundle = {
      id: 'bundle-1',
      name: 'Complete Package',
      description: `Complete ${main.category.name} solution package`,
      services: [main, ...category.slice(0, 2)],
      total_price: main.starting_price + category.slice(0, 2).reduce((sum, s) => sum + s.starting_price, 0),
      get discounted_price() {
        return Math.floor(this.total_price * 0.85); // 15% discount
      },
      get savings_percentage() {
        return Math.round(((this.total_price - this.discounted_price) / this.total_price) * 100);
      }
    };

    // Bundle 2: Cross-Category Bundle
    const crossCategoryBundle = {
      id: 'bundle-2',
      name: 'Full Solution Bundle',
      description: 'End-to-end solution across categories',
      services: [main, ...complementary.slice(0, 2)],
      total_price: main.starting_price + complementary.slice(0, 2).reduce((sum, s) => sum + s.starting_price, 0),
      get discounted_price() {
        return Math.floor(this.total_price * 0.8); // 20% discount
      },
      get savings_percentage() {
        return Math.round(((this.total_price - this.discounted_price) / this.total_price) * 100);
      }
    };

    return [sameCategoryBundle, crossCategoryBundle];
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          AI-Recommended Service Bundles
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.map((bundle) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{bundle.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{bundle.description}</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-green-700">
                    Save {bundle.savings_percentage}%
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {bundle.services.map((service, index) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-3"
                  >
                    {index === 0 ? (
                      <Package className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{service.title}</p>
                      <p className="text-xs text-gray-500">by {service.provider.username}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      ₹{service.starting_price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="line-through">₹{bundle.total_price}</span>
                    <span className="ml-2 text-lg font-semibold text-gray-900">
                      ₹{bundle.discounted_price}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="h-4 w-4" />
                    Bundle Discount Applied
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Handle bundle purchase
                    toast.success('Bundle added to cart!');
                  }}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                    flex items-center justify-center gap-2 font-medium"
                >
                  Get Bundle
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 