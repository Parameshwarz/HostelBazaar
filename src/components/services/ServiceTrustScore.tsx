import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Clock,
  MessageSquare,
  CheckCircle,
  Repeat,
  Star,
  Award,
  TrendingUp,
  Users,
  Zap,
  ThumbsUp,
  Target,
  LucideIcon
} from 'lucide-react';
import type { TrustScore, ServiceCompatibility } from '../../types/services';

interface Props {
  trustScore: TrustScore;
  compatibility?: ServiceCompatibility;
  className?: string;
}

interface Metric<T> {
  label: string;
  value: T;
  icon: LucideIcon;
  format: (value: T) => string;
}

export default function ServiceTrustScore({ trustScore, compatibility, className = '' }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 4.5) return 'bg-emerald-100';
    if (score >= 4.0) return 'bg-blue-100';
    if (score >= 3.5) return 'bg-yellow-100';
    return 'bg-gray-100';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      {/* Trust Score Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Shield className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Trust Score</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-indigo-600">
            {trustScore.overall_score.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">/5.0</span>
        </div>
      </div>

      {/* Score Components */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          {
            label: 'Delivery Speed',
            score: trustScore.delivery_speed_score,
            icon: Clock,
          },
          {
            label: 'Communication',
            score: trustScore.communication_score,
            icon: MessageSquare,
          },
          {
            label: 'Quality',
            score: trustScore.quality_score,
            icon: CheckCircle,
          },
          {
            label: 'Revisions',
            score: trustScore.revision_responsiveness,
            icon: Repeat,
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-md ${getScoreBg(metric.score)}`}>
                <metric.icon className={`h-4 w-4 ${getScoreColor(metric.score)}`} />
              </div>
              <span className="text-sm text-gray-600">{metric.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(metric.score / 5) * 100}%` }}
                  className={`h-full rounded-full ${
                    metric.score >= 4.5
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : metric.score >= 4.0
                      ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  }`}
                />
              </div>
              <span className={`ml-3 text-sm font-medium ${getScoreColor(metric.score)}`}>
                {metric.score.toFixed(1)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4 mb-6">
        {([
          {
            label: 'Completed Orders',
            value: trustScore.total_completed_orders,
            icon: CheckCircle,
            format: (v: number) => v.toString(),
          },
          {
            label: 'On-time Delivery',
            value: trustScore.on_time_delivery_rate,
            icon: Clock,
            format: (v: number) => `${v.toFixed(1)}%`,
          },
          {
            label: 'Repeat Clients',
            value: trustScore.repeat_client_rate,
            icon: Repeat,
            format: (v: number) => `${v.toFixed(1)}%`,
          },
          {
            label: 'Avg. Response Time',
            value: trustScore.avg_response_time,
            icon: MessageSquare,
            format: (v: string) => {
              const hours = parseInt(v);
              return hours < 1 ? 'Under 1 hour' : `${hours} hours`;
            },
          },
        ] as Array<Metric<number | string>>).map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <metric.icon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{metric.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {metric.format(metric.value)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* AI Compatibility Score */}
      {compatibility && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Zap className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Match Score</h3>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                compatibility.compatibility_score >= 80
                  ? 'bg-emerald-100 text-emerald-700'
                  : compatibility.compatibility_score >= 60
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {compatibility.compatibility_score}% Match
            </motion.div>
          </div>

          {/* Match Reasons */}
          <div className="space-y-3">
            {compatibility.match_reasons.map((reason, index) => (
              <motion.div
                key={reason.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <div className="p-1.5 bg-gray-100 rounded-md">
                  {reason.type === 'category_match' && <Target className="h-4 w-4 text-violet-500" />}
                  {reason.type === 'price_match' && <ThumbsUp className="h-4 w-4 text-green-500" />}
                  {reason.type === 'experience_match' && <Award className="h-4 w-4 text-blue-500" />}
                  {reason.type === 'skills_match' && <Star className="h-4 w-4 text-yellow-500" />}
                </div>
                <span className="text-gray-600">
                  {reason.type === 'category_match' && 'Matches your preferred category'}
                  {reason.type === 'price_match' && 'Within your budget range'}
                  {reason.type === 'experience_match' && 'Matches your experience preference'}
                  {reason.type === 'skills_match' && 'Matches your interests'}
                </span>
                <span className="ml-auto text-gray-400">+{reason.weight}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 