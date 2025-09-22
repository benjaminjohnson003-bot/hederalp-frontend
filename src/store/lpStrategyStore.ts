import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { LPStrategyForm, AdvancedLPAnalysis, UIState, Pool } from '../types';

interface LPStrategyStore {
  // Form State
  form: LPStrategyForm;
  setForm: (updates: Partial<LPStrategyForm>) => void;
  resetForm: () => void;
  
  // Results State
  results: AdvancedLPAnalysis | null;
  setResults: (results: AdvancedLPAnalysis | null) => void;
  
  // Pool State
  selectedPool: Pool | null;
  setSelectedPool: (pool: Pool | null) => void;
  availablePools: Pool[];
  setAvailablePools: (pools: Pool[]) => void;
  
  // UI State
  ui: UIState;
  setUI: (updates: Partial<UIState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedTab: (tab: UIState['selectedTab']) => void;
  
  // Chart State
  chartData: Record<string, any>;
  setChartData: (chartId: string, data: any) => void;
}

const defaultForm: LPStrategyForm = {
  poolId: '0.0.3964804',
  priceLower: 0.22,
  priceUpper: 0.26,
  liquidityUsd: 10000,
  bearCaseDrop: 20,
  bullCaseRise: 20,
  timeHorizonDays: 30,
  advancedMode: false,
  backtestMode: false,
};

const defaultUI: UIState = {
  isLoading: false,
  error: null,
  selectedTab: 'scenarios',
};

export const useLPStrategyStore = create<LPStrategyStore>()(
  devtools(
    (set) => ({
      // Form State
      form: defaultForm,
      setForm: (updates) =>
        set(
          (state) => ({
            form: { ...state.form, ...updates },
          }),
          false,
          'setForm'
        ),
      resetForm: () => set({ form: defaultForm }, false, 'resetForm'),

      // Results State
      results: null,
      setResults: (results) => set({ results }, false, 'setResults'),

      // Pool State
      selectedPool: null,
      setSelectedPool: (pool) => set({ selectedPool: pool }, false, 'setSelectedPool'),
      availablePools: [],
      setAvailablePools: (pools) => set({ availablePools: pools }, false, 'setAvailePools'),

      // UI State
      ui: defaultUI,
      setUI: (updates) =>
        set(
          (state) => ({
            ui: { ...state.ui, ...updates },
          }),
          false,
          'setUI'
        ),
      setLoading: (isLoading) =>
        set(
          (state) => ({
            ui: { ...state.ui, isLoading },
          }),
          false,
          'setLoading'
        ),
      setError: (error) =>
        set(
          (state) => ({
            ui: { ...state.ui, error },
          }),
          false,
          'setError'
        ),
      setSelectedTab: (selectedTab) =>
        set(
          (state) => ({
            ui: { ...state.ui, selectedTab },
          }),
          false,
          'setSelectedTab'
        ),

      // Chart State
      chartData: {},
      setChartData: (chartId, data) =>
        set(
          (state) => ({
            chartData: { ...state.chartData, [chartId]: data },
          }),
          false,
          'setChartData'
        ),
    }),
    {
      name: 'lp-strategy-store',
    }
  )
);
