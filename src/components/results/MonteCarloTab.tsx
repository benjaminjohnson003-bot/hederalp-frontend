import React from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import { AdvancedLPAnalysis } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/api';
import MonteCarloChart from '../charts/MonteCarloChart';

interface MonteCarloTabProps {
  data: AdvancedLPAnalysis;
}

const MonteCarloTab: React.FC<MonteCarloTabProps> = ({ data }) => {
  const mcData = data.monte_carlo_simulation;

  if (!mcData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Monte Carlo Simulation Not Available
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Enable "Advanced Mode" in the strategy configuration to run Monte Carlo simulations
          with 1000 trials using historical volatility data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interactive Charts */}
      <MonteCarloChart data={mcData} />

      {/* Simulation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            {mcData.trials_run.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Simulations Run</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">
            {formatCurrency(mcData.expected_net_return_usd)}
          </div>
          <div className="text-sm text-gray-600">Expected Return</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatPercentage(mcData.probability_of_profit)}
          </div>
          <div className="text-sm text-gray-600">Probability of Profit</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatPercentage(mcData.probability_beats_hodl)}
          </div>
          <div className="text-sm text-gray-600">Beats HODL</div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-warning-600" />
          Risk Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Value at Risk (5th percentile)</div>
            <div className="text-xl font-bold text-danger-600">
              {formatCurrency(mcData.value_at_risk_5th_percentile_usd)}
            </div>
            <div className="text-xs text-gray-500">Worst 5% of outcomes</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Expected Return</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(mcData.expected_net_return_usd)}
            </div>
            <div className="text-xs text-gray-500">Average outcome</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Upside Potential (95th percentile)</div>
            <div className="text-xl font-bold text-success-600">
              {formatCurrency(mcData.value_at_risk_95th_percentile_usd)}
            </div>
            <div className="text-xs text-gray-500">Best 5% of outcomes</div>
          </div>
        </div>
      </div>

      {/* Price Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Price Distribution</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Minimum</div>
            <div className="font-mono font-medium">
              ${mcData.price_distribution.min.toFixed(6)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">10th %ile</div>
            <div className="font-mono font-medium">
              ${mcData.price_distribution.percentile_10.toFixed(6)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Median</div>
            <div className="font-mono font-medium">
              ${mcData.price_distribution.median.toFixed(6)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">90th %ile</div>
            <div className="font-mono font-medium">
              ${mcData.price_distribution.percentile_90.toFixed(6)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Maximum</div>
            <div className="font-mono font-medium">
              ${mcData.price_distribution.max.toFixed(6)}
            </div>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Monte Carlo Methodology</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Simulations:</strong> {mcData.trials_run.toLocaleString()} independent price paths
          </p>
          <p>
            <strong>Volatility:</strong> {formatPercentage(mcData.volatility_used)} daily (derived from historical data)
          </p>
          <p>
            <strong>Model:</strong> Geometric Brownian Motion with historical volatility
          </p>
          <p>
            <strong>Time Horizon:</strong> {data.strategy_analysis.time_horizon_days} days
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonteCarloTab;
