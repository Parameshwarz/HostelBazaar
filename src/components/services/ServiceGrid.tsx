import { motion } from 'framer-motion';
import { Users, Star, Clock, DollarSign, Heart, Share2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Service } from '../../types/services';

interface ServiceGridProps {
  services: Service[];
  getFilteredServices: () => Service[];
}

export default function ServiceGrid({ services, getFilteredServices }: ServiceGridProps) {
  const navigate = useNavigate();
  const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {getFilteredServices().map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
        >
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            {service.images?.[0] && (
              <img
                src={service.images[0]}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            {service.is_featured && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                Featured
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  {service.provider?.avatar_url ? (
                    <img
                      src={service.provider.avatar_url}
                      alt={service.provider.username}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500">by {service.provider?.username}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
              {service.short_description}
            </p>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {service.rating.toFixed(1)}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({service.total_reviews})
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {service.delivery_time}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Starting from</p>
                <p className="text-xl font-bold text-indigo-600">
                  ${service.starting_price}
                </p>
              </div>
              <button
                onClick={() => navigate(`/services/${service.id}`)}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium 
                hover:bg-indigo-100 transition-colors flex items-center gap-2"
              >
                View Details
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {service.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs font-medium rounded-full
                      bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600"
                  >
                    {skill}
                  </span>
                ))}
                {service.skills.length > 3 && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    +{service.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <Heart className="h-4 w-4 text-rose-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <Share2 className="h-4 w-4 text-indigo-500" />
              </motion.button>
            </div>

            {service.service_levels?.[0] && (
              <div className="absolute top-4 right-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 
                  text-white text-xs font-medium rounded-full shadow-lg"
                >
                  {service.service_levels[0].name.toUpperCase()}
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
} 