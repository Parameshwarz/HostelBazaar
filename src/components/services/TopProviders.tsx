import { Crown, Star } from 'lucide-react';

interface TopProvider {
  id: number;
  username: string;
  avatar_url: string | null;
  rating: number;
  total_orders: number;
  completion_rate: number;
  response_time: string;
  skills: string[];
}

interface TopProvidersProps {
  topProviders: TopProvider[];
}

export default function TopProviders({ topProviders }: TopProvidersProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          Top Rated Providers
        </h2>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {topProviders.map((provider) => (
          <div key={provider.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={provider.avatar_url || '/default-avatar.png'}
                alt={provider.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-900">{provider.username}</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-sm">{provider.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Orders</span>
                <span className="font-medium text-gray-900">{provider.total_orders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Completion</span>
                <span className="font-medium text-gray-900">{provider.completion_rate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Response</span>
                <span className="font-medium text-gray-900">{provider.response_time}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {provider.skills.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 