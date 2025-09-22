import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { DollarSign, TrendingUp, AlertTriangle, PieChart } from 'lucide-react';
import { chartColors, defaultChartOptions, formatChartCurrency } from '../../utils/chartConfig';
import { ScenarioAnalysis } from '../../types';

interface FeeChartsProps {
  scenarios: ScenarioAnalysis[];
  className?: string;
}

const FeeCharts: React.FC<FeeChartsProps> = ({ scenarios, className = '' }) => {
  // Prepare data for fee comparison chart
  const feeComparisonData = {
    labels: scenarios.map(s => s.scenario.replace(' Case', '')),
    datasets: [
      {
        label: 'Fees Earned',
        data: scenarios.map(s => s.fees_earned_usd),
        backgroundColor: chartColors.success,
        borderColor: chartColors.success,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Impermanent Loss',
        data: scenarios.map(s => s.impermanent_loss_usd),
        backgroundColor: chartColors.danger,
        borderColor: chartColors.danger,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Prepare data for net returns chart
  const netReturnsData = {
    labels: scenarios.map(s => s.scenario.replace(' Case', '')),
    datasets: [
      {
        label: 'Net Return',
        data: scenarios.map(s => s.net_return_usd),
        backgroundColor: scenarios.map(s => 
          s.net_return_usd >= 0 ? chartColors.success : chartColors.danger
        ),
        borderColor: scenarios.map(s => 
          s.net_return_usd >= 0 ? chartColors.success : chartColors.danger
        ),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Prepare data for LP vs HODL comparison
  const lpVsHodlData = {
    labels: scenarios.map(s => s.scenario.replace(' Case', '')),
    datasets: [
      {
        label: 'LP Strategy',
        data: scenarios.map(s => s.lp_vs_hodl.lp_return_usd),
        backgroundColor: chartColors.primary,
        borderColor: chartColors.primary,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'HODL Strategy',
        data: scenarios.map(s => s.lp_vs_hodl.hodl_return_usd),
        backgroundColor: chartColors.warning,
        borderColor: chartColors.warning,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Prepare data for probability-weighted outcomes
  const expectedOutcomes = scenarios.reduce(
    (acc, scenario) => {
      acc.fees += scenario.fees_earned_usd * scenario.probability;
      acc.il += scenario.impermanent_loss_usd * scenario.probability;
      acc.netReturn += scenario.net_return_usd * scenario.probability;
      return acc;
    },
    { fees: 0, il: 0, netReturn: 0 }
  );

  const outcomeDistributionData = {
    labels: ['Expected Fees', 'Expected IL', 'Expected Net Return'],
    datasets: [
      {
        data: [
          Math.abs(expectedOutcomes.fees),
          Math.abs(expectedOutcomes.il),
          Math.abs(expectedOutcomes.netReturn),
        ],
        backgroundColor: [
          chartColors.success,
          chartColors.danger,
          expectedOutcomes.netReturn >= 0 ? chartColors.primary : chartColors.danger,
        ],
        borderColor: [
          chartColors.success,
          chartColors.danger,
          expectedOutcomes.netReturn >= 0 ? chartColors.primary : chartColors.danger,
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${formatChartCurrency(value)}`;
          },
        },
      },
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Fee vs IL Comparison */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-success-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fees vs Impermanent Loss</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={feeComparisonData} options={chartOptions} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Green bars show fees earned, red bars show impermanent loss. 
            Net return = Fees - IL for each scenario.
          </p>
        </div>
      </div>

      {/* Net Returns Chart */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Net Returns by Scenario</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={netReturnsData} options={chartOptions} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Net returns after accounting for both fees earned and impermanent loss. 
            Green indicates profit, red indicates loss.
          </p>
        </div>
      </div>

      {/* LP vs HODL Comparison */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning-600" />
          <h3 className="text-lg font-semibold text-gray-900">LP Strategy vs HODL</h3>
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={lpVsHodlData} options={chartOptions} />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Compares LP strategy returns (blue) against simply holding 50/50 USDC/HBAR (orange). 
            Higher bars indicate better performance.
          </p>
        </div>
      </div>

      {/* Expected Outcomes Distribution */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <PieChart className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Probability-Weighted Outcomes</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doughnut Chart */}
          <div style={{ height: '250px' }}>
            <Doughnut data={outcomeDistributionData} options={doughnutOptions} />
          </div>
          
          {/* Expected Values */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                {formatChartCurrency(expectedOutcomes.fees)}
              </div>
              <div className="text-sm text-gray-600">Expected Fees</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600">
                {formatChartCurrency(expectedOutcomes.il)}
              </div>
              <div className="text-sm text-gray-600">Expected IL</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                expectedOutcomes.netReturn >= 0 ? 'text-primary-600' : 'text-danger-600'
              }`}>
                {formatChartCurrency(expectedOutcomes.netReturn)}
              </div>
              <div className="text-sm text-gray-600">Expected Net Return</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Expected outcomes calculated by weighting each scenario by its probability. 
            This gives you the most likely overall result.
          </p>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Risk Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-success-600">
              {scenarios.filter(s => s.net_return_usd > 0).length}/{scenarios.length}
            </div>
            <div className="text-blue-800">Profitable Scenarios</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-warning-600">
              {scenarios.filter(s => !s.in_range).length}/{scenarios.length}
            </div>
            <div className="text-blue-800">Out of Range</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {scenarios.filter(s => s.lp_vs_hodl.advantage_usd > 0).length}/{scenarios.length}
            </div>
            <div className="text-blue-800">Beat HODL</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeCharts;
