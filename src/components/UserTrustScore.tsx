import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  ShoppingBag, 
  ThumbsUp,
  Calendar,
  Award,
  BadgeCheck,
  Zap
} from 'lucide-react';

interface Props {
  userId: string;
  username: string;
  trustScore: number;
  responseTime: string;
  completedDeals: number;
  positiveRatings: number;
  memberSince: string;
  badges: string[];
}

const BADGE_CONFIG = {
  verified: {
    icon: BadgeCheck,
    label: 'Verified User',
    color: 'text-blue-500 bg-blue-100'
  },
  quick_responder: {
    icon: Zap,
    label: 'Quick Responder',
    color: 'text-yellow-500 bg-yellow-100'
  },
  trusted_seller: {
    icon: Award,
    label: 'Trusted Seller',
    color: 'text-green-500 bg-green-100'
  }
};

const UserTrustScore: React.FC<Props> = ({
  username,
  trustScore,
  responseTime,
  completedDeals,
  positiveRatings,
  memberSince,
  badges
}) => {
  const scoreColor = trustScore >= 90 
    ? 'text-green-500' 
    : trustScore >= 70 
      ? 'text-blue-500' 
      : 'text-yellow-500';

  const stats = [
    {
      icon: Clock,
      label: 'Response Time',
      value: responseTime
    },
    {
      icon: ShoppingBag,
      label: 'Completed Deals',
      value: completedDeals
    },
    {
      icon: ThumbsUp,
      label: 'Positive Ratings',
      value: `${positiveRatings}%`
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: memberSince
    }
  ];

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`relative w-14 h-14 rounded-full border-[3px] ${
              scoreColor.replace('text', 'border')
            } flex items-center justify-center flex-shrink-0`}
          >
            <Shield className={`w-6 h-6 ${scoreColor}`} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
              <span className={`text-xs font-bold ${scoreColor}`}>{trustScore}</span>
            </div>
          </motion.div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{username}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {badges.map(badge => {
          const config = BADGE_CONFIG[badge as keyof typeof BADGE_CONFIG];
          if (!config) return null;
          
          return (
            <motion.div
              key={badge}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}
            >
              <config.icon className="w-3 h-3" />
              {config.label}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
          >
            <div className={`w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center ${scoreColor}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">{stat.label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UserTrustScore; 