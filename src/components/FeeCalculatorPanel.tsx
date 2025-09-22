import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, BarChart3, Activity, Settings } from 'lucide-react';
import ReactSlider from 'react-slider';
import { useLPStrategyStore } from '../store/lpStrategyStore';
import { apiClient, formatCurrency, formatPercentage } from '../utils/api';
import HelpTooltip, { HELP_CONTENT } from './HelpTooltip';

const FeeCalculatorPanel: React.FC = () => {
  const { form, setForm, selectedPool, setResults, setLoading, setError } = useLPStrategyStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedPool) {
      setError('Please select a valid pool first');
      return;
    }

    if (form.priceLower >= form.priceUpper) {
      setError('Lower price must be less than upper price');
      return;
    }

    if (form.liquidityUsd <= 0) {
      setError('Liquidity amount must be greater than 0');
      return;
    }

    try {
      setIsAnalyzing(true);
      setLoading(true);
      setError(null);

      const results = await apiClient.analyzeStrategy({
        poolId: form.poolId,
        priceLower: form.priceLower,
        priceUpper: form.priceUpper,
        liquidityUsd: form.liquidityUsd,
        bearCaseDrop: form.bearCaseDrop,
        bullCaseRise: form.bullCaseRise,
        timeHorizonDays: form.timeHorizonDays,
        advancedMode: form.advancedMode,
        backtestMode: form.backtestMode,
      });

      setResults(results);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      setResults(null);
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  };

  const rangeWidth = ((form.priceUpper - form.priceLower) / form.priceLower) * 100;
  const currentPrice = selectedPool ? 0.24 : 0; // TODO: Get real current price
  const isInRange = currentPrice >= form.priceLower && currentPrice <= form.priceUpper;

  return (
    <div className="space-y-6">
      {/* Price Range Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900">Price Range</h3>
            <HelpTooltip {...HELP_CONTENT.priceRange} />
          </div>
          <div className="text-sm text-gray-600">
            Width: {formatPercentage(rangeWidth)}
          </div>
        </div>

        {/* Current Price Indicator */}
        {selectedPool && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Price (estimated)</span>
              <span className="font-medium">${currentPrice.toFixed(6)}</span>
            </div>
            <div className={`text-xs mt-1 ${isInRange ? 'text-success-600' : 'text-warning-600'}`}>
              {isInRange ? '✓ In range' : '⚠ Out of range'}
            </div>
          </div>
        )}

        {/* Price Range Sliders */}
        <div className="space-y-4">
          {/* Lower Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="price-lower" className="text-sm font-medium text-gray-700">
                Lower Price
              </label>
              <input
                id="price-lower"
                type="number"
                value={form.priceLower}
                onChange={(e) => setForm({ priceLower: parseFloat(e.target.value) || 0 })}
                step="0.001"
                min="0"
                max={form.priceUpper - 0.001}
                className="input w-24 text-sm"
              />
            </div>
            <ReactSlider
              value={form.priceLower}
              onChange={(value) => setForm({ priceLower: value })}
              min={0}
              max={form.priceUpper - 0.001}
              step={0.001}
              className="w-full h-2 bg-gray-200 rounded-lg"
              thumbClassName="w-5 h-5 bg-primary-600 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              trackClassName="h-2 bg-primary-200 rounded-lg"
            />
          </div>

          {/* Upper Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="price-upper" className="text-sm font-medium text-gray-700">
                Upper Price
              </label>
              <input
                id="price-upper"
                type="number"
                value={form.priceUpper}
                onChange={(e) => setForm({ priceUpper: parseFloat(e.target.value) || 0 })}
                step="0.001"
                min={form.priceLower + 0.001}
                max="1"
                className="input w-24 text-sm"
              />
            </div>
            <ReactSlider
              value={form.priceUpper}
              onChange={(value) => setForm({ priceUpper: value })}
              min={form.priceLower + 0.001}
              max={1}
              step={0.001}
              className="w-full h-2 bg-gray-200 rounded-lg"
              thumbClassName="w-5 h-5 bg-primary-600 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              trackClassName="h-2 bg-primary-200 rounded-lg"
            />
          </div>
        </div>

        {/* Visual Range Indicator */}
        <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
          <div
            className="absolute h-full bg-primary-200 border-l-2 border-r-2 border-primary-600"
            style={{
              left: `${(form.priceLower / 1) * 100}%`,
              width: `${((form.priceUpper - form.priceLower) / 1) * 100}%`,
            }}
          />
          {currentPrice > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500"
              style={{
                left: `${(currentPrice / 1) * 100}%`,
              }}
              title={`Current price: $${currentPrice.toFixed(6)}`}
            />
          )}
        </div>
      </div>

      {/* Liquidity Amount */}
      <div>
        <label htmlFor="liquidity-usd" className="block text-sm font-medium text-gray-700 mb-2">
          Liquidity Amount (USD)
        </label>
        <input
          id="liquidity-usd"
          type="number"
          value={form.liquidityUsd}
          onChange={(e) => setForm({ liquidityUsd: parseFloat(e.target.value) || 0 })}
          min="1"
          step="100"
          className="input w-full"
          placeholder="10000"
        />
        <div className="mt-2 flex space-x-2">
          {[1000, 5000, 10000, 50000].map((amount) => (
            <button
              key={amount}
              onClick={() => setForm({ liquidityUsd: amount })}
              className={`btn btn-secondary text-xs px-3 py-1 ${
                form.liquidityUsd === amount ? 'bg-primary-100 text-primary-700 border-primary-300' : ''
              }`}
            >
              {formatCurrency(amount, 0)}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bear-drop" className="block text-sm font-medium text-gray-700 mb-2">
            <TrendingDown className="w-4 h-4 inline mr-1 text-danger-600" />
            Bear Case Drop (%)
          </label>
          <input
            id="bear-drop"
            type="number"
            value={form.bearCaseDrop}
            onChange={(e) => setForm({ bearCaseDrop: parseFloat(e.target.value) || 0 })}
            min="1"
            max="90"
            step="1"
            className="input w-full"
          />
        </div>

        <div>
          <label htmlFor="bull-rise" className="block text-sm font-medium text-gray-700 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-1 text-success-600" />
            Bull Case Rise (%)
          </label>
          <input
            id="bull-rise"
            type="number"
            value={form.bullCaseRise}
            onChange={(e) => setForm({ bullCaseRise: parseFloat(e.target.value) || 0 })}
            min="1"
            max="500"
            step="1"
            className="input w-full"
          />
        </div>
      </div>

      {/* Time Horizon */}
      <div>
        <label htmlFor="time-horizon" className="block text-sm font-medium text-gray-700 mb-2">
          Time Horizon (Days)
        </label>
        <select
          id="time-horizon"
          value={form.timeHorizonDays}
          onChange={(e) => setForm({ timeHorizonDays: parseInt(e.target.value) })}
          className="input w-full"
        >
          <option value={7}>7 days</option>
          <option value={14}>2 weeks</option>
          <option value={30}>1 month</option>
          <option value={60}>2 months</option>
          <option value={90}>3 months</option>
          <option value={180}>6 months</option>
        </select>
      </div>

      {/* Advanced Options */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Options
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.advancedMode}
              onChange={(e) => setForm({ advancedMode: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Monte Carlo Simulation
                </span>
                <HelpTooltip {...HELP_CONTENT.monteCarlo} size="sm" />
              </div>
              <p className="text-xs text-gray-600">
                Run 1000 simulations using historical volatility
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.backtestMode}
              onChange={(e) => setForm({ backtestMode: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  <Activity className="w-4 h-4 inline mr-1" />
                  Historical Backtesting
                </span>
                <HelpTooltip {...HELP_CONTENT.backtesting} size="sm" />
              </div>
              <p className="text-xs text-gray-600">
                Compare LP strategy vs HODL using historical data
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!selectedPool || isAnalyzing || form.priceLower >= form.priceUpper}
        className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 loading-spinner" />
            <span>Analyzing Strategy...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Analyze LP Strategy</span>
          </div>
        )}
      </button>

      {/* Quick Info */}
      {selectedPool && (
        <div className="bg-blue-50 rounded-lg p-4 text-sm">
          <div className="font-medium text-blue-900 mb-2">Analysis Preview</div>
          <div className="space-y-1 text-blue-800">
            <div>Pool: {selectedPool.token0_symbol}/{selectedPool.token1_symbol}</div>
            <div>Range: ${form.priceLower.toFixed(6)} - ${form.priceUpper.toFixed(6)} ({formatPercentage(rangeWidth)} width)</div>
            <div>Liquidity: {formatCurrency(form.liquidityUsd)}</div>
            <div>Time Horizon: {form.timeHorizonDays} days</div>
            {(form.advancedMode || form.backtestMode) && (
              <div className="text-xs mt-2 text-blue-600">
                {form.advancedMode && '• Monte Carlo simulation enabled'}
                {form.advancedMode && form.backtestMode && <br />}
                {form.backtestMode && '• Historical backtesting enabled'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCalculatorPanel;
