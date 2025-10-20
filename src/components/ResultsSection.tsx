import React, { useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLPStrategyStore } from '../store/lpStrategyStore';
import ScenarioAnalysisTab from './results/ScenarioAnalysisTab';
import MonteCarloTab from './results/MonteCarloTab';
import BacktestTab from './results/BacktestTab';
import EfficiencyTab from './results/EfficiencyTab';
import PriceChart from './charts/PriceChart';
import ExportPanel from './ExportPanel';

const ResultsSection: React.FC = () => {
  const { ui, results } = useLPStrategyStore();
  
  // Chart refs for export functionality
  const chartRefs = {
    price: useRef(null),
    fees: useRef(null),
    monteCarlo: useRef(null),
    backtest: useRef(null),
  };

  // Loading State
  if (ui.isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto text-primary-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Analyzing Your LP Strategy
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Processing market data and running calculations...
          {ui.selectedTab === 'advanced' && ' This may take a moment for Monte Carlo simulations.'}
        </p>
        <div className="mt-6 bg-gray-50 rounded-lg p-4 max-w-sm mx-auto">
          <div className="text-sm text-gray-600 space-y-1">
            <div>✓ Fetching pool data</div>
            <div>✓ Processing transaction history</div>
            <div>✓ Calculating OHLCV candles</div>
            <div className="flex items-center space-x-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Running scenario analysis</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (ui.error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-danger-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Analysis Failed
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {ui.error}
        </p>
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 max-w-lg mx-auto text-left">
          <h4 className="font-medium text-danger-800 mb-2">Common Issues:</h4>
          <ul className="text-sm text-danger-700 space-y-1">
            <li>• Pool has no recent transaction data</li>
            <li>• Invalid price range (lower ≥ upper)</li>
            <li>• Pool ID not found or inactive</li>
            <li>• Network connectivity issues</li>
          </ul>
          <p className="text-xs text-danger-600 mt-3">
            Try adjusting your parameters or selecting a different pool.
          </p>
        </div>
      </div>
    );
  }

  // No Results State
  if (!results) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Configure your strategy and click "Analyze LP Strategy" to see results.</p>
      </div>
    );
  }

  // Render appropriate tab content
  const renderTabContent = () => {
    switch (ui.selectedTab) {
      case 'scenarios':
        return <ScenarioAnalysisTab data={results} />;
      case 'advanced':
        return <MonteCarloTab data={results} />;
      case 'backtest':
        return <BacktestTab data={results} />;
      case 'efficiency':
        return <EfficiencyTab data={results} />;
      default:
        return <ScenarioAnalysisTab data={results} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Chart */}
      <PriceChart 
        poolId={results.strategy_analysis.pool_id}
        height={400}
        showRangeOverlay={true}
        className="mb-6"
      />

      {/* Analysis Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Pool</div>
            <div className="font-semibold text-gray-900">
              {results.strategy_analysis.pool_name}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Current Price</div>
            <div className="font-semibold text-gray-900">
              ${typeof results.strategy_analysis.current_price === 'number' ? results.strategy_analysis.current_price.toFixed(6) : '0.000000'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Range Width</div>
            <div className="font-semibold text-gray-900">
              {typeof results.strategy_analysis.selected_range.width_percent === 'number' ? results.strategy_analysis.selected_range.width_percent.toFixed(1) : '0.0'}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Liquidity</div>
            <div className="font-semibold text-gray-900">
              ${results.strategy_analysis.liquidity_amount_usd.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>

      {/* Export Panel */}
      <ExportPanel chartRefs={chartRefs} />

      {/* Analysis Metadata */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Data Points:</span>{' '}
            {results.market_context.data_points_analyzed} candles
          </div>
          <div>
            <span className="font-medium">Volatility:</span>{' '}
            {typeof results.market_context.historical_volatility_daily === 'number' ? results.market_context.historical_volatility_daily.toFixed(2) : '0.00'}% daily
          </div>
          <div>
            <span className="font-medium">Analyzed:</span>{' '}
            {new Date(results.strategy_analysis.analysis_date).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
