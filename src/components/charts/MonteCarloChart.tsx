import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { BarChart3, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { chartColors, defaultChartOptions, formatChartCurrency, formatChartPercentage } from '../../utils/chartConfig';
import { MonteCarloResults } from '../../types';
import { safeToFixed } from '../../utils/api';

interface MonteCarloChartProps {
  data: MonteCarloResults;
  className?: string;
}

const MonteCarloChart: React.FC<MonteCarloChartProps> = ({ data, className = '' }) => {
  // Create price distribution histogram data
  const priceDistribution = data.price_distribution;
  const priceRanges = [
    { label: 'Min', value: priceDistribution.min, color: chartColors.danger },
    { label: '10th %ile', value: priceDistribution.percentile_10, color: chartColors.warning },
    { label: 'Median', value: priceDistribution.median, color: chartColors.primary },
    { label: '90th %ile', value: priceDistribution.percentile_90, color: chartColors.success },
    { label: 'Max', value: priceDistribution.max, color: chartColors.teal },
  ];

  const priceDistributionData = {
    labels: priceRanges.map(r => r.label),
    datasets: [
      {
        label: 'Price Distribution',
        data: priceRanges.map(r => r.value),
        backgroundColor: priceRanges.map(r => r.color),
        borderColor: priceRanges.map(r => r.color),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Create return distribution data (simulated bell curve)
  const generateReturnDistribution = () => {
    const expected = data.expected_net_return_usd;
    const var5 = data.value_at_risk_5th_percentile_usd;
    const var95 = data.value_at_risk_95th_percentile_usd;
    
    // Create a simplified normal distribution visualization
    const points = [];
    const numPoints = 20;
    const range = var95 - var5;
    const step = range / (numPoints - 1);
    
    for (let i = 0; i < numPoints; i++) {
      const x = var5 + (i * step);
      // Simplified bell curve calculation
      const distance = Math.abs(x - expected) / (range / 4);
      const y = Math.max(0, 100 * Math.exp(-distance * distance));
      points.push({ x, y });
    }
    
    return points;
  };

  const returnDistributionPoints = generateReturnDistribution();
  
  const returnDistributionData = {
    datasets: [
      {
        label: 'Return Distribution',
        data: returnDistributionPoints,
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      // Add VaR markers
      {
        label: '5th Percentile (VaR)',
        data: [
          { x: data.value_at_risk_5th_percentile_usd, y: 0 },
          { x: data.value_at_risk_5th_percentile_usd, y: 100 }
        ],
        borderColor: chartColors.danger,
        backgroundColor: chartColors.danger,
        borderWidth: 3,
        borderDash: [5, 5],
        pointRadius: 0,
        showLine: true,
        fill: false,
      },
      {
        label: 'Expected Return',
        data: [
          { x: data.expected_net_return_usd, y: 0 },
          { x: data.expected_net_return_usd, y: 100 }
        ],
        borderColor: chartColors.success,
        backgroundColor: chartColors.success,
        borderWidth: 3,
        pointRadius: 0,
        showLine: true,
        fill: false,
      },
      {
        label: '95th Percentile',
        data: [
          { x: data.value_at_risk_95th_percentile_usd, y: 0 },
          { x: data.value_at_risk_95th_percentile_usd, y: 100 }
        ],
        borderColor: chartColors.teal,
        backgroundColor: chartColors.teal,
        borderWidth: 3,
        borderDash: [5, 5],
        pointRadius: 0,
        showLine: true,
        fill: false,
      },
    ],
  };

  // Probability outcomes data
  const probabilityData = {
    labels: ['Probability of Loss', 'Probability of Profit'],
    datasets: [
      {
        data: [100 - data.probability_of_profit, data.probability_of_profit],
        backgroundColor: [chartColors.danger, chartColors.success],
        borderColor: [chartColors.danger, chartColors.success],
        borderWidth: 2,
      },
    ],
  };

  // HODL comparison data
  const hodlComparisonData = {
    labels: ['Beats HODL', 'Underperforms HODL'],
    datasets: [
      {
        data: [data.probability_beats_hodl, 100 - data.probability_beats_hodl],
        backgroundColor: [chartColors.primary, chartColors.warning],
        borderColor: [chartColors.primary, chartColors.warning],
        borderWidth: 2,
      },
    ],
  };

  const priceChartOptions = {
    ...defaultChartOptions,
    scales: {
      ...defaultChartOptions.scales,
      y: {
        ...defaultChartOptions.scales.y,
        ticks: {
          ...defaultChartOptions.scales.y.ticks,
          callback: function(value: any) {
            return '$' + safeToFixed(Number(value), 6);
          },
        },
      },
    },
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'Price Distribution from Monte Carlo Simulation',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            return `${context.label}: $${safeToFixed(context.parsed.y, 6)}`;
          },
        },
      },
    },
  };

  const returnChartOptions = {
    ...defaultChartOptions,
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Net Return (USD)',
        },
        ticks: {
          callback: function(value: any) {
            return formatChartCurrency(value);
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Probability Density',
        },
        ticks: {
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
        text: 'Return Distribution (Simplified)',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            const dataset = context.dataset;
            if (dataset.label === 'Return Distribution') {
              return `Density: ${safeToFixed(context.parsed.y, 1)}%`;
            } else {
              return `${dataset.label}: ${formatChartCurrency(context.parsed.x)}`;
            }
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${safeToFixed(context.parsed, 1)}%`;
          },
        },
      },
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Price Distribution */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Price Distribution</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={priceDistributionData} options={priceChartOptions} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Distribution of final prices from {data.trials_run.toLocaleString()} Monte Carlo simulations 
            using {formatChartPercentage(data.volatility_used)} daily volatility.
          </p>
        </div>
      </div>

      {/* Return Distribution */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-success-600" />
          <h3 className="text-lg font-semibold text-gray-900">Return Distribution</h3>
        </div>
        <div style={{ height: '350px' }}>
          <Line data={returnDistributionData} options={returnChartOptions} />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-danger-600">5th Percentile</div>
            <div className="text-gray-600">{formatChartCurrency(data.value_at_risk_5th_percentile_usd)}</div>
            <div className="text-xs text-gray-500">Worst 5% of outcomes</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-success-600">Expected Return</div>
            <div className="text-gray-600">{formatChartCurrency(data.expected_net_return_usd)}</div>
            <div className="text-xs text-gray-500">Average outcome</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-teal-600">95th Percentile</div>
            <div className="text-gray-600">{formatChartCurrency(data.value_at_risk_95th_percentile_usd)}</div>
            <div className="text-xs text-gray-500">Best 5% of outcomes</div>
          </div>
        </div>
      </div>

      {/* Probability Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profit Probability */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-success-600" />
            <h3 className="text-lg font-semibold text-gray-900">Profit Probability</h3>
          </div>
          <div style={{ height: '250px' }}>
            <Bar
              data={probabilityData}
              options={{
                ...doughnutOptions,
                indexAxis: 'y' as const,
                scales: {
                  x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value: any) {
                        return value + '%';
                      },
                    },
                  },
                },
                plugins: {
                  ...doughnutOptions.plugins,
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-success-600">
              {formatChartPercentage(data.probability_of_profit)}
            </div>
            <div className="text-sm text-gray-600">Chance of Profit</div>
          </div>
        </div>

        {/* HODL Comparison */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">vs HODL</h3>
          </div>
          <div style={{ height: '250px' }}>
            <Bar
              data={hodlComparisonData}
              options={{
                ...doughnutOptions,
                indexAxis: 'y' as const,
                scales: {
                  x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value: any) {
                        return value + '%';
                      },
                    },
                  },
                },
                plugins: {
                  ...doughnutOptions.plugins,
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-primary-600">
              {formatChartPercentage(data.probability_beats_hodl)}
            </div>
            <div className="text-sm text-gray-600">Beats HODL</div>
          </div>
        </div>
      </div>

      {/* Risk Metrics Summary */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Monte Carlo Risk Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-3">Return Statistics</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>Expected Return:</span>
                <span className="font-medium">{formatChartCurrency(data.expected_net_return_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span>Value at Risk (5%):</span>
                <span className="font-medium text-red-600">{formatChartCurrency(data.value_at_risk_5th_percentile_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span>Upside Potential (95%):</span>
                <span className="font-medium text-green-600">{formatChartCurrency(data.value_at_risk_95th_percentile_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span>vs HODL Advantage:</span>
                <span className="font-medium">{formatChartCurrency(data.expected_advantage_vs_hodl_usd)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-3">Probability Analysis</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>Probability of Profit:</span>
                <span className="font-medium">{formatChartPercentage(data.probability_of_profit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Beats HODL:</span>
                <span className="font-medium">{formatChartPercentage(data.probability_beats_hodl)}</span>
              </div>
              <div className="flex justify-between">
                <span>Simulations Run:</span>
                <span className="font-medium">{data.trials_run.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Volatility:</span>
                <span className="font-medium">{formatChartPercentage(data.volatility_used)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonteCarloChart;

