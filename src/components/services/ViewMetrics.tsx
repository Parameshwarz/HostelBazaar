import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LineChart, Star } from 'lucide-react';

interface ViewMetricsProps {
  metrics: any[];
}

export default function ViewMetrics({ metrics }: ViewMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                {metric.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              metric.trend === 'up' ? 'text-emerald-600' : 
              metric.trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {metric.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
               metric.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
               <LineChart className="h-4 w-4" />}
              <span>{metric.change}%</span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t">
            {'avgRating' in metric ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">Avg. Rating</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                    {metric.avgRating}
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {metric.completionRate}%
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500">Avg. Budget</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${metric.avgBudget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Proposal Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {metric.proposalRate}%
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 