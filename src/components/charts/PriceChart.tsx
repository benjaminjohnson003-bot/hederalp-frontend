import React, { useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Calendar, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { chartColors, candlestickOptions } from '../../utils/chartConfig';
import { useLPStrategyStore } from '../../store/lpStrategyStore';
// import { OHLCVCandle } from '../../types';

interface PriceChartProps {
  poolId: string;
  className?: string;
  height?: number;
  showRangeOverlay?: boolean;
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  poolId, 
  className = '', 
  height = 400,
  showRangeOverlay = true 
}) => {
  const { form } = useLPStrategyStore();
  const chartRef = useRef<any>(null);
  const [timeframe, setTimeframe] = useState('1H');
  const [lookbackDays, setLookbackDays] = useState(7);

  // Fetch OHLCV data
  const { data: ohlcvData, isLoading, error, refetch } = useQuery({
    queryKey: ['ohlcv', poolId, timeframe, lookbackDays],
    queryFn: () => apiClient.getOHLCVData(poolId, timeframe, lookbackDays),
    enabled: !!poolId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const candles = ohlcvData?.candles || [];

  // Prepare chart data
  const chartData = {
    datasets: [
      {
        label: 'Price',
        data: candles.map(candle => ({
          x: candle.timestamp * 1000, // Convert Unix seconds to milliseconds
          y: candle.close,
        })),
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Add range overlay if enabled
  if (showRangeOverlay && form.priceLower && form.priceUpper) {
    const rangeData = candles.map(candle => ({
      x: candle.timestamp * 1000, // Convert Unix seconds to milliseconds
      y: form.priceLower,
    }));
    
    const upperRangeData = candles.map(candle => ({
      x: candle.timestamp * 1000, // Convert Unix seconds to milliseconds
      y: form.priceUpper,
    }));

    chartData.datasets.push(
      {
        label: 'Lower Range',
        data: rangeData,
        borderColor: chartColors.danger,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      } as any,
      {
        label: 'Upper Range',
        data: upperRangeData,
        borderColor: chartColors.success,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: '-1',
      } as any
    );
  }

  const options = {
    ...candlestickOptions,
    plugins: {
      ...candlestickOptions.plugins,
      title: {
        display: true,
        text: `Price History - ${timeframe} intervals`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: 20,
      },
      legend: {
        ...candlestickOptions.plugins.legend,
        labels: {
          ...candlestickOptions.plugins.legend.labels,
          filter: (legendItem: any) => {
            // Hide volume from legend if there are range overlays
            if (showRangeOverlay && legendItem.text === 'Volume') {
              return false;
            }
            return true;
          },
        },
      },
    },
    scales: {
      ...candlestickOptions.scales,
      volume: {
        type: 'linear' as const,
        position: 'right' as const,
        display: false,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  const timeframeOptions = [
    { value: '5T', label: '5min' },
    { value: '15T', label: '15min' },
    { value: '1H', label: '1hr' },
    { value: '4H', label: '4hr' },
    { value: '1D', label: '1day' },
  ];

  const lookbackOptions = [
    { value: 1, label: '1 day' },
    { value: 3, label: '3 days' },
    { value: 7, label: '1 week' },
    { value: 14, label: '2 weeks' },
    { value: 30, label: '1 month' },
  ];

  if (error) {
    return (
      <div className={`card ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-danger-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to Load Price Data
            </h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Unable to fetch OHLCV data'}
            </p>
            <button
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="input text-sm py-1 px-2 min-w-0"
              disabled={isLoading}
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lookback Selector */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <select
              value={lookbackDays}
              onChange={(e) => setLookbackDays(Number(e.target.value))}
              className="input text-sm py-1 px-2 min-w-0"
              disabled={isLoading}
            >
              {lookbackOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: height - 100 }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto text-primary-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading price data...</p>
            </div>
          </div>
        ) : candles.length > 0 ? (
          <Line ref={chartRef} data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No price data available</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting the timeframe or lookback period
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Stats */}
      {candles.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Current Price</div>
              <div className="font-semibold">
                ${typeof candles[candles.length - 1]?.close === 'number' ? candles[candles.length - 1]?.close.toFixed(6) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-gray-600">24h High</div>
              <div className="font-semibold text-success-600">
                ${(() => { const high = Math.max(...candles.map(c => c.high)); return typeof high === 'number' && !isNaN(high) ? high.toFixed(6) : 'N/A'; })()}
              </div>
            </div>
            <div>
              <div className="text-gray-600">24h Low</div>
              <div className="font-semibold text-danger-600">
                ${(() => { const low = Math.min(...candles.map(c => c.low)); return typeof low === 'number' && !isNaN(low) ? low.toFixed(6) : 'N/A'; })()}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Total Volume</div>
              <div className="font-semibold">
                ${candles.reduce((sum, c) => sum + c.volume_usd, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceChart;
