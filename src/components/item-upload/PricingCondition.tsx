import React from 'react';
import { IndianRupee, Info, Tag, CheckCircle2, Gift, ShoppingCart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

type PricingData = {
  price: number;
  condition: string;
  isNegotiable: boolean;
  item_type: 'sell' | 'rent' | 'donate';
  urgency?: string;
};

export type Props = {
  data: PricingData;
  onUpdate: (data: Partial<PricingData>) => void;
};

export default function PricingCondition({ data, onUpdate }: Props) {
  // Get the listing type from URL params
  const { search } = window.location;
  const isRequest = new URLSearchParams(search).get('type') === 'request';

  const listingTypes = isRequest ? [
    { id: 'sell', label: 'Buy', icon: ShoppingCart },
    { id: 'rent', label: 'Rent', icon: Clock },
    { id: 'donate', label: 'Open', icon: Gift }
  ] : [
    { id: 'sell', label: 'Sell', icon: ShoppingCart },
    { id: 'rent', label: 'Rent', icon: Clock },
    { id: 'donate', label: 'Donate', icon: Gift }
  ];

  const urgencyLevels = [
    { value: 'urgent', label: 'Urgent (Within 2 days)', color: 'bg-rose-100 text-rose-800' },
    { value: 'moderate', label: 'Moderate (Within a week)', color: 'bg-amber-100 text-amber-800' },
    { value: 'flexible', label: 'Flexible (No rush)', color: 'bg-emerald-100 text-emerald-800' }
  ];

  const handlePriceChange = (value: string) => {
    const numberValue = value === '' ? 0 : Number(value);
    onUpdate({ ...data, price: numberValue });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Listing Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          {isRequest ? 'What are you looking to do?' : 'How do you want to list this item?'}
        </label>
        <div className="grid grid-cols-3 gap-4">
          {listingTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => onUpdate({ ...data, item_type: type.id as any })}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                ${data.item_type === type.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
                }`}
            >
              <type.icon className={`w-6 h-6 mb-2 ${
                data.item_type === type.id ? 'text-indigo-600' : 'text-gray-500'
              }`} />
              <span className={`text-sm font-medium ${
                data.item_type === type.id ? 'text-indigo-600' : 'text-gray-700'
              }`}>
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRequest ? 'Target Budget (₹)' : 'Price (₹)'}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">₹</span>
          </div>
          <input
            type="number"
            value={data.price || ''}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Urgency Selection for Requests */}
      {isRequest && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            How urgent is your request?
          </label>
          <div className="space-y-3">
            {urgencyLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => onUpdate({ ...data, urgency: level.value })}
                className={`w-full flex items-center p-3 rounded-lg border-2 transition-all
                  ${data.urgency === level.value
                    ? 'border-indigo-600'
                    : 'border-gray-200 hover:border-indigo-200'
                  }`}
              >
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
                  {level.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Condition Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRequest ? 'Acceptable Condition' : 'Item Condition'}
        </label>
        <select
          value={data.condition}
          onChange={(e) => onUpdate({ ...data, condition: e.target.value })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="New">Brand New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Any">Any Condition</option>
        </select>
      </div>

      {/* Negotiable Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={data.isNegotiable}
          onChange={(e) => onUpdate({ ...data, isNegotiable: e.target.checked })}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          {isRequest ? 'Flexible with requirements' : 'Price is negotiable'}
        </label>
      </div>
    </div>
  );
} 