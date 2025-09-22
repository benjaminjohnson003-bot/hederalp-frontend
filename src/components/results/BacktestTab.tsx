import React from 'react';
import { Activity, TrendingUp, Calendar } from 'lucide-react';
import { AdvancedLPAnalysis } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/api';
import BacktestChart from '../charts/BacktestChart';

interface BacktestTabProps {
  data: AdvancedLPAnalysis;
}

const BacktestTab: React.FC<BacktestTabProps> = ({ data }) => {
  const backtestData = data.backtesting;

  if (!backtestData) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Historical Backtesting Not Available
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Enable "Backtesting Mode" in the strategy configuration to compare your LP strategy
          against HODL using historical market data.
        </p>
      </div>
    );
  }

  const summary = backtestData.summary;

  return (
    <div className="space-y-6">
      {/* Interactive Charts */}
      <BacktestChart data={backtestData} />

      {/* Backtest Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            {summary.total_periods_tested}
          </div>
          <div className="text-sm text-gray-600">Periods Tested</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatPercentage(summary.average_utilization_rate)}
          </div>
          <div className="text-sm text-gray-600">Avg Utilization</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">
            {formatPercentage(summary.profitable_periods_percent)}
          </div>
          <div className="text-sm text-gray-600">Profitable Periods</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatPercentage(summary.beat_hodl_periods_percent)}
          </div>
          <div className="text-sm text-gray-600">Beat HODL</div>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-success-600" />
          Performance Comparison
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Average LP Return</div>
            <div className="text-xl font-bold text-primary-600">
              {formatCurrency(summary.average_net_return_per_period)}
            </div>
            <div className="text-xs text-gray-500">Per period</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Average HODL Return</div>
            <div className="text-xl font-bold text-gray-600">
              {formatCurrency(summary.average_hodl_return_per_period)}
            </div>
            <div className="text-xs text-gray-500">Per period</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Cumulative Advantage</div>
            <div className={`text-xl font-bold ${
              summary.cumulative_advantage_vs_hodl >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              {summary.cumulative_advantage_vs_hodl >= 0 ? '+' : ''}
              {formatCurrency(summary.cumulative_advantage_vs_hodl)}
            </div>
            <div className="text-xs text-gray-500">Total advantage</div>
          </div>
        </div>
      </div>

      {/* Best and Worst Periods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card border-l-4 border-l-success-500 bg-success-50">
          <h4 className="font-semibold text-success-800 mb-2">Best Period</h4>
          <div className="text-2xl font-bold text-success-600">
            {formatCurrency(summary.best_period_return)}
          </div>
          <div className="text-sm text-success-700 mt-1">
            Highest return in a single period
          </div>
        </div>

        <div className="card border-l-4 border-l-danger-500 bg-danger-50">
          <h4 className="font-semibold text-danger-800 mb-2">Worst Period</h4>
          <div className="text-2xl font-bold text-danger-600">
            {formatCurrency(summary.worst_period_return)}
          </div>
          <div className="text-sm text-danger-700 mt-1">
            Lowest return in a single period
          </div>
        </div>
      </div>

      {/* Recent Periods Detail */}
      {backtestData.detailed_results && backtestData.detailed_results.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Recent Periods Detail
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Period Start</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Price Range</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Utilization</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">LP Return</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">HODL Return</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Advantage</th>
                </tr>
              </thead>
              <tbody>
                {backtestData.detailed_results.map((period, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      {new Date(period.period_start).toLocaleDateString()}
                    </td>
                    <td className="text-right py-3 px-2 font-mono text-xs">
                      ${period.start_price.toFixed(6)} → ${period.end_price.toFixed(6)}
                    </td>
                    <td className="text-right py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        period.utilization_rate > 80 
                          ? 'bg-success-100 text-success-800'
                          : period.utilization_rate > 50
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {formatPercentage(period.utilization_rate)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-2 font-medium">
                      <span className={period.net_return >= 0 ? 'text-success-600' : 'text-danger-600'}>
                        {formatCurrency(period.net_return)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-2 font-medium">
                      <span className={period.hodl_return >= 0 ? 'text-success-600' : 'text-danger-600'}>
                        {formatCurrency(period.hodl_return)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-2 font-bold">
                      <span className={period.advantage >= 0 ? 'text-success-600' : 'text-danger-600'}>
                        {period.advantage >= 0 ? '+' : ''}
                        {formatCurrency(period.advantage)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            Historical backtesting data shows performance over different periods.
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Backtesting Insights</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            • <strong>Win Rate:</strong> LP strategy was profitable in {formatPercentage(summary.profitable_periods_percent)} of periods
          </div>
          <div>
            • <strong>HODL Comparison:</strong> LP outperformed HODL in {formatPercentage(summary.beat_hodl_periods_percent)} of periods
          </div>
          <div>
            • <strong>Range Efficiency:</strong> Average utilization rate of {formatPercentage(summary.average_utilization_rate)}
          </div>
          <div>
            • <strong>Overall Performance:</strong> {
              summary.cumulative_advantage_vs_hodl >= 0 
                ? `LP strategy generated ${formatCurrency(summary.cumulative_advantage_vs_hodl)} more than HODL`
                : `HODL outperformed LP strategy by ${formatCurrency(Math.abs(summary.cumulative_advantage_vs_hodl))}`
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestTab;
