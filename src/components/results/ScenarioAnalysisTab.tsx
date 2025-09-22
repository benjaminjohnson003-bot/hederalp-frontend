import React from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, AlertTriangle } from 'lucide-react';
import { AdvancedLPAnalysis } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/api';
import FeeCharts from '../charts/FeeCharts';

interface ScenarioAnalysisTabProps {
  data: AdvancedLPAnalysis;
}

const ScenarioAnalysisTab: React.FC<ScenarioAnalysisTabProps> = ({ data }) => {
  const scenarios = data.scenario_analysis;

  const getScenarioIcon = (scenario: string) => {
    if (scenario.includes('Bear')) return <TrendingDown className="w-5 h-5 text-danger-600" />;
    if (scenario.includes('Bull')) return <TrendingUp className="w-5 h-5 text-success-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getScenarioColor = (scenario: string) => {
    if (scenario.includes('Bear')) return 'border-l-danger-500 bg-danger-50';
    if (scenario.includes('Bull')) return 'border-l-success-500 bg-success-50';
    return 'border-l-gray-500 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Scenario Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario, index) => (
          <div
            key={index}
            className={`card border-l-4 ${getScenarioColor(scenario.scenario)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getScenarioIcon(scenario.scenario)}
                <h3 className="font-semibold text-gray-900">{scenario.scenario}</h3>
              </div>
              <span className="text-sm text-gray-500">
                {formatPercentage(scenario.probability * 100, 0)} probability
              </span>
            </div>

            <div className="space-y-3">
              {/* Price & Range Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Final Price</span>
                <span className="font-medium">${scenario.final_price.toFixed(6)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Range</span>
                <span className={`text-sm font-medium ${scenario.in_range ? 'text-success-600' : 'text-warning-600'}`}>
                  {scenario.in_range ? '✓ Yes' : '✗ No'}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                {/* Fees */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Fees Earned
                  </span>
                  <span className="font-medium text-success-600">
                    {formatCurrency(scenario.fees_earned_usd)}
                  </span>
                </div>

                {/* Impermanent Loss */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Impermanent Loss
                  </span>
                  <div className="text-right">
                    <div className="font-medium text-danger-600">
                      {formatPercentage(scenario.impermanent_loss_percent)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ({formatCurrency(scenario.impermanent_loss_usd)})
                    </div>
                  </div>
                </div>

                {/* Net Return */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                  <span className="text-sm font-medium text-gray-700">Net Return</span>
                  <span className={`font-bold ${scenario.net_return_usd >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {formatCurrency(scenario.net_return_usd)}
                  </span>
                </div>

                {/* vs HODL */}
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs font-medium text-gray-700 mb-2">LP vs HODL</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">LP Strategy</span>
                      <span className={scenario.net_return_usd >= 0 ? 'text-success-600' : 'text-danger-600'}>
                        {formatCurrency(scenario.lp_vs_hodl.lp_return_usd)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">HODL Strategy</span>
                      <span className={scenario.lp_vs_hodl.hodl_return_usd >= 0 ? 'text-success-600' : 'text-danger-600'}>
                        {formatCurrency(scenario.lp_vs_hodl.hodl_return_usd)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-1 font-medium">
                      <span>Advantage</span>
                      <span className={scenario.lp_vs_hodl.advantage_usd >= 0 ? 'text-success-600' : 'text-danger-600'}>
                        {scenario.lp_vs_hodl.advantage_usd >= 0 ? '+' : ''}
                        {formatCurrency(scenario.lp_vs_hodl.advantage_usd)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Expected Outcomes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Expected Fees */}
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">
              {formatCurrency(
                scenarios.reduce((sum, s) => sum + s.fees_earned_usd * s.probability, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Expected Fees</div>
          </div>

          {/* Expected IL */}
          <div className="text-center">
            <div className="text-2xl font-bold text-danger-600">
              {formatPercentage(
                scenarios.reduce((sum, s) => sum + s.impermanent_loss_percent * s.probability, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Expected IL</div>
          </div>

          {/* Expected Net Return */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {formatCurrency(
                scenarios.reduce((sum, s) => sum + s.net_return_usd * s.probability, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Expected Net Return</div>
          </div>

          {/* vs HODL Advantage */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                scenarios.reduce((sum, s) => sum + s.lp_vs_hodl.advantage_usd * s.probability, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">vs HODL Advantage</div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
        
        <div className="responsive-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Scenario</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Final Price</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">In Range</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Fees</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">IL %</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Net Return</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">vs HODL</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      {getScenarioIcon(scenario.scenario)}
                      <span className="font-medium">{scenario.scenario}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 font-mono">
                    ${scenario.final_price.toFixed(6)}
                  </td>
                  <td className="text-right py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      scenario.in_range ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                    }`}>
                      {scenario.in_range ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="text-right py-3 px-2 font-medium text-success-600">
                    {formatCurrency(scenario.fees_earned_usd)}
                  </td>
                  <td className="text-right py-3 px-2 font-medium text-danger-600">
                    {formatPercentage(scenario.impermanent_loss_percent)}
                  </td>
                  <td className="text-right py-3 px-2 font-bold">
                    <span className={scenario.net_return_usd >= 0 ? 'text-success-600' : 'text-danger-600'}>
                      {formatCurrency(scenario.net_return_usd)}
                    </span>
                  </td>
                  <td className="text-right py-3 px-2 font-medium">
                    <span className={scenario.lp_vs_hodl.advantage_usd >= 0 ? 'text-success-600' : 'text-danger-600'}>
                      {scenario.lp_vs_hodl.advantage_usd >= 0 ? '+' : ''}
                      {formatCurrency(scenario.lp_vs_hodl.advantage_usd)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Charts */}
      <FeeCharts scenarios={scenarios} />

      {/* Key Insights */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Key Insights</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            • <strong>Best Case:</strong> {scenarios.find(s => s.net_return_usd === Math.max(...scenarios.map(s => s.net_return_usd)))?.scenario} 
            with {formatCurrency(Math.max(...scenarios.map(s => s.net_return_usd)))} net return
          </div>
          <div>
            • <strong>Worst Case:</strong> {scenarios.find(s => s.net_return_usd === Math.min(...scenarios.map(s => s.net_return_usd)))?.scenario}
            with {formatCurrency(Math.min(...scenarios.map(s => s.net_return_usd)))} net return
          </div>
          <div>
            • <strong>Range Risk:</strong> {scenarios.filter(s => !s.in_range).length} out of {scenarios.length} scenarios result in being out of range
          </div>
          <div>
            • <strong>HODL Comparison:</strong> LP strategy outperforms HODL in {scenarios.filter(s => s.lp_vs_hodl.advantage_usd > 0).length} out of {scenarios.length} scenarios
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioAnalysisTab;
