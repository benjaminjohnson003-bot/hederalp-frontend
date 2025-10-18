// API Response Types
export interface Pool {
  id: string;
  token0_symbol: string;
  token1_symbol: string;
  fee_tier: string;
  tvl_usd?: number;
  volume_24h_usd?: number;
  apr?: number;
}

export interface PoolValidation {
  valid: boolean;
  pool_id?: string;
  error?: string;
  pool_info?: Pool;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  components?: {
    mirror_node: { status: string; response_time?: number };
    saucerswap_api: { status: string; response_time?: number };
    cache: { status: string };
  };
}

export interface OHLCVCandle {
  timestamp: number; // Unix timestamp in seconds
  datetime?: string; // Optional ISO datetime string
  open: number;
  high: number;
  low: number;
  close: number;
  volume_usd: number;
  volume_token0?: number;
  volume_token1?: number;
  trade_count?: number;
  timeframe?: string;
}

export interface ScenarioAnalysis {
  scenario: string;
  final_price: number;
  probability: number;
  in_range: boolean;
  fees_earned_usd: number;
  impermanent_loss_percent: number;
  impermanent_loss_usd: number;
  net_return_usd: number;
  lp_vs_hodl: {
    lp_return_usd: number;
    hodl_return_usd: number;
    advantage_usd: number;
  };
}

export interface MonteCarloResults {
  trials_run: number;
  expected_net_return_usd: number;
  expected_advantage_vs_hodl_usd: number;
  value_at_risk_5th_percentile_usd: number;
  value_at_risk_95th_percentile_usd: number;
  probability_of_profit: number;
  probability_beats_hodl: number;
  volatility_used: number;
  price_distribution: {
    min: number;
    max: number;
    median: number;
    percentile_10: number;
    percentile_90: number;
  };
}

export interface BacktestSummary {
  total_periods_tested: number;
  average_utilization_rate: number;
  average_net_return_per_period: number;
  average_hodl_return_per_period: number;
  profitable_periods_percent: number;
  beat_hodl_periods_percent: number;
  best_period_return: number;
  worst_period_return: number;
  cumulative_advantage_vs_hodl: number;
}

export interface BacktestResults {
  summary: BacktestSummary;
  detailed_results: Array<{
    period_start: string;
    start_price: number;
    end_price: number;
    utilization_rate: number;
    fees_earned: number;
    impermanent_loss: number;
    net_return: number;
    hodl_return: number;
    advantage: number;
  }>;
}

export interface CapitalEfficiency {
  range_width_percent: number;
  utilization_rate_percent: number;
  capital_efficiency_score: number;
  days_analyzed: number;
  recommendation: string;
}

export interface AdvancedLPAnalysis {
  strategy_analysis: {
    pool_id: string;
    pool_name: string;
    current_price: number;
    selected_range: {
      lower: number;
      upper: number;
      width_percent: number;
    };
    liquidity_amount_usd: number;
    time_horizon_days: number;
    analysis_date: string;
  };
  scenario_analysis: ScenarioAnalysis[];
  capital_efficiency: CapitalEfficiency;
  market_context: {
    historical_volatility_daily: number;
    average_daily_volume_usd: number;
    fee_rate_percent: number;
    data_points_analyzed: number;
    pool_apr?: {
      saucerswap_pool_apr?: number;
      estimated_position_apr: number;
      concentration_multiplier: number;
      note: string;
    };
  };
  monte_carlo_simulation?: MonteCarloResults;
  backtesting?: BacktestResults;
}

// Form Types
export interface LPStrategyForm {
  poolId: string;
  priceLower: number;
  priceUpper: number;
  liquidityUsd: number;
  bearCaseDrop: number;
  bullCaseRise: number;
  timeHorizonDays: number;
  advancedMode: boolean;
  backtestMode: boolean;
}

// UI State Types
export type RiskLevel = 'low' | 'medium' | 'high';

export interface UIState {
  isLoading: boolean;
  error: string | null;
  selectedTab: 'scenarios' | 'advanced' | 'backtest' | 'efficiency';
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

// Export Options
export interface ExportOptions {
  format: 'csv' | 'png' | 'pdf';
  data: 'table' | 'chart' | 'all';
}

