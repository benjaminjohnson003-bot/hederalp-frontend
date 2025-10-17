import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ChartOptions, TooltipItem } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react';
import { apiClient } from '../utils/api';

// Register plugins
ChartJS.register(zoomPlugin, annotationPlugin);

interface LiquidityDepthChartProps {
  poolId: string;
  currentPrice?: number;
  selectedRange?: {
    min: number;
    max: number;
  };
}

const LiquidityDepthChart: React.FC<LiquidityDepthChartProps> = ({
  poolId,
  currentPrice,
  selectedRange,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [distributionData, setDistributionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch liquidity distribution data
  useEffect(() => {
    if (!poolId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiClient.getLiquidityDistribution(poolId, 150);
        setDistributionData(data);
      } catch (err) {
        console.error('Failed to fetch liquidity distribution:', err);
        setError('Failed to load liquidity data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [poolId]);

  // Handle zoom reset
  const handleResetZoom = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  }, []);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.zoom(1.2);
    }
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.zoom(0.8);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading trading volume data...</p>
        </div>
      </div>
    );
  }

  if (error || !distributionData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">{error || 'No data available'}</p>
      </div>
    );
  }

  // Prepare chart data
  const distribution = distributionData.distribution || [];
  const prices = distribution.map((d: any) => d.price);
  const liquidity = distribution.map((d: any) => d.liquidity);

  const chartData = {
    labels: prices,
    datasets: [
      {
        label: 'Trading Volume',
        data: liquidity,
        fill: true,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(59, 130, 246, 0.2)';

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.5)');
          return gradient;
        },
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            const price = items[0]?.parsed?.x;
            return price !== null && price !== undefined ? `Price: ${price.toFixed(6)}` : 'Price: N/A';
          },
          label: (item: TooltipItem<'line'>) => {
            const value = item?.parsed?.y;
            return value !== null && value !== undefined ? `Volume: $${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'Volume: N/A';
          },
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
        limits: {
          x: {
            min: 'original',
            max: 'original',
          },
        },
      },
      annotation: {
        annotations: {
          // Current price line
          ...(currentPrice && {
            currentPriceLine: {
              type: 'line',
              xMin: currentPrice,
              xMax: currentPrice,
              borderColor: 'rgb(34, 197, 94)',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: true,
                content: 'Current',
                position: 'start',
                backgroundColor: 'rgb(34, 197, 94)',
                color: '#fff',
                padding: 4,
              },
            },
          }),
          // Min range line
          ...(selectedRange?.min && {
            minRangeLine: {
              type: 'line',
              xMin: selectedRange.min,
              xMax: selectedRange.min,
              borderColor: 'rgb(168, 85, 247)',
              borderWidth: 2,
              label: {
                display: true,
                content: 'Min',
                position: 'start',
                backgroundColor: 'rgb(168, 85, 247)',
                color: '#fff',
                padding: 4,
              },
            },
          }),
          // Max range line
          ...(selectedRange?.max && {
            maxRangeLine: {
              type: 'line',
              xMin: selectedRange.max,
              xMax: selectedRange.max,
              borderColor: 'rgb(6, 182, 212)',
              borderWidth: 2,
              label: {
                display: true,
                content: 'Max',
                position: 'start',
                backgroundColor: 'rgb(6, 182, 212)',
                color: '#fff',
                padding: 4,
              },
            },
          }),
          // Selected range box
          ...(selectedRange?.min && selectedRange?.max && {
            rangeBox: {
              type: 'box',
              xMin: selectedRange.min,
              xMax: selectedRange.max,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 0,
            },
          }),
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: distributionData.metadata?.price_unit || 'Price',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return typeof value === 'number' ? value.toFixed(4) : value;
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Volume (USD)',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + (typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : value);
          },
        },
      },
    },
  };

  return (
    <div className="space-y-2">
      {/* Chart controls */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-900">
            Trading Volume by Price
          </div>
          <div className="text-xs text-gray-500">
            Higher bars = more fees earned at those prices
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 bg-white rounded-lg p-4 border border-gray-200">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
        {currentPrice && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-green-600"></div>
            <span>Current Price</span>
          </div>
        )}
        {selectedRange && (
          <>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-purple-600"></div>
              <span>Min Price</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-cyan-600"></div>
              <span>Max Price</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300"></div>
              <span>Your Range</span>
            </div>
          </>
        )}
      </div>

      {/* Help text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700">
        <div className="font-medium text-blue-900 mb-1">💡 How to use this chart:</div>
        <ul className="space-y-1 ml-4 list-disc">
          <li><strong>Higher bars</strong> = more trading volume = more fees you'll earn</li>
          <li><strong>Place your range</strong> where volume is highest for maximum fee earnings</li>
          <li><strong>Scroll to zoom</strong>, drag to pan, or use the buttons above</li>
        </ul>
      </div>
    </div>
  );
};

export default LiquidityDepthChart;

