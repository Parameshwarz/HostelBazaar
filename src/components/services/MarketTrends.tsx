import { BarChart, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketTrend {
  category: string;
  growth_rate: number;
  avg_price: number;
  demand_level: 'High' | 'Medium' | 'Low';
  trend: 'up' | 'down' | 'stable';
}

interface MarketTrendsProps {
  marketTrends: MarketTrend[];
}

export default function MarketTrends({ marketTrends }: MarketTrendsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-indigo-600" />
          Market Trends
        </h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketTrends.map((trend) => (
          <div key={trend.category} className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-3">{trend.category}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Growth Rate</span>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  trend.trend === 'up' ? 'text-emerald-600' :
                  trend.trend === 'down' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {trend.trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
                   trend.trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
                   null}
                  {trend.growth_rate}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Avg. Price</span>
                <span className="text-sm font-medium text-gray-900">
                  ${trend.avg_price.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Demand</span>
                <span className={`text-sm font-medium ${
                  trend.demand_level === 'High' ? 'text-emerald-600' :
                  trend.demand_level === 'Medium' ? 'text-amber-600' :
                  'text-gray-600'
                }`}>
                  {trend.demand_level}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 