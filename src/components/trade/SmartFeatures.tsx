import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Calendar,
  BookOpen,
  Users,
  Lightbulb,
  ChevronRight,
  BarChart2,
  Clock,
  Target,
  Sparkles,
  Loader,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  itemId?: string;
  category?: string;
}

interface PricePrediction {
  currentPrice: number;
  suggestedPrice: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

interface DemandInsight {
  peak: string;
  description: string;
  confidence: number;
}

export default function SmartFeatures({ itemId, category }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricePrediction, setPricePrediction] = useState<PricePrediction | null>(null);
  const [demandInsights, setDemandInsights] = useState<DemandInsight[]>([]);

  // Fetch smart features data
  useEffect(() => {
    const fetchSmartFeatures = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulating API calls - Replace with actual API calls in production
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sample data - In production, these would come from your AI backend
        setPricePrediction({
          currentPrice: 2500,
          suggestedPrice: 2800,
          confidence: 85,
          trend: 'up',
          factors: [
            'High demand during exam season',
            'Limited availability in campus stores',
            'Good condition compared to market average',
            'Popular among first-year students'
          ]
        });

        setDemandInsights([
          {
            peak: 'Start of Semester',
            description: 'High demand for textbooks and study materials',
            confidence: 90
          },
          {
            peak: 'Mid-Semester',
            description: 'Increased interest in study aids and notes',
            confidence: 75
          },
          {
            peak: 'End of Semester',
            description: 'Peak time for selling used materials',
            confidence: 85
          }
        ]);

      } catch (err) {
        console.error('Failed to fetch smart features:', err);
        setError('Failed to load smart features. Please try again.');
        toast.error('Failed to load smart features');
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId || category) {
      fetchSmartFeatures();
    }
  }, [itemId, category]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading smart features...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-semibold">Error Loading Smart Features</h3>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium
            hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!pricePrediction || !demandInsights.length) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl">
        <p className="text-gray-500 text-center">No smart features available for this item.</p>
      </div>
    );
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Price Prediction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            AI Price Insights
          </h3>

          <div className="space-y-4">
            {/* Price Suggestion */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-purple-600 font-medium">Suggested Price</p>
                <p className="text-2xl font-bold text-purple-700">₹{pricePrediction.suggestedPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-600 font-medium">Confidence</p>
                <p className="text-lg font-semibold text-purple-700">{pricePrediction.confidence}%</p>
              </div>
            </div>

            {/* Price Factors */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Price Factors</h4>
              <ul className="space-y-2">
                {pricePrediction.factors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Demand Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Demand Insights
          </h3>

          <div className="space-y-4">
            {demandInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-emerald-700">{insight.peak}</p>
                    <p className="text-sm text-emerald-600 mt-1">{insight.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    {insight.confidence}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Trading Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Smart Trading Tips
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500 mb-2" />
              <h4 className="font-medium text-amber-700">Best Time to Sell</h4>
              <p className="text-sm text-amber-600 mt-1">Start of semester for maximum visibility</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <Target className="w-5 h-5 text-amber-500 mb-2" />
              <h4 className="font-medium text-amber-700">Target Audience</h4>
              <p className="text-sm text-amber-600 mt-1">First-year students in related courses</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <BarChart2 className="w-5 h-5 text-amber-500 mb-2" />
              <h4 className="font-medium text-amber-700">Price Strategy</h4>
              <p className="text-sm text-amber-600 mt-1">Set competitive price based on condition</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <Users className="w-5 h-5 text-amber-500 mb-2" />
              <h4 className="font-medium text-amber-700">Group Deals</h4>
              <p className="text-sm text-amber-600 mt-1">Consider bulk discounts for study groups</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 