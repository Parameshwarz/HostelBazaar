import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Award, CheckCircle } from 'lucide-react';
import { Service, ServiceLevel } from '../../types/services';
import { formatPrice } from '../../utils/formatPrice';

type Props = {
  service: Service;
};

export default function ServiceCard({ service }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<ServiceLevel>(
    service.service_levels?.[0] || {
      name: 'basic',
      price: service.starting_price,
      description: service.short_description,
      delivery_time: service.delivery_time,
      revisions: 1,
      features: []
    }
  );

  return (
    <Link to={`/services/${service.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        {/* Service Header */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              {service.provider?.avatar_url ? (
                <img 
                  src={service.provider.avatar_url} 
                  alt={service.provider.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">
                    {(service.provider?.username || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {service.provider?.username}
                </div>
                {service.provider?.is_verified && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-auto flex gap-1">
              {service.is_featured && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Featured
                </span>
              )}
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                {service.experience_level}
              </span>
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
          <p className="text-gray-600 text-sm mb-4">{service.short_description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-600">
                {service.rating || 'New'} ({service.total_reviews})
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Award className="h-4 w-4" />
              <span>{service.total_orders} orders</span>
            </div>
          </div>
        </div>

        {/* Service Levels */}
        <div className="border-t">
          <div className="flex border-b">
            {service.service_levels?.filter((level, index, self) => 
              index === self.findIndex(l => l.name === level.name)
            ).map((level) => (
              <button
                key={`${service.id}-${level.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedLevel(level);
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  selectedLevel.name === level.name
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {level.name.charAt(0).toUpperCase() + level.name.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{selectedLevel.delivery_time}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Starting at</p>
                <p className="font-semibold text-lg">₹{selectedLevel.price}</p>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              {selectedLevel.revisions} revision{selectedLevel.revisions !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 