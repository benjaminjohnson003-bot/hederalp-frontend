import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Minus, AlertCircle, Info, BarChart3, RefreshCw } from 'lucide-react';
import { useLPStrategyStore } from '../store/lpStrategyStore';
import { apiClient } from '../utils/api';

const FeeCalculatorPanel: React.FC = () => {
  const { form, setForm, selectedPool, setResults, setLoading, setError } = useLPStrategyStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [currentAPR, setCurrentAPR] = useState<number | null>(null);
  const [isPriceInverted, setIsPriceInverted] = useState(false);

  // Fetch current price and APR when pool is selected
  useEffect(() => {
    if (selectedPool) {
      // Try to get real current price from recent OHLCV data
      apiClient.getOHLCVData(selectedPool.id, '1H', 1)
        .then(data => {
          if (data.candles && data.candles.length > 0) {
            const latestPrice = data.candles[data.candles.length - 1].close;
            setCurrentPrice(latestPrice);
            
            // Set default range around current price if not already set
            if (form.priceLower === 0.22 && form.priceUpper === 0.26) {
              const lower = latestPrice * 0.9; // -10%
              const upper = latestPrice * 1.1; // +10%
              setForm({ priceLower: lower, priceUpper: upper });
            }
          }
        })
        .catch(err => console.error('Failed to fetch current price:', err));
      
      // Get APR from pool data if available
      if (selectedPool.apr) {
        setCurrentAPR(selectedPool.apr);
      }
    }
  }, [selectedPool]);

  // Get display price (inverted or not)
  const getDisplayPrice = (price: number) => {
    return isPriceInverted ? (1 / price) : price;
  };

  // Get token labels based on inversion
  const getTokenLabels = () => {
    if (!selectedPool) return { base: '', quote: '' };
    if (isPriceInverted) {
      return {
        base: selectedPool.token0_symbol,
        quote: selectedPool.token1_symbol,
      };
    }
    return {
      base: selectedPool.token1_symbol,
      quote: selectedPool.token0_symbol,
    };
  };

  const handleAnalyze = async () => {
    if (!selectedPool) {
      setError('Please select a valid pool first');
      return;
    }

    if (form.priceLower >= form.priceUpper) {
      setError('Min price must be less than max price');
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

  const rangeWidth = currentPrice > 0 ? ((form.priceUpper - form.priceLower) / currentPrice) * 100 : 0;
  const pricePosition = currentPrice > 0 ? ((currentPrice - form.priceLower) / (form.priceUpper - form.priceLower)) * 100 : 50;
  const isInRange = currentPrice >= form.priceLower && currentPrice <= form.priceUpper;

  // Quick preset buttons
  const setRangePreset = (percentage: number) => {
    if (currentPrice > 0) {
      const lower = currentPrice * (1 - percentage / 100);
      const upper = currentPrice * (1 + percentage / 100);
      setForm({ priceLower: lower, priceUpper: upper });
    }
  };

  const tokenLabels = getTokenLabels();

  return (
    <div className="space-y-6">
      {/* Current Price Display */}
      {selectedPool && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-sm text-gray-600">Current Price</div>
                <button
                  onClick={() => setIsPriceInverted(!isPriceInverted)}
                  className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                  title="Invert price"
                >
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                </button>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {currentPrice > 0 ? getDisplayPrice(currentPrice).toFixed(6) : '...'}{' '}
                <span className="text-lg text-gray-600">
                  {tokenLabels.base} per {tokenLabels.quote}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Pool</div>
              <div className="text-xl font-semibold text-gray-900">
                {selectedPool.token0_symbol}/{selectedPool.token1_symbol}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Fee: {selectedPool.fee_tier || '0.15%'}
              </div>
            </div>
          </div>
          
          {/* APR Display */}
          {currentAPR !== null && (
            <div className="pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Current APR</div>
                <div className="text-2xl font-bold text-green-600">
                  {currentAPR.toFixed(2)}%
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Based on recent trading volume and fees
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Price Range Selector */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
          Set Price Range
        </h3>

        {/* Visual Range Display */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="relative h-32 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded-lg overflow-hidden">
            {/* Current Price Indicator */}
            {currentPrice > 0 && isInRange && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-green-500 z-10"
                style={{ left: `${Math.max(0, Math.min(100, pricePosition))}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Current: {currentPrice.toFixed(4)}
                </div>
              </div>
            )}
            
            {/* Range Boundaries */}
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-purple-500">
              <div className="absolute -top-6 left-0 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                Min
              </div>
            </div>
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-cyan-500">
              <div className="absolute -top-6 right-0 bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                Max
              </div>
            </div>

            {/* Range Info */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm">
                <div className="text-sm font-medium text-gray-900">
                  Range Width: ±{(rangeWidth / 2).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setRangePreset(5)}
              className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ±5%
            </button>
            <button
              onClick={() => setRangePreset(10)}
              className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ±10%
            </button>
            <button
              onClick={() => setRangePreset(20)}
              className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ±20%
            </button>
            <button
              onClick={() => setRangePreset(30)}
              className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ±30%
            </button>
          </div>
        </div>

        {/* Price Range Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price
            </label>
            <div className="relative">
              <input
                type="number"
                value={form.priceLower}
                onChange={(e) => setForm({ priceLower: parseFloat(e.target.value) || 0 })}
                step="0.0001"
                className="input w-full text-lg font-mono"
                placeholder="0.0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setForm({ priceLower: form.priceLower * 0.95 })}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setForm({ priceLower: form.priceLower * 1.05 })}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {tokenLabels.base} per {tokenLabels.quote}
            </div>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price
            </label>
            <div className="relative">
              <input
                type="number"
                value={form.priceUpper}
                onChange={(e) => setForm({ priceUpper: parseFloat(e.target.value) || 0 })}
                step="0.0001"
                className="input w-full text-lg font-mono"
                placeholder="0.0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setForm({ priceUpper: form.priceUpper * 0.95 })}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setForm({ priceUpper: form.priceUpper * 1.05 })}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {tokenLabels.base} per {tokenLabels.quote}
            </div>
          </div>
        </div>

        {/* Warning if out of range */}
        {currentPrice > 0 && !isInRange && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Warning:</strong> Current price ({currentPrice.toFixed(4)}) is outside your selected range. 
              Your position will not earn fees until the price moves into range.
            </div>
          </div>
        )}

        {/* Info box */}
        {isInRange && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
            <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <strong>In Range:</strong> Your position will earn fees at the current price.
            </div>
          </div>
        )}
      </div>

      {/* Liquidity Amount */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Liquidity Amount (USD)
        </label>
        <input
          type="number"
          value={form.liquidityUsd}
          onChange={(e) => setForm({ liquidityUsd: parseFloat(e.target.value) || 0 })}
          className="input w-full text-xl font-semibold"
          placeholder="10000"
        />
        <div className="text-xs text-gray-500 mt-1">
          Total value of tokens to provide as liquidity
        </div>
      </div>

      {/* Analysis Parameters (Collapsible) */}
      <details className="card">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-4">
          Advanced Settings (Optional)
        </summary>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Horizon (Days)
            </label>
            <input
              type="number"
              value={form.timeHorizonDays}
              onChange={(e) => setForm({ timeHorizonDays: parseInt(e.target.value) || 30 })}
              className="input w-full"
              min="1"
              max="365"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bear Case Drop (%)
              </label>
              <input
                type="number"
                value={form.bearCaseDrop}
                onChange={(e) => setForm({ bearCaseDrop: parseFloat(e.target.value) || 20 })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bull Case Rise (%)
              </label>
              <input
                type="number"
                value={form.bullCaseRise}
                onChange={(e) => setForm({ bullCaseRise: parseFloat(e.target.value) || 20 })}
                className="input w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.advancedMode}
                onChange={(e) => setForm({ advancedMode: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Enable Monte Carlo Simulation</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.backtestMode}
                onChange={(e) => setForm({ backtestMode: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Enable Historical Backtesting</span>
            </label>
          </div>
        </div>
      </details>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!selectedPool || isAnalyzing || form.priceLower >= form.priceUpper}
        className="btn btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 loading-spinner" />
            <span>Analyzing Strategy...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Calculator className="w-6 h-6" />
            <span>Analyze LP Strategy</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default FeeCalculatorPanel;
