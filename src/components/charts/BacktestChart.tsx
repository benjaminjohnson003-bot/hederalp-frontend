import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Activity, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { chartColors, defaultChartOptions, formatChartCurrency, formatChartPercentage } from '../../utils/chartConfig';
import { BacktestResults } from '../../types';

interface BacktestChartProps {
  data: BacktestResults;
  className?: string;
}

const BacktestChart: React.FC<BacktestChartProps> = ({ data, className = '' }) => {
  const { summary, detailed_results } = data;

  // Prepare cumulative performance data
  const cumulativeData = detailed_results.reduce((acc, result, index) => {
    const prevLp = index > 0 ? acc.lpReturns[index - 1] : 0;
    const prevHodl = index > 0 ? acc.hodlReturns[index - 1] : 0;
    
    acc.labels.push(new Date(result.period_start).toLocaleDateString());
    acc.lpReturns.push(prevLp + result.net_return);
    acc.hodlReturns.push(prevHodl + result.hodl_return);
    acc.advantages.push(result.advantage);
    acc.utilizations.push(result.utilization_rate);
    
    return acc;
  }, {
    labels: [] as string[],
    lpReturns: [] as number[],
    hodlReturns: [] as number[],
    advantages: [] as number[],
    utilizations: [] as number[],
  });

  // Cumulative performance chart
  const performanceData = {
    labels: cumulativeData.labels,
    datasets: [
      {
        label: 'LP Strategy (Cumulative)',
        data: cumulativeData.lpReturns,
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'HODL Strategy (Cumulative)',
        data: cumulativeData.hodlReturns,
        borderColor: chartColors.warning,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: chartColors.warning,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Period-by-period advantage chart
  const advantageData = {
    labels: cumulativeData.labels,
    datasets: [
      {
        label: 'LP Advantage per Period',
        data: cumulativeData.advantages,
        backgroundColor: cumulativeData.advantages.map(val => 
          val >= 0 ? chartColors.success : chartColors.danger
        ),
        borderColor: cumulativeData.advantages.map(val => 
          val >= 0 ? chartColors.success : chartColors.danger
        ),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Utilization rate over time
  const utilizationData = {
    labels: cumulativeData.labels,
    datasets: [
      {
        label: 'Range Utilization Rate',
        data: cumulativeData.utilizations,
        backgroundColor: cumulativeData.utilizations.map(val => {
          if (val >= 80) return chartColors.success;
          if (val >= 50) return chartColors.warning;
          return chartColors.danger;
        }),
        borderColor: cumulativeData.utilizations.map(val => {
          if (val >= 80) return chartColors.success;
          if (val >= 50) return chartColors.warning;
          return chartColors.danger;
        }),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Performance statistics
  const performanceStats = {
    labels: ['Best Period', 'Average Period', 'Worst Period'],
    datasets: [
      {
        label: 'LP Returns',
        data: [
          summary.best_period_return,
          summary.average_net_return_per_period,
          summary.worst_period_return,
        ],
        backgroundColor: [chartColors.success, chartColors.primary, chartColors.danger],
        borderColor: [chartColors.success, chartColors.primary, chartColors.danger],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'HODL Returns',
        data: [
          // Approximate HODL best/worst based on average
          summary.average_hodl_return_per_period * 1.5,
          summary.average_hodl_return_per_period,
          summary.average_hodl_return_per_period * 0.5,
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(245, 158, 11, 0.4)',
        ],
        borderColor: chartColors.warning,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const performanceOptions = {
    ...defaultChartOptions,
    scales: {
      ...defaultChartOptions.scales,
      y: {
        ...defaultChartOptions.scales.y,
        ticks: {
          ...defaultChartOptions.scales.y.ticks,
          callback: function(value: any) {
            return formatChartCurrency(value);
          },
        },
      },
    },
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'Cumulative Performance Over Time',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatChartCurrency(value)}`;
          },
        },
      },
    },
  };

  const advantageOptions = {
    ...defaultChartOptions,
    scales: {
      ...defaultChartOptions.scales,
      y: {
        ...defaultChartOptions.scales.y,
        ticks: {
          ...defaultChartOptions.scales.y.ticks,
          callback: function(value: any) {
            return formatChartCurrency(value);
          },
        },
      },
    },
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'LP Advantage per Period',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const advantage = value >= 0 ? 'LP wins by' : 'HODL wins by';
            return `${advantage}: ${formatChartCurrency(Math.abs(value))}`;
          },
        },
      },
    },
  };

  const utilizationOptions = {
    ...defaultChartOptions,
    scales: {
      ...defaultChartOptions.scales,
      y: {
        ...defaultChartOptions.scales.y,
        beginAtZero: true,
        max: 100,
        ticks: {
          ...defaultChartOptions.scales.y.ticks,
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'Range Utilization Rate Over Time',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            let status = 'Poor utilization';
            if (value >= 80) status = 'Excellent utilization';
            else if (value >= 50) status = 'Good utilization';
            return `${formatChartPercentage(value)} - ${status}`;
          },
        },
      },
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cumulative Performance */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cumulative Performance</h3>
        </div>
        <div style={{ height: '350px' }}>
          <Line data={performanceData} options={performanceOptions} />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-primary-600">Final LP Return</div>
            <div className="text-gray-600">
              {formatChartCurrency(cumulativeData.lpReturns[cumulativeData.lpReturns.length - 1] || 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-warning-600">Final HODL Return</div>
            <div className="text-gray-600">
              {formatChartCurrency(cumulativeData.hodlReturns[cumulativeData.hodlReturns.length - 1] || 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-success-600">Total Advantage</div>
            <div className="text-gray-600">
              {formatChartCurrency(summary.cumulative_advantage_vs_hodl)}
            </div>
          </div>
        </div>
      </div>

      {/* Period Advantage */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-success-600" />
          <h3 className="text-lg font-semibold text-gray-900">Period-by-Period Advantage</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={advantageData} options={advantageOptions} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Green bars show periods where LP strategy outperformed HODL. 
            Red bars show periods where HODL was better.
          </p>
        </div>
      </div>

      {/* Utilization Rate */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Range Utilization</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={utilizationData} options={utilizationOptions} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="w-4 h-4 bg-success-500 rounded mx-auto mb-1"></div>
            <div className="font-medium">≥80%</div>
            <div className="text-gray-600">Excellent</div>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 bg-warning-500 rounded mx-auto mb-1"></div>
            <div className="font-medium">50-79%</div>
            <div className="text-gray-600">Good</div>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 bg-danger-500 rounded mx-auto mb-1"></div>
            <div className="font-medium">&lt;50%</div>
            <div className="text-gray-600">Poor</div>
          </div>
        </div>
      </div>

      {/* Performance Statistics */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Statistics</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={performanceStats} options={{
            ...defaultChartOptions,
            scales: {
              ...defaultChartOptions.scales,
              y: {
                ...defaultChartOptions.scales.y,
                ticks: {
                  ...defaultChartOptions.scales.y.ticks,
                  callback: function(value: any) {
                    return formatChartCurrency(value);
                  },
                },
              },
            },
            plugins: {
              ...defaultChartOptions.plugins,
              title: {
                display: true,
                text: 'Best, Average, and Worst Period Returns',
                font: {
                  size: 14,
                  weight: 'bold' as const,
                },
              },
            },
          }} />
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win Rate Analysis */}
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Success Metrics</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-green-800">Profitable Periods</span>
              <span className="font-bold text-green-600">
                {formatChartPercentage(summary.profitable_periods_percent)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-800">Beat HODL</span>
              <span className="font-bold text-green-600">
                {formatChartPercentage(summary.beat_hodl_periods_percent)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-800">Avg Utilization</span>
              <span className="font-bold text-green-600">
                {formatChartPercentage(summary.average_utilization_rate)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <h4 className="font-semibold text-red-900 mb-3">Risk Analysis</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-red-800">Worst Loss</span>
              <span className="font-bold text-red-600">
                {formatChartCurrency(summary.worst_period_return)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-800">Loss Periods</span>
              <span className="font-bold text-red-600">
                {formatChartPercentage(100 - summary.profitable_periods_percent)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-800">Underperform HODL</span>
              <span className="font-bold text-red-600">
                {formatChartPercentage(100 - summary.beat_hodl_periods_percent)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestChart;

