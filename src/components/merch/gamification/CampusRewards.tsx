import React from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  Trophy,
  Star,
  Truck,
  Tag,
  Crown,
  Sparkles,
  Zap,
  ShoppingBag,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react';

interface RewardTier {
  level: number;
  name: string;
  icon: React.ReactNode;
  points: number;
  benefits: string[];
  color: string;
  isUnlocked: boolean;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  isUnlocked: boolean;
  expiresIn?: string;
  discount?: number;
}

interface Activity {
  id: string;
  type: 'purchase' | 'review' | 'share' | 'achievement';
  description: string;
  points: number;
  date: string;
  icon: React.ReactNode;
}

export default function CampusRewards() {
  // User's current points and progress
  const userPoints = 750;
  const nextTierPoints = 1000;
  
  // Reward tiers with progression
  const rewardTiers: RewardTier[] = [
    {
      level: 1,
      name: 'Freshman',
      icon: <Star className="w-5 h-5" />,
      points: 0,
      benefits: ['Basic rewards access', '5% off first purchase'],
      color: 'bg-gray-500',
      isUnlocked: true
    },
    {
      level: 2,
      name: 'Sophomore',
      icon: <Trophy className="w-5 h-5" />,
      points: 500,
      benefits: ['Free shipping', '10% off seasonal items'],
      color: 'bg-blue-500',
      isUnlocked: true
    },
    {
      level: 3,
      name: 'Junior',
      icon: <Crown className="w-5 h-5" />,
      points: 1000,
      benefits: ['Priority access', 'Exclusive deals', 'Birthday bonus'],
      color: 'bg-violet-500',
      isUnlocked: false
    },
    {
      level: 4,
      name: 'Senior',
      icon: <Award className="w-5 h-5" />,
      points: 2000,
      benefits: ['VIP events', '20% off collections', 'Special gifts'],
      color: 'bg-amber-500',
      isUnlocked: false
    }
  ];

  // Available rewards
  const rewards: Reward[] = [
    {
      id: '1',
      name: 'Free Shipping',
      description: 'Get free shipping on your next order',
      icon: <Truck className="w-5 h-5" />,
      points: 100,
      isUnlocked: true,
      expiresIn: '7 days'
    },
    {
      id: '2',
      name: '15% Off',
      description: 'Save 15% on any item',
      icon: <Tag className="w-5 h-5" />,
      points: 300,
      isUnlocked: true,
      discount: 15
    },
    {
      id: '3',
      name: 'Early Access',
      description: 'Get early access to new collections',
      icon: <Zap className="w-5 h-5" />,
      points: 500,
      isUnlocked: true
    },
    {
      id: '4',
      name: 'Mystery Box',
      description: 'Receive a surprise gift box',
      icon: <Gift className="w-5 h-5" />,
      points: 1000,
      isUnlocked: false
    }
  ];

  // Recent activities
  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'purchase',
      description: 'Purchased Winter Collection Hoodie',
      points: 50,
      date: '2 hours ago',
      icon: <ShoppingBag className="w-4 h-4" />
    },
    {
      id: '2',
      type: 'review',
      description: 'Wrote a product review',
      points: 20,
      date: 'Yesterday',
      icon: <Star className="w-4 h-4" />
    },
    {
      id: '3',
      type: 'share',
      description: 'Shared style on social media',
      points: 10,
      date: '2 days ago',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header with Current Status */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-800 p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Campus Rewards</h2>
            <p className="text-violet-200">Level up your campus style game</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userPoints}</div>
            <div className="text-violet-200">Points Earned</div>
          </div>
        </div>

        {/* Current Tier Progress */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Progress to {rewardTiers[2].name}</span>
            <span>{userPoints} / {nextTierPoints}</span>
          </div>
          <div className="relative h-2 bg-black/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(userPoints / nextTierPoints) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full bg-white rounded-full"
            />
          </div>
          <p className="text-sm mt-2 text-violet-200">
            {nextTierPoints - userPoints} points until next tier
          </p>
        </div>
      </div>

      <div className="p-8">
        {/* Reward Tiers */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-6">Reward Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewardTiers.map((tier) => (
              <motion.div
                key={tier.level}
                whileHover={{ y: -4 }}
                className={`relative rounded-xl p-6 ${
                  tier.isUnlocked ? 'bg-white shadow-md' : 'bg-gray-50'
                }`}
              >
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full ${tier.color} 
                  flex items-center justify-center text-white`}>
                  {tier.icon}
                </div>
                <h4 className="font-semibold mb-1">{tier.name}</h4>
                <p className="text-sm text-gray-500 mb-4">{tier.points} points</p>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                {!tier.isUnlocked && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl
                    flex items-center justify-center">
                    <div className="bg-black/80 text-white text-sm px-3 py-1 rounded-full">
                      Locked
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Available Rewards */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-6">Available Rewards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((reward) => (
              <motion.div
                key={reward.id}
                whileHover={{ scale: 1.02 }}
                className={`relative bg-white rounded-xl p-6 border-2 transition-all ${
                  reward.isUnlocked ? 'border-violet-600 shadow-lg' : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    reward.isUnlocked ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {reward.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{reward.name}</h4>
                    <p className="text-sm text-gray-500">{reward.points} points</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                {reward.expiresIn && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <Clock className="w-3 h-3" />
                    Expires in {reward.expiresIn}
                  </div>
                )}
                {!reward.isUnlocked && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl
                    flex items-center justify-center">
                    <div className="bg-black/80 text-white text-sm px-3 py-1 rounded-full">
                      {userPoints < reward.points ? `${reward.points - userPoints} points needed` : 'Locked'}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg text-violet-600">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-violet-600">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">+{activity.points}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 