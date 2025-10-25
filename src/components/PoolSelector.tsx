import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Loader2, ExternalLink, TrendingUp, Droplet } from 'lucide-react';
import { useLPStrategyStore } from '../store/lpStrategyStore';
import { apiClient, formatCurrency, formatPercentage } from '../utils/api';
import { Pool } from '../types';

const PoolSelector: React.FC = () => {
  const { form, setForm, selectedPool, setSelectedPool, availablePools, setAvailablePools } = useLPStrategyStore();

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
      
      // Auto-select first pool if none selected
      if (!form.poolId && combined.length > 0) {
        handlePoolSelect(combined[0]);
      }
    }
  }, [knownPools, allPools, setAvailablePools]);

  const handlePoolSelect = (pool: Pool) => {
    setForm({ poolId: pool.id });
    setSelectedPool(pool);
  };

  // Get top 10 pools for display
  const topPools = availablePools.slice(0, 10);

  if (poolsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading pools...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Droplet className="w-5 h-5 mr-2 text-primary-600" />
          Select Liquidity Pool
        </h3>
        <span className="text-sm text-gray-500">
          Top {topPools.length} pools by TVL
        </span>
      </div>

      {/* Pool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topPools.map((pool) => {
          const isSelected = selectedPool?.id === pool.id;
          
          return (
            <button
              key={pool.id}
              onClick={() => handlePoolSelect(pool)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 text-left min-h-[160px] flex flex-col
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-200' 
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                }
              `}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                </div>
              )}

              {/* Pool Name */}
              <div className="mb-3 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`text-lg font-bold ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                    {pool.token0_symbol}/{pool.token1_symbol}
                  </h4>
                  {pool.fee_tier && (
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                      isSelected ? 'bg-primary-200 text-primary-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {pool.fee_tier}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono truncate">
                  {pool.id}
                </div>
              </div>

              {/* Pool Stats - Vertical layout to prevent overlap */}
              <div className="space-y-3 text-sm mb-3">
                {/* TVL */}
                {pool.tvl_usd !== undefined && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">TVL</div>
                    <div className={`font-semibold ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                      {formatCurrency(pool.tvl_usd, 0)}
                    </div>
                  </div>
                )}

                {/* APR */}
                {pool.apr !== undefined && pool.apr > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      APR
                    </div>
                    <div className="font-semibold text-success-600">
                      {formatPercentage(pool.apr)}
                    </div>
                  </div>
                )}

                {/* 24h Volume */}
                {pool.volume_24h_usd !== undefined && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">24h Volume</div>
                    <div className={`font-medium ${isSelected ? 'text-primary-800' : 'text-gray-700'}`}>
                      {formatCurrency(pool.volume_24h_usd, 0)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Spacer to push link to bottom */}
              <div className="flex-grow"></div>

              {/* View on Hashscan Link */}
              <a
                href={`https://hashscan.io/mainnet/contract/${pool.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`
                  mt-3 flex items-center text-xs transition-colors
                  ${isSelected ? 'text-primary-600 hover:text-primary-700' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View on Hashscan
              </a>
            </button>
          );
        })}
      </div>

      {/* Selected Pool Summary */}
      {selectedPool && (
        <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-primary-900 mb-1">
                Selected Pool
              </div>
              <div className="text-lg font-bold text-primary-900">
                {selectedPool.token0_symbol}/{selectedPool.token1_symbol}
              </div>
              <div className="text-xs text-primary-700 mt-1">
                {selectedPool.id}
              </div>
            </div>
            <CheckCircle className="w-6 h-6 text-primary-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolSelector;
