import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Shield, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Building,
  Users,
  MessageCircle,
  Loader,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

interface MeetupLocation {
  id: string;
  name: string;
  description: string;
  isOfficial: boolean;
  openingHours: string;
  safetyRating: number;
}

interface Props {
  itemId: string;
  sellerId: string;
}

export default function SafetyFeatures({ itemId, sellerId }: Props) {
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [sellerDetails, setSellerDetails] = useState<{ verifiedStudent: boolean; successfulTrades: number } | null>(null);

  // Fetch seller details
  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        // TODO: Replace with actual API call
        // Simulating API call to get seller details
        await new Promise(resolve => setTimeout(resolve, 500));
        setSellerDetails({
          verifiedStudent: true,
          successfulTrades: 10
        });
      } catch (err) {
        console.error('Failed to fetch seller details:', err);
        toast.error('Failed to load seller information');
      }
    };

    if (sellerId) {
      fetchSellerDetails();
    }
  }, [sellerId]);

  // Sample safe locations - In production, these would come from your backend
  const safeLocations: MeetupLocation[] = [
    {
      id: '1',
      name: 'Main Library Entrance',
      description: 'Well-lit area with 24/7 security cameras',
      isOfficial: true,
      openingHours: '8:00 AM - 10:00 PM',
      safetyRating: 5
    },
    {
      id: '2',
      name: 'Student Center Lobby',
      description: 'High traffic area with security desk',
      isOfficial: true,
      openingHours: '7:00 AM - 11:00 PM',
      safetyRating: 5
    },
    {
      id: '3',
      name: 'Campus Security Office',
      description: 'Official campus security location',
      isOfficial: true,
      openingHours: '24/7',
      safetyRating: 5
    }
  ];

  const validateMeetupTime = (date: Date): boolean => {
    const now = new Date();
    const meetupTime = new Date(date);
    
    // Must be at least 1 hour in the future
    if (meetupTime.getTime() - now.getTime() < 3600000) {
      setError('Meetup must be scheduled at least 1 hour in advance');
      return false;
    }
    
    // Must be within next 30 days
    if (meetupTime.getTime() - now.getTime() > 30 * 24 * 3600000) {
      setError('Meetup must be scheduled within the next 30 days');
      return false;
    }
    
    return true;
  };

  const handleScheduleMeetup = async () => {
    if (!selectedDate || !selectedLocation || !user) return;
    
    try {
      setIsScheduling(true);
      setError(null);

      // Validate meetup time
      if (!validateMeetupTime(selectedDate)) {
        return;
      }

      // TODO: Implement meetup scheduling logic with your backend
      const meetupData = {
        itemId,
        sellerId,
        buyerId: user.id,
        locationId: selectedLocation.id,
        meetupTime: selectedDate.toISOString(),
      };

      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast.success('Meetup scheduled successfully!');
      
      // Reset form
      setSelectedDate(null);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Failed to schedule meetup:', error);
      setError('Failed to schedule meetup. Please try again.');
      toast.error('Failed to schedule meetup');
    } finally {
      setIsScheduling(false);
    }
  };

  const SafetyChecklist = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Shield className="w-5 h-5 text-green-500" />
        Safety Checklist
      </h3>
      <ul className="space-y-2">
        {[
          'Meet in a designated safe spot',
          'Verify student ID before trading',
          'Inspect item thoroughly',
          'Use campus payment methods',
          'Keep chat records',
          'Trust your instincts'
        ].map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-green-600">
          <Shield className="w-5 h-5" />
          <span className="font-medium">
            {sellerDetails?.verifiedStudent ? 'Verified Student' : 'Verification Pending'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-blue-600">
          <Users className="w-5 h-5" />
          <span className="font-medium">
            {sellerDetails?.successfulTrades}+ Successful Trades
          </span>
        </div>
      </div>

      {/* Safety Checklist */}
      <SafetyChecklist />
    </div>
  );
} 