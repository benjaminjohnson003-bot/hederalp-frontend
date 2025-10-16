import axios from 'axios';
import { Pool, PoolValidation, HealthStatus, AdvancedLPAnalysis, OHLCVCandle } from '../types';

// Create axios instance with base configuration
// Call backend directly - CORS is configured on backend to allow hederalp.com
const api = axios.create({
  baseURL: 'https://hederalp-backend.onrender.com',
  timeout: 30000, // 30 seconds for complex calculations
  headers: {
    'Content-Type': 'application/json',
  },
  // Follow redirects
  maxRedirects: 5,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Resource not found. Please check your inputs.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The analysis is taking longer than expected.');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// API Functions
export const apiClient = {
  // Health Check
  async getHealth(): Promise<HealthStatus> {
    const response = await api.get<HealthStatus>('/health/detailed');
    return response.data;
  },

  // Pool Management
  async getPools(): Promise<Pool[]> {
    const response = await api.get<{known_pools: Record<string, any>}>('/pools');
    // Convert the known_pools object to an array for the frontend
    // Filter out pools without valid pool_id
    const pools = Object.entries(response.data.known_pools)
      .filter(([, pool]: [string, any]) => pool.pool_id) // Only include pools with a pool_id
      .map(([name, pool]: [string, any]) => ({
        id: pool.pool_id,
        name: name,
        token0_symbol: pool.token0_symbol,
        token1_symbol: pool.token1_symbol,
        fee_tier: pool.fee_tier,
        ...pool
      }));
    return pools as Pool[];
  },

  async validatePool(poolId: string): Promise<PoolValidation> {
    const response = await api.get<{
      pool_id: string;
      test_result: string;
      transaction_count: number;
      message: string;
    }>(`/test-pool-id?pool_id=${encodeURIComponent(poolId)}`);
    
    // Transform backend response to match frontend PoolValidation interface
    const isValid = response.data.test_result === 'success';
    return {
      valid: isValid,
      pool_id: response.data.pool_id,
      error: isValid ? undefined : response.data.message,
    };
  },

  // OHLCV Data
  async getOHLCVData(
    poolId: string,
    timeframe: string = '1H',
    lookbackDays: number = 30
  ): Promise<{ candles: OHLCVCandle[] }> {
    const response = await api.get<{ ohlcv: any[] }>(
      `/ohlcv?pool_id=${encodeURIComponent(poolId)}&timeframe=${timeframe}&lookback_days=${lookbackDays}`
    );
    // Backend returns { ohlcv: [...] }, transform to { candles: [...] }
    return { candles: response.data.ohlcv || [] };
  },

  // Advanced LP Strategy Analysis
  async analyzeStrategy(params: {
    poolId: string;
    priceLower: number;
    priceUpper: number;
    liquidityUsd: number;
    bearCaseDrop?: number;
    bullCaseRise?: number;
    timeHorizonDays?: number;
    advancedMode?: boolean;
    backtestMode?: boolean;
  }): Promise<AdvancedLPAnalysis> {
    const queryParams = new URLSearchParams({
      pool_id: params.poolId,
      price_lower: params.priceLower.toString(),
      price_upper: params.priceUpper.toString(),
      liquidity_usd: params.liquidityUsd.toString(),
      bear_case_drop: (params.bearCaseDrop || 20).toString(),
      bull_case_rise: (params.bullCaseRise || 20).toString(),
      time_horizon_days: (params.timeHorizonDays || 30).toString(),
      advanced_mode: (params.advancedMode || false).toString(),
      backtest_mode: (params.backtestMode || false).toString(),
    });

    const response = await api.get<AdvancedLPAnalysis>(`/advanced-lp-strategy?${queryParams}`);
    return response.data;
  },

  // Range Comparison with Charts
  async getRangeComparison(params: {
    poolId: string;
    ranges: string; // comma-separated ranges like "0.22-0.26,0.20-0.28"
    liquidityUsd: number;
  }) {
    const queryParams = new URLSearchParams({
      pool_id: params.poolId,
      ranges: params.ranges,
      liquidity_usd: params.liquidityUsd.toString(),
    });

    const response = await api.get(`/range-comparison-chart?${queryParams}`);
    return response.data;
  },

  // Liquidity Distribution for depth chart
  async getLiquidityDistribution(poolId: string, pricePoints: number = 100): Promise<any> {
    const response = await api.get(
      `/liquidity-distribution?pool_id=${encodeURIComponent(poolId)}&price_points=${pricePoints}`
    );
    return response.data;
  },

  // Test endpoints for debugging
  async testPool(poolId: string) {
    const response = await api.get(`/test-any-pool?pool_id=${encodeURIComponent(poolId)}&lookback_days=7`);
    return response.data;
  },

  async findActivePools() {
    const response = await api.get('/find-active-pools');
    return response.data;
  },
};

// Utility functions for API data processing
export const formatCurrency = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const getRiskLevel = (value: number, thresholds: { low: number; medium: number }): 'low' | 'medium' | 'high' => {
  if (value <= thresholds.low) return 'low';
  if (value <= thresholds.medium) return 'medium';
  return 'high';
};

export const getRiskColor = (level: 'low' | 'medium' | 'high'): string => {
  switch (level) {
    case 'low':
      return 'text-success-600 bg-success-100';
    case 'medium':
      return 'text-warning-600 bg-warning-100';
    case 'high':
      return 'text-danger-600 bg-danger-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
