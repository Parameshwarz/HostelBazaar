import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, MapPin, CheckCircle2, IndianRupee } from 'lucide-react';

interface Props {
  initialPrice?: number;
  finalPrice?: number;
  meetingScheduled: boolean;
  locationAgreed: boolean;
  dealCompleted: boolean;
}

const DealProgress: React.FC<Props> = ({
  initialPrice,
  finalPrice,
  meetingScheduled,
  locationAgreed,
  dealCompleted
}) => {
  const steps = [
    {
      label: 'Initial Price',
      icon: IndianRupee,
      completed: !!initialPrice,
      value: initialPrice ? `₹${initialPrice}` : '-'
    },
    {
      label: 'Final Price',
      icon: IndianRupee,
      completed: !!finalPrice,
      value: finalPrice ? `₹${finalPrice}` : '-'
    },
    {
      label: 'Meeting Scheduled',
      icon: Clock,
      completed: meetingScheduled,
      value: meetingScheduled ? 'Yes' : 'Pending'
    },
    {
      label: 'Location Agreed',
      icon: MapPin,
      completed: locationAgreed,
      value: locationAgreed ? 'Yes' : 'Pending'
    },
    {
      label: 'Deal Completed',
      icon: CheckCircle2,
      completed: dealCompleted,
      value: dealCompleted ? 'Yes' : 'Pending'
    }
  ];

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Deal Progress</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-3">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {step.label}
                  </span>
                  <span 
                    className={`text-sm ${
                      step.completed 
                        ? 'text-green-600 font-medium' 
                        : 'text-gray-500'
                    } truncate ml-2`}
                  >
                    {step.value}
                  </span>
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`absolute left-4 ml-[-1px] top-8 w-[2px] ${
                  step.completed ? 'bg-green-200' : 'bg-gray-200'
                }`}
                style={{ height: '24px' }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Price Comparison */}
      {initialPrice && finalPrice && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price Difference</span>
            <span className="text-sm font-medium text-green-600">
              ₹{initialPrice - finalPrice} ({Math.round(((initialPrice - finalPrice) / initialPrice) * 100)}% off)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealProgress; 