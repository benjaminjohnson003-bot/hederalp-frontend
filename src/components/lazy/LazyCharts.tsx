import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load chart components for better performance
const PriceChart = React.lazy(() => import('../charts/PriceChart'));
const FeeCharts = React.lazy(() => import('../charts/FeeCharts'));
const MonteCarloChart = React.lazy(() => import('../charts/MonteCarloChart'));
const BacktestChart = React.lazy(() => import('../charts/BacktestChart'));

// Loading fallback component
const ChartLoadingFallback: React.FC<{ name: string }> = ({ name }) => (
  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
    <div className="text-center">
      <Loader2 className="w-8 h-8 mx-auto text-primary-600 animate-spin mb-4" />
      <p className="text-gray-600">Loading {name}...</p>
    </div>
  </div>
);

// Lazy-wrapped components with error boundaries
export const LazyPriceChart: React.FC<React.ComponentProps<typeof PriceChart>> = (props) => (
  <Suspense fallback={<ChartLoadingFallback name="Price Chart" />}>
    <PriceChart {...props} />
  </Suspense>
);

export const LazyFeeCharts: React.FC<React.ComponentProps<typeof FeeCharts>> = (props) => (
  <Suspense fallback={<ChartLoadingFallback name="Fee Charts" />}>
    <FeeCharts {...props} />
  </Suspense>
);

export const LazyMonteCarloChart: React.FC<React.ComponentProps<typeof MonteCarloChart>> = (props) => (
  <Suspense fallback={<ChartLoadingFallback name="Monte Carlo Chart" />}>
    <MonteCarloChart {...props} />
  </Suspense>
);

export const LazyBacktestChart: React.FC<React.ComponentProps<typeof BacktestChart>> = (props) => (
  <Suspense fallback={<ChartLoadingFallback name="Backtest Chart" />}>
    <BacktestChart {...props} />
  </Suspense>
);

// Error boundary for lazy components
class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return <FallbackComponent />;
      }

      return (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Chart Loading Error</div>
            <p className="text-red-700 text-sm">
              Failed to load chart component. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping lazy components with error boundary
export const withLazyErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType
) => {
  return (props: P) => (
    <LazyComponentErrorBoundary fallback={fallback}>
      <Component {...props} />
    </LazyComponentErrorBoundary>
  );
};

// Preload utility for better UX
export const preloadChartComponents = () => {
  // Preload components on user interaction or idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('../charts/PriceChart');
      import('../charts/FeeCharts');
      import('../charts/MonteCarloChart');
      import('../charts/BacktestChart');
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      import('../charts/PriceChart');
      import('../charts/FeeCharts');
      import('../charts/MonteCarloChart');
      import('../charts/BacktestChart');
    }, 2000);
  }
};

// Chart component registry for dynamic loading
export const chartRegistry = {
  price: LazyPriceChart,
  fees: LazyFeeCharts,
  monteCarlo: LazyMonteCarloChart,
  backtest: LazyBacktestChart,
} as const;

export type ChartType = keyof typeof chartRegistry;

// Dynamic chart loader
export const DynamicChart: React.FC<{
  type: ChartType;
  props: any;
  className?: string;
}> = ({ type, props, className }) => {
  const ChartComponent = chartRegistry[type];
  
  if (!ChartComponent) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-600">Unknown chart type: {type}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ChartComponent {...props} />
    </div>
  );
};

