import React from 'react';
import { Zap, Target, Clock, TrendingUp } from 'lucide-react';
import { AdvancedLPAnalysis } from '../../types';
import { formatPercentage, safeToFixed } from '../../utils/api';

interface EfficiencyTabProps {
  data: AdvancedLPAnalysis;
}

const EfficiencyTab: React.FC<EfficiencyTabProps> = ({ data }) => {
  const efficiency = data.capital_efficiency;
  const strategy = data.strategy_analysis;

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-100';
    if (score >= 60) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-success-600';
    if (rate >= 50) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getRangeWidthRecommendation = (width: number) => {
    if (width < 10) return {
      type: 'Narrow Range',
      color: 'text-danger-600 bg-danger-50 border-danger-200',
      icon: Target,
      description: 'High capital efficiency but higher risk of going out of range'
    };
    if (width < 25) return {
      type: 'Balanced Range',
      color: 'text-success-600 bg-success-50 border-success-200',
      icon: TrendingUp,
      description: 'Good balance between capital efficiency and risk management'
    };
    return {
      type: 'Wide Range',
      color: 'text-warning-600 bg-warning-50 border-warning-200',
      icon: Clock,
      description: 'Lower risk but reduced capital efficiency'
    };
  };

  const recommendation = getRangeWidthRecommendation(efficiency.range_width_percent);
  const RecommendationIcon = recommendation.icon;

  return (
    <div className="space-y-6">
      {/* APR Comparison */}
      {data.market_context.pool_apr && (
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <h3 className="text-lg font-semibold mb-4 text-green-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            APR Comparison: Your Range vs Pool Average
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* SaucerSwap Pool APR */}
            {data.market_context.pool_apr.saucerswap_pool_apr && (
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="text-sm text-gray-600 mb-1">Pool-Wide APR</div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatPercentage(data.market_context.pool_apr.saucerswap_pool_apr)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Full-range liquidity (SaucerSwap)
                </div>
              </div>
            )}
            
            {/* Your Estimated APR */}
            <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Your Estimated APR</div>
              <div className="text-3xl font-bold text-success-600">
                {formatPercentage(data.market_context.pool_apr.estimated_position_apr)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                For your {formatPercentage(efficiency.range_width_percent)} range
              </div>
            </div>
            
            {/* Concentration Multiplier */}
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <div className="text-sm text-gray-600 mb-1">Concentration Factor</div>
              <div className="text-3xl font-bold text-primary-600">
                {safeToFixed(data.market_context.pool_apr.concentration_multiplier, 2)}x
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Liquidity concentration vs full range
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="text-sm text-green-800">
              <strong>💡 Key Insight:</strong> {data.market_context.pool_apr.note}
              {data.market_context.pool_apr.saucerswap_pool_apr && 
                data.market_context.pool_apr.estimated_position_apr > data.market_context.pool_apr.saucerswap_pool_apr && (
                  <span className="ml-2 text-success-700 font-medium">
                    Your concentrated range could earn {formatPercentage(
                      ((data.market_context.pool_apr.estimated_position_apr - data.market_context.pool_apr.saucerswap_pool_apr) / 
                      data.market_context.pool_apr.saucerswap_pool_apr) * 100
                    )} more than the pool average!
                  </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Efficiency Score */}
      <div className="card text-center">
        <div className="mb-4">
          <Zap className="w-12 h-12 mx-auto text-primary-600 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">Capital Efficiency Score</h3>
        </div>
        
        <div className={`inline-flex items-center px-6 py-3 rounded-full text-3xl font-bold ${getEfficiencyColor(efficiency.capital_efficiency_score)}`}>
          {safeToFixed(efficiency.capital_efficiency_score, 1)}
        </div>
        
        <div className="mt-4 text-sm text-gray-600 max-w-md mx-auto">
          Based on range width and historical utilization rate. Higher scores indicate better capital efficiency.
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatPercentage(efficiency.range_width_percent)}
          </div>
          <div className="text-sm text-gray-600">Range Width</div>
          <div className="text-xs text-gray-500 mt-1">
            ${safeToFixed(strategy.selected_range.lower, 6)} - ${safeToFixed(strategy.selected_range.upper, 6)}
          </div>
        </div>

        <div className="card text-center">
          <div className={`text-2xl font-bold ${getUtilizationColor(efficiency.utilization_rate_percent)}`}>
            {formatPercentage(efficiency.utilization_rate_percent)}
          </div>
          <div className="text-sm text-gray-600">Utilization Rate</div>
          <div className="text-xs text-gray-500 mt-1">
            Time price was in range
          </div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">
            {efficiency.days_analyzed}
          </div>
          <div className="text-sm text-gray-600">Days Analyzed</div>
          <div className="text-xs text-gray-500 mt-1">
            Historical data period
          </div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.market_context.data_points_analyzed}
          </div>
          <div className="text-sm text-gray-600">Data Points</div>
          <div className="text-xs text-gray-500 mt-1">
            OHLCV candles processed
          </div>
        </div>
      </div>

      {/* Range Analysis */}
      <div className={`card border ${recommendation.color}`}>
        <div className="flex items-start space-x-3">
          <RecommendationIcon className="w-6 h-6 mt-1 text-current" />
          <div className="flex-1">
            <h3 className="font-semibold text-current mb-2">
              {recommendation.type}: {efficiency.recommendation}
            </h3>
            <p className="text-sm text-current opacity-80 mb-4">
              {recommendation.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium mb-2">Range Characteristics:</div>
                <ul className="space-y-1 text-current opacity-80">
                  <li>• Width: {formatPercentage(efficiency.range_width_percent)} of current price</li>
                  <li>• Historical utilization: {formatPercentage(efficiency.utilization_rate_percent)}</li>
                  <li>• Efficiency score: {safeToFixed(efficiency.capital_efficiency_score, 1)}/100</li>
                </ul>
              </div>
              
              <div>
                <div className="font-medium mb-2">Market Context:</div>
                <ul className="space-y-1 text-current opacity-80">
                  <li>• Daily volatility: {formatPercentage(data.market_context.historical_volatility_daily)}</li>
                  <li>• Average volume: ${data.market_context.average_daily_volume_usd.toLocaleString()}</li>
                  <li>• Fee tier: {formatPercentage(data.market_context.fee_rate_percent)}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utilization Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Range Utilization Analysis
        </h3>
        
        <div className="space-y-4">
          {/* Utilization Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Time in Range</span>
              <span className="text-sm text-gray-600">
                {formatPercentage(efficiency.utilization_rate_percent)} of {efficiency.days_analyzed} days
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  efficiency.utilization_rate_percent >= 80 
                    ? 'bg-success-500'
                    : efficiency.utilization_rate_percent >= 50
                    ? 'bg-warning-500'
                    : 'bg-danger-500'
                }`}
                style={{ width: `${efficiency.utilization_rate_percent}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Out of Range</span>
              <span>In Range</span>
            </div>
          </div>

          {/* Utilization Insights */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Utilization Insights</h4>
            <div className="text-sm text-gray-700 space-y-1">
              {efficiency.utilization_rate_percent >= 80 ? (
                <div className="text-success-700">
                  ✓ Excellent utilization rate - your range captured most price action
                </div>
              ) : efficiency.utilization_rate_percent >= 50 ? (
                <div className="text-warning-700">
                  ⚠ Moderate utilization - consider adjusting range width
                </div>
              ) : (
                <div className="text-danger-700">
                  ⚠ Low utilization - range may be too narrow for this market
                </div>
              )}
              
              <div>
                • Capital was actively earning fees {formatPercentage(efficiency.utilization_rate_percent)} of the time
              </div>
              <div>
                • Out of range for {formatPercentage(100 - efficiency.utilization_rate_percent)} of the analysis period
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Optimization Suggestions</h3>
        
        <div className="space-y-3 text-sm">
          {efficiency.utilization_rate_percent < 70 && (
            <div className="flex items-start space-x-2 text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Consider widening your range:</strong> Low utilization suggests the range might be too narrow. 
                A wider range would capture more price action but with lower capital efficiency.
              </div>
            </div>
          )}
          
          {efficiency.utilization_rate_percent > 90 && efficiency.range_width_percent > 30 && (
            <div className="flex items-start space-x-2 text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>Consider narrowing your range:</strong> High utilization with a wide range suggests 
                you could increase capital efficiency by tightening the range.
              </div>
            </div>
          )}
          
          {data.market_context.historical_volatility_daily > 5 && (
            <div className="flex items-start space-x-2 text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <strong>High volatility detected:</strong> Consider wider ranges or more frequent rebalancing 
                in volatile markets to maintain utilization.
              </div>
            </div>
          )}
          
          <div className="flex items-start space-x-2 text-blue-800">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
            <div>
              <strong>Monitor and rebalance:</strong> Optimal ranges change with market conditions. 
              Consider periodic rebalancing based on utilization rates and market volatility.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyTab;

