import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useLPStrategyStore } from '../store/lpStrategyStore';
import { apiClient, formatCurrency, formatPercentage } from '../utils/api';
import { Pool, PoolValidation } from '../types';

const PoolSelector: React.FC = () => {
  const { form, setForm, selectedPool, setSelectedPool, availablePools, setAvailablePools } = useLPStrategyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PoolValidation | null>(null);

  // Fetch known pools (fallback/priority pools)
  const { data: knownPools } = useQuery<Pool[]>({
    queryKey: ['known-pools'],
    queryFn: apiClient.getPools,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all available pools from SaucerSwap (top 50 by TVL)
  const { data: allPools, isLoading: poolsLoading } = useQuery<Pool[]>({
    queryKey: ['all-pools'],
    queryFn: () => apiClient.getAllPools(50, 'tvl'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine and deduplicate pools (prioritize known pools, then add others)
  React.useEffect(() => {
    const combined: Pool[] = [];
    const seenIds = new Set<string>();

    // Add known pools first (these are verified and should always be available)
    if (knownPools) {
      knownPools.forEach(pool => {
        if (pool.id && !seenIds.has(pool.id)) {
          combined.push(pool);
          seenIds.add(pool.id);
        }
      });
    }

    // Add pools from SaucerSwap API
    if (allPools) {
      allPools.forEach(pool => {
        if (pool.id && !seenIds.has(pool.id)) {
          combined.push(pool);
          seenIds.add(pool.id);
        }
      });
    }

    if (combined.length > 0) {
      setAvailablePools(combined);
    }
  }, [knownPools, allPools, setAvailablePools]);

  // Filter pools based on search query
  const filteredPools = availablePools.filter((pool) =>
    pool.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${pool.token0_symbol}/${pool.token1_symbol}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Validate pool when form.poolId changes (but only if manually typed)
  useEffect(() => {
    // Skip validation if this pool is already in our known/fetched pools
    const knownPool = availablePools.find(p => p.id === form.poolId);
    if (knownPool) {
      // It's a known pool, mark as valid immediately
      setValidationResult({ valid: true, pool_id: knownPool.id, pool_info: knownPool });
      setSelectedPool(knownPool);
      return;
    }
    
    // Only validate manually entered pool IDs
    if (form.poolId && form.poolId.length > 5 && searchQuery === form.poolId) {
      validatePool(form.poolId);
    } else if (!form.poolId) {
      setValidationResult(null);
    }
  }, [form.poolId, availablePools, searchQuery]);

  const validatePool = async (poolId: string) => {
    try {
      setIsValidating(true);
      const result = await apiClient.validatePool(poolId);
      setValidationResult(result);
      
      if (result.valid && result.pool_id) {
        // Find the full pool info from available pools
        const fullPoolInfo = availablePools.find(p => p.id === result.pool_id);
        if (fullPoolInfo) {
          setSelectedPool(fullPoolInfo);
          // Update validation result with pool info
          setValidationResult({ ...result, pool_info: fullPoolInfo });
        } else {
          // Pool is valid but not in our known pools list - still set it
          setSelectedPool({
            id: result.pool_id,
            name: result.pool_id,
            token0_symbol: 'Unknown',
            token1_symbol: 'Unknown',
            fee_tier: 'Unknown',
          } as Pool);
        }
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
    if (poolsLoading) {
      return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
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
              setShowDropdown(true);
              if (!value.includes('/')) {
                // If not searching by symbol, update form directly
                handleManualInput(value);
              }
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
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
      {showDropdown && filteredPools.length > 0 && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2 px-2">
                <span>{filteredPools.length} pool{filteredPools.length !== 1 ? 's' : ''} found (sorted by TVL)</span>
                {filteredPools.length > 10 && (
                  <span className="text-primary-600">Showing top 10</span>
                )}
              </div>
              {filteredPools.slice(0, 10).map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => handlePoolSelect(pool)}
                  className="w-full text-left p-3 hover:bg-primary-50 rounded-lg transition-colors duration-150 border border-transparent hover:border-primary-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 mb-1">
                        {pool.token0_symbol}/{pool.token1_symbol}
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {pool.fee_tier}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{pool.id}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {pool.tvl_usd !== undefined && (
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(pool.tvl_usd, 0)}
                        </div>
                      )}
                      {pool.volume_24h_usd !== undefined && (
                        <div className="text-xs text-gray-600">
                          Vol: {formatCurrency(pool.volume_24h_usd, 0)}
                        </div>
                      )}
                      {pool.apr !== undefined && pool.apr > 0 && (
                        <div className="text-xs font-medium text-success-600">
                          {formatPercentage(pool.apr)} APR
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
