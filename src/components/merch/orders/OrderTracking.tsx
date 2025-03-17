import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface OrderTrackingProps {
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
  currentStatus: OrderStatus;
  deliveryAddress: string;
  trackingEvents: TrackingEvent[];
}

type OrderStatus = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';

interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  location: string;
  description: string;
}

export default function OrderTracking({
  orderId,
  orderDate,
  estimatedDelivery,
  currentStatus,
  deliveryAddress,
  trackingEvents,
}: OrderTrackingProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    processing: {
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'Order Processing',
    },
    shipped: {
      icon: Truck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      label: 'Shipped',
    },
    out_for_delivery: {
      icon: MapPin,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
      label: 'Out for Delivery',
    },
    delivered: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      label: 'Delivered',
    },
  };

  const statusOrder: OrderStatus[] = ['processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = statusOrder.indexOf(currentStatus);

  const StatusIcon = statusConfig[currentStatus].icon;
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order ID: {orderId}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {orderDate}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Est. Delivery: {estimatedDelivery}
              </div>
            </div>
          </div>
          <div className={`p-2 ${statusConfig[currentStatus].bgColor} rounded-lg`}>
            <StatusIcon className={`w-6 h-6 ${statusConfig[currentStatus].color}`} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(currentStatusIndex / (statusOrder.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {statusOrder.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const StatusIcon = statusConfig[status].icon;
              return (
                <div key={status} className="flex flex-col items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                    } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <StatusIcon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                  </motion.div>
                  <p className={`mt-2 text-sm font-medium ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {statusConfig[status].label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Address</h4>
              <p className="text-sm text-gray-600">{deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Tracking Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg
            hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium">Tracking Details</span>
          {showDetails ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Tracking Timeline */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-6">
                {trackingEvents.map((event, index) => {
                  const EventIcon = statusConfig[event.status].icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="relative">
                        <div
                          className={`w-8 h-8 rounded-full ${statusConfig[event.status].bgColor}
                            flex items-center justify-center`}
                        >
                          <EventIcon className={`w-4 h-4 ${statusConfig[event.status].color}`} />
                        </div>
                        {index < trackingEvents.length - 1 && (
                          <div className="absolute top-8 bottom-0 left-1/2 w-0.5 bg-gray-200 -translate-x-1/2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{statusConfig[event.status].label}</h4>
                          <time className="text-sm text-gray-500">{event.timestamp}</time>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{event.location}</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 