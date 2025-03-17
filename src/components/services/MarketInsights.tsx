import { Brain, TrendingUp, Star, Target, DollarSign } from 'lucide-react';

interface MarketInsightsProps {
  activeView: string;
}

export default function MarketInsights({ activeView }: MarketInsightsProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Market Insights</h2>
        </div>
        <span className="text-sm text-gray-500">Updated {new Date().toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trending Skills */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Trending {activeView === 'services' ? 'Skills' : 'Requirements'}
          </h3>
          <div className="space-y-2">
            {(activeView === 'services' ? [
              { name: 'AI Development', growth: '+45%' },
              { name: 'Mobile Apps', growth: '+32%' },
              { name: 'UI/UX Design', growth: '+28%' }
            ] : [
              { name: 'Machine Learning', growth: '+52%' },
              { name: 'Web3', growth: '+38%' },
              { name: 'Cloud Architecture', growth: '+25%' }
            ]).map((skill) => (
              <div key={skill.name} className="flex items-center justify-between">
                <span className="text-gray-600">{skill.name}</span>
                <span className="text-emerald-600 font-medium">{skill.growth}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-500" />
            Success Metrics
          </h3>
          <div className="space-y-2">
            {(activeView === 'services' ? [
              { label: 'Completion Rate', value: '94%' },
              { label: 'Client Satisfaction', value: '4.8/5' },
              { label: 'Repeat Clients', value: '78%' }
            ] : [
              { label: 'Hire Rate', value: '82%' },
              { label: 'Avg. Proposals', value: '12' },
              { label: 'Time to Hire', value: '3.5 days' }
            ]).map((metric) => (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-gray-600">{metric.label}</span>
                <span className="text-gray-900 font-medium">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Insights */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-500" />
            Price Insights
          </h3>
          <div className="space-y-2">
            {(activeView === 'services' ? [
              { label: 'Avg. Service Price', value: '$350' },
              { label: 'Price Range', value: '$50-2000' },
              { label: 'Most Popular', value: '$100-500' }
            ] : [
              { label: 'Avg. Project Budget', value: '$1,200' },
              { label: 'Budget Range', value: '$500-5000' },
              { label: 'Most Common', value: '$1000-3000' }
            ]).map((insight) => (
              <div key={insight.label} className="flex items-center justify-between">
                <span className="text-gray-600">{insight.label}</span>
                <span className="text-gray-900 font-medium">{insight.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 