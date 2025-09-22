import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { LPStrategyForm, AdvancedLPAnalysis, UIState, Pool } from '../types';

interface PerformanceMetrics {
  analysesRun: number;
  lastAnalysisTime: number | null;
  averageAnalysisTime: number;
  cacheHitRate: number;
  totalCacheHits: number;
  totalCacheMisses: number;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultTimeframe: string;
  autoSave: boolean;
  exportFormat: 'csv' | 'json' | 'pdf';
  chartAnimations: boolean;
  cacheExpiry: number; // minutes
  maxCacheSize: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface EnhancedLPStrategyStore {
  // Core State (existing)
  form: LPStrategyForm;
  results: AdvancedLPAnalysis | null;
  selectedPool: Pool | null;
  availablePools: Pool[];
  ui: UIState;
  chartData: Record<string, any>;

  // Enhanced State
  preferences: UserPreferences;
  cache: {
    analyses: Map<string, CacheEntry<AdvancedLPAnalysis>>;
    pools: CacheEntry<Pool[]> | null;
    ohlcv: Map<string, CacheEntry<any>>;
  };
  performance: PerformanceMetrics;
  
  // Core Actions (existing)
  setForm: (updates: Partial<LPStrategyForm>) => void;
  resetForm: () => void;
  setResults: (results: AdvancedLPAnalysis | null) => void;
  setSelectedPool: (pool: Pool | null) => void;
  setAvailablePools: (pools: Pool[]) => void;
  setUI: (updates: Partial<UIState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedTab: (tab: UIState['selectedTab']) => void;
  setChartData: (chartId: string, data: any) => void;

  // Enhanced Actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  
  // Cache Management
  getCachedAnalysis: (key: string) => AdvancedLPAnalysis | null;
  setCachedAnalysis: (key: string, data: AdvancedLPAnalysis) => void;
  getCachedPools: () => Pool[] | null;
  setCachedPools: (pools: Pool[]) => void;
  getCachedOHLCV: (key: string) => any | null;
  setCachedOHLCV: (key: string, data: any) => void;
  clearCache: () => void;
  pruneCache: () => void;
  
  // Performance Tracking
  trackAnalysis: (duration: number) => void;
  trackCacheHit: () => void;
  trackCacheMiss: () => void;
  getPerformanceStats: () => PerformanceMetrics;
  
  // Utility Methods
  generateCacheKey: (poolId: string, form: Partial<LPStrategyForm>) => string;
  isDataStale: (timestamp: number) => boolean;
  optimizeState: () => void;
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

const defaultPreferences: UserPreferences = {
  theme: 'light',
  defaultTimeframe: '1H',
  autoSave: true,
  exportFormat: 'csv',
  chartAnimations: true,
  cacheExpiry: 30, // 30 minutes
  maxCacheSize: 100, // 100 entries
};

const defaultPerformance: PerformanceMetrics = {
  analysesRun: 0,
  lastAnalysisTime: null,
  averageAnalysisTime: 0,
  cacheHitRate: 0,
  totalCacheHits: 0,
  totalCacheMisses: 0,
};

export const useEnhancedLPStore = create<EnhancedLPStrategyStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        (set, get) => ({
          // Core State
          form: defaultForm,
          results: null,
          selectedPool: null,
          availablePools: [],
          ui: defaultUI,
          chartData: {},

          // Enhanced State
          preferences: defaultPreferences,
          cache: {
            analyses: new Map(),
            pools: null,
            ohlcv: new Map(),
          },
          performance: defaultPerformance,

          // Core Actions
          setForm: (updates) =>
            set((state) => ({
              form: { ...state.form, ...updates },
            })),

          resetForm: () =>
            set({ form: defaultForm }),

          setResults: (results) =>
            set({ results }),

          setSelectedPool: (pool) =>
            set({ selectedPool: pool }),

          setAvailablePools: (pools) =>
            set({ availablePools: pools }),

          setUI: (updates) =>
            set((state) => ({
              ui: { ...state.ui, ...updates },
            })),

          setLoading: (isLoading) =>
            set((state) => ({
              ui: { ...state.ui, isLoading },
            })),

          setError: (error) =>
            set((state) => ({
              ui: { ...state.ui, error },
            })),

          setSelectedTab: (selectedTab) =>
            set((state) => ({
              ui: { ...state.ui, selectedTab },
            })),

          setChartData: (chartId, data) =>
            set((state) => ({
              chartData: { ...state.chartData, [chartId]: data },
            })),

          // Enhanced Actions
          updatePreferences: (updates) =>
            set((state) => ({
              preferences: { ...state.preferences, ...updates },
            })),

          // Cache Management
          generateCacheKey: (poolId, form) => {
            const keyData = {
              poolId,
              priceLower: form.priceLower,
              priceUpper: form.priceUpper,
              liquidityUsd: form.liquidityUsd,
              bearCaseDrop: form.bearCaseDrop,
              bullCaseRise: form.bullCaseRise,
              timeHorizonDays: form.timeHorizonDays,
              advancedMode: form.advancedMode,
              backtestMode: form.backtestMode,
            };
            return btoa(JSON.stringify(keyData));
          },

          isDataStale: (timestamp) => {
            const { cacheExpiry } = get().preferences;
            const expiryMs = cacheExpiry * 60 * 1000;
            return Date.now() - timestamp > expiryMs;
          },

          getCachedAnalysis: (key) => {
            const { analyses } = get().cache;
            const entry = analyses.get(key);
            
            if (!entry) {
              get().trackCacheMiss();
              return null;
            }
            
            if (get().isDataStale(entry.timestamp)) {
              analyses.delete(key);
              get().trackCacheMiss();
              return null;
            }
            
            // Update access stats
            entry.accessCount++;
            entry.lastAccessed = Date.now();
            get().trackCacheHit();
            
            return entry.data;
          },

          setCachedAnalysis: (key, data) => {
            const entry: CacheEntry<AdvancedLPAnalysis> = {
              data,
              timestamp: Date.now(),
              accessCount: 0,
              lastAccessed: Date.now(),
            };
            
            const state = get();
            const newAnalyses = new Map(state.cache.analyses);
            newAnalyses.set(key, entry);
            
            set({
              cache: {
                ...state.cache,
                analyses: newAnalyses,
              }
            });
            
            // Prune cache if necessary
            if (newAnalyses.size > state.preferences.maxCacheSize) {
              get().pruneCache();
            }
          },

          getCachedPools: () => {
            const { pools } = get().cache;
            
            if (!pools) {
              get().trackCacheMiss();
              return null;
            }
            
            if (get().isDataStale(pools.timestamp)) {
              set((state) => ({
                cache: {
                  ...state.cache,
                  pools: null,
                }
              }));
              get().trackCacheMiss();
              return null;
            }
            
            pools.accessCount++;
            pools.lastAccessed = Date.now();
            get().trackCacheHit();
            
            return pools.data;
          },

          setCachedPools: (pools) =>
            set((state) => ({
              cache: {
                ...state.cache,
                pools: {
                  data: pools,
                  timestamp: Date.now(),
                  accessCount: 0,
                  lastAccessed: Date.now(),
                },
              }
            })),

          getCachedOHLCV: (key) => {
            const { ohlcv } = get().cache;
            const entry = ohlcv.get(key);
            
            if (!entry) {
              get().trackCacheMiss();
              return null;
            }
            
            if (get().isDataStale(entry.timestamp)) {
              ohlcv.delete(key);
              get().trackCacheMiss();
              return null;
            }
            
            entry.accessCount++;
            entry.lastAccessed = Date.now();
            get().trackCacheHit();
            
            return entry.data;
          },

          setCachedOHLCV: (key, data) => {
            const entry: CacheEntry<any> = {
              data,
              timestamp: Date.now(),
              accessCount: 0,
              lastAccessed: Date.now(),
            };
            
            const state = get();
            const newOHLCV = new Map(state.cache.ohlcv);
            newOHLCV.set(key, entry);
            
            set({
              cache: {
                ...state.cache,
                ohlcv: newOHLCV,
              }
            });
          },

          clearCache: () =>
            set((state) => ({
              cache: {
                ...state.cache,
                analyses: new Map(),
                pools: null,
                ohlcv: new Map(),
              }
            })),

          pruneCache: () => {
            const state = get();
            const { analyses } = state.cache;
            const { maxCacheSize } = state.preferences;
            
            if (analyses.size <= maxCacheSize) return;
            
            // Convert to array and sort by last accessed time
            const entries = Array.from(analyses.entries()).sort(
              ([, a], [, b]) => a.lastAccessed - b.lastAccessed
            );
            
            // Remove oldest entries
            const newAnalyses = new Map();
            entries.slice(entries.length - maxCacheSize).forEach(([key, entry]) => {
              newAnalyses.set(key, entry);
            });
            
            set({
              cache: {
                ...state.cache,
                analyses: newAnalyses,
              }
            });
          },

          // Performance Tracking
          trackAnalysis: (duration) =>
            set((state) => {
              const performance = { ...state.performance };
              performance.analysesRun++;
              performance.lastAnalysisTime = Date.now();
              
              // Update average analysis time
              if (performance.analysesRun === 1) {
                performance.averageAnalysisTime = duration;
              } else {
                performance.averageAnalysisTime = 
                  (performance.averageAnalysisTime * (performance.analysesRun - 1) + duration) / 
                  performance.analysesRun;
              }
              
              return { performance };
            }),

          trackCacheHit: () =>
            set((state) => {
              const performance = { ...state.performance };
              performance.totalCacheHits++;
              const { totalCacheHits, totalCacheMisses } = performance;
              performance.cacheHitRate = 
                totalCacheHits / (totalCacheHits + totalCacheMisses);
              
              return { performance };
            }),

          trackCacheMiss: () =>
            set((state) => {
              const performance = { ...state.performance };
              performance.totalCacheMisses++;
              const { totalCacheHits, totalCacheMisses } = performance;
              performance.cacheHitRate = 
                totalCacheHits / (totalCacheHits + totalCacheMisses);
              
              return { performance };
            }),

          getPerformanceStats: () => get().performance,

          // Utility Methods
          optimizeState: () => {
            get().pruneCache();
            // Additional optimizations can be added here
          },
        })
      ),
      {
        name: 'enhanced-lp-strategy-store',
        partialize: (state) => ({
          form: state.form,
          preferences: state.preferences,
          performance: state.performance,
          // Don't persist cache or results
        }),
      }
    ),
    {
      name: 'enhanced-lp-strategy-store',
    }
  )
);
