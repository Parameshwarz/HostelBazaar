import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Star,
  Users,
  Clock,
  DollarSign,
  Zap,
  Target,
  ThumbsUp,
  Award,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { Service, ServiceCompatibility } from '../../types/services';

interface AIMatchmakerProps {
  className?: string;
}

export default function AIMatchmaker({ className = '' }: AIMatchmakerProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Array<{
    service: Service;
    compatibility: ServiceCompatibility;
  }>>([]);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_compatibility')
        .select(`
          *,
          service:services(
            *,
            category:service_categories!services_category_id_fkey(*),
            provider:profiles!services_provider_id_fkey(*)
          )
        `)
        .eq('user_id', user?.id)
        .order('compatibility_score', { ascending: false })
        .limit(6);

      if (error) throw error;

      setRecommendations(
        data.map(item => ({
          service: item.service,
          compatibility: {
            id: item.id,
            service_id: item.service_id,
            user_id: item.user_id,
            compatibility_score: item.compatibility_score,
            match_reasons: item.match_reasons,
            created_at: item.created_at,
            updated_at: item.updated_at
          }
        }))
      );
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 ${className}`}>
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/10">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">AI Service Matchmaker</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-300" />
                <span className="font-medium text-white">Smart Matching</span>
              </div>
              <p className="text-sm text-white/80">
                AI-powered matching based on your requirements and preferences
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-amber-300" />
                <span className="font-medium text-white">Intelligent Analysis</span>
              </div>
              <p className="text-sm text-white/80">
                Deep analysis of service quality and provider reliability
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-5 w-5 text-amber-300" />
                <span className="font-medium text-white">Personalized Results</span>
              </div>
              <p className="text-sm text-white/80">
                Tailored recommendations based on your project needs
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 px-6 py-3 bg-white rounded-xl text-indigo-600 font-medium 
            hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            Find Your Perfect Match
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
} 