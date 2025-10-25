import React from 'react';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { Pool } from '../types';
import { formatCurrency, formatPercentage } from '../utils/api';

interface PoolGridProps {
  pools: Pool[];
  selectedPoolId?: string;
  onPoolSelect: (pool: Pool) => void;
  isLoading?: boolean;
}

// Loading skeleton for pool cards
const PoolSkeleton: React.FC = () => (
  <div className="p-4 rounded-lg border-2 border-gray-200 bg-white animate-pulse">
    <div className="mb-3">
      <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-40"></div>
    </div>
    <div className="space-y-2.5">
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-12"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-12"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const PoolGrid: React.FC<PoolGridProps> = ({ pools, selectedPoolId, onPoolSelect, isLoading = false }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Select Liquidity Pool
        </h3>
        {!isLoading && <span className="text-xs text-gray-500">Top {pools.length} pools by TVL</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading ? (
          // Show skeleton loaders while loading
          Array.from({ length: 6 }).map((_, i) => <PoolSkeleton key={i} />)
        ) : (
          pools.map((pool) => {
          const isSelected = pool.id === selectedPoolId;
          const pairName = `${pool.token0_symbol}/${pool.token1_symbol}`;

          return (
            <button
              key={pool.id}
              onClick={() => onPoolSelect(pool)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 text-left min-h-[200px] flex flex-col
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                }
              `}
              aria-label={`Select ${pairName} pool`}
            >
              {/* Checkmark for selected pool */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}

              {/* Pool Name */}
              <div className="mb-5">
                <h4 className="font-semibold text-gray-900 text-lg pr-8">
                  {pairName}
                </h4>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-xs text-gray-600">
                    {pool.fee_tier}
                  </span>
                  <span className="text-xs text-gray-400 truncate">{pool.id}</span>
                </div>
              </div>

              {/* Pool Stats - Vertical layout to prevent overlap */}
              <div className="space-y-3 flex-1">
                {/* TVL */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">TVL</span>
                  <span className="text-sm font-medium text-gray-900">
                    {pool.tvl_usd && pool.tvl_usd > 0 ? formatCurrency(pool.tvl_usd, 0) : 'N/A'}
                  </span>
                </div>

                {/* APR */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">APR</span>
                  <span className={`text-sm font-semibold ${
                    pool.apr && pool.apr > 0 ? 'text-success-600' : 'text-gray-400'
                  }`}>
                    {pool.apr && pool.apr > 0 ? formatPercentage(pool.apr) : 'N/A'}
                  </span>
                </div>

                {/* 24h Volume */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">24h Volume</span>
                  <span className="text-sm text-gray-700">
                    {pool.volume_24h_usd && pool.volume_24h_usd > 0 ? formatCurrency(pool.volume_24h_usd, 0) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Hashscan Link - Always at bottom */}
              <div className="mt-auto pt-3 border-t border-gray-100">
                <a
                  href={`https://hashscan.io/mainnet/contract/${pool.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center text-xs text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View on Hashscan
                </a>
              </div>
            </button>
          );
        })
        )}
      </div>
    </div>
  );
};

export default PoolGrid;

