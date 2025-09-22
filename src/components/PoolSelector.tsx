import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useLPStrategyStore } from '../store/lpStrategyStore';
import { apiClient, formatCurrency, formatPercentage } from '../utils/api';
import { Pool, PoolValidation } from '../types';

const PoolSelector: React.FC = () => {
  const { form, setForm, selectedPool, setSelectedPool, availablePools, setAvailablePools } = useLPStrategyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PoolValidation | null>(null);

  // Fetch available pools
  const { data, isLoading: poolsLoading } = useQuery<Pool[]>({
    queryKey: ['pools'],
    queryFn: apiClient.getPools,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update available pools when data changes
  React.useEffect(() => {
    if (data) {
      setAvailablePools(data);
    }
  }, [data, setAvailablePools]);

  // Filter pools based on search query
  const filteredPools = availablePools.filter((pool) =>
    pool.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${pool.token0_symbol}/${pool.token1_symbol}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Validate pool when form.poolId changes
  useEffect(() => {
    if (form.poolId && form.poolId.length > 5) {
      validatePool(form.poolId);
    } else {
      setValidationResult(null);
    }
  }, [form.poolId]);

  const validatePool = async (poolId: string) => {
    try {
      setIsValidating(true);
      const result = await apiClient.validatePool(poolId);
      setValidationResult(result);
      
      if (result.valid && result.pool_info) {
        setSelectedPool(result.pool_info);
      } else {
        setSelectedPool(null);
      }
    } catch (error) {
      console.error('Pool validation error:', error);
      setValidationResult({
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      });
      setSelectedPool(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handlePoolSelect = (pool: Pool) => {
    setForm({ poolId: pool.id });
    setSelectedPool(pool);
    setSearchQuery('');
    setValidationResult({ valid: true, pool_id: pool.id, pool_info: pool });
  };

  const handleManualInput = (value: string) => {
    setForm({ poolId: value });
    setSearchQuery('');
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
    if (validationResult?.valid) {
      return <CheckCircle className="w-4 h-4 text-success-600" />;
    }
    if (validationResult?.error) {
      return <AlertCircle className="w-4 h-4 text-danger-600" />;
    }
    return <Search className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Pool Input */}
      <div className="relative">
        <label htmlFor="pool-input" className="block text-sm font-medium text-gray-700 mb-2">
          Pool ID or Search
        </label>
        <div className="relative">
          <input
            id="pool-input"
            type="text"
            value={searchQuery || form.poolId}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              if (!value.includes('/')) {
                // If not searching by symbol, update form directly
                handleManualInput(value);
              }
            }}
            placeholder="Enter pool ID (e.g., 0.0.3964804) or search USDC/HBAR"
            className={`input w-full pl-10 pr-10 ${
              validationResult?.valid 
                ? 'border-success-300 focus:ring-success-500' 
                : validationResult?.error 
                ? 'border-danger-300 focus:ring-danger-500' 
                : ''
            }`}
            aria-describedby="pool-validation-status"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {getValidationIcon()}
          </div>
          {selectedPool && (
            <a
              href={`https://hashscan.io/mainnet/contract/${selectedPool.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-600"
              aria-label="View on Hashscan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Validation Status */}
        {validationResult && (
          <div
            id="pool-validation-status"
            className={`mt-2 text-sm ${
              validationResult.valid ? 'text-success-600' : 'text-danger-600'
            }`}
            role="status"
            aria-live="polite"
          >
            {validationResult.valid ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Valid pool found: {validationResult.pool_info?.token0_symbol}/{validationResult.pool_info?.token1_symbol}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationResult.error || 'Invalid pool ID'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pool Suggestions Dropdown */}
      {searchQuery && filteredPools.length > 0 && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">
                {filteredPools.length} pool{filteredPools.length !== 1 ? 's' : ''} found
              </div>
              {filteredPools.slice(0, 10).map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => handlePoolSelect(pool)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {pool.token0_symbol}/{pool.token1_symbol}
                      </div>
                      <div className="text-sm text-gray-500">{pool.id}</div>
                      <div className="text-xs text-gray-400">
                        Fee: {pool.fee_tier}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {pool.tvl_usd && (
                        <div>TVL: {formatCurrency(pool.tvl_usd, 0)}</div>
                      )}
                      {pool.apr && (
                        <div className="text-xs text-success-600">
                          APR: {formatPercentage(pool.apr)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Pool Info */}
      {selectedPool && validationResult?.valid && (
        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedPool.token0_symbol}/{selectedPool.token1_symbol}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Pool ID: {selectedPool.id}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="badge badge-primary">
                  Fee: {selectedPool.fee_tier}
                </span>
                {selectedPool.tvl_usd && (
                  <span className="text-gray-600">
                    TVL: {formatCurrency(selectedPool.tvl_usd, 0)}
                  </span>
                )}
                {selectedPool.volume_24h_usd && (
                  <span className="text-gray-600">
                    24h Vol: {formatCurrency(selectedPool.volume_24h_usd, 0)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="badge badge-success">Active</span>
              <a
                href={`https://hashscan.io/mainnet/contract/${selectedPool.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600"
                aria-label="View pool on Hashscan"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {poolsLoading && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 mx-auto text-gray-400 animate-spin" />
          <p className="text-sm text-gray-600 mt-2">Loading available pools...</p>
        </div>
      )}

      {/* No Pools Found */}
      {!poolsLoading && availablePools.length === 0 && (
        <div className="text-center py-4 text-gray-600">
          <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm">No pools available. Check API connection.</p>
        </div>
      )}
    </div>
  );
};

export default PoolSelector;
