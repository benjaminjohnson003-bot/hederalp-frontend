import { AdvancedLPAnalysis } from '../types';

// Export data as CSV
export const exportToCSV = (data: AdvancedLPAnalysis, filename: string = 'lp-analysis') => {
  const scenarios = data.scenario_analysis;
  const csvContent = [
    // Header
    [
      'Scenario',
      'Final Price',
      'Probability (%)',
      'In Range',
      'Fees Earned (USD)',
      'Impermanent Loss (%)',
      'Impermanent Loss (USD)',
      'Net Return (USD)',
      'LP Return (USD)',
      'HODL Return (USD)',
      'Advantage vs HODL (USD)',
    ].join(','),
    // Data rows
    ...scenarios.map(scenario => [
      scenario.scenario,
      scenario.final_price.toFixed(6),
      (scenario.probability * 100).toFixed(1),
      scenario.in_range ? 'Yes' : 'No',
      scenario.fees_earned_usd.toFixed(2),
      scenario.impermanent_loss_percent.toFixed(2),
      scenario.impermanent_loss_usd.toFixed(2),
      scenario.net_return_usd.toFixed(2),
      scenario.lp_vs_hodl.lp_return_usd.toFixed(2),
      scenario.lp_vs_hodl.hodl_return_usd.toFixed(2),
      scenario.lp_vs_hodl.advantage_usd.toFixed(2),
    ].join(',')),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

// Export Monte Carlo results as CSV
export const exportMonteCarloToCSV = (data: AdvancedLPAnalysis, filename: string = 'monte-carlo-analysis') => {
  const mc = data.monte_carlo_simulation;
  if (!mc) return;

  const csvContent = [
    // Summary data
    ['Metric', 'Value'].join(','),
    ['Trials Run', mc.trials_run.toString()].join(','),
    ['Expected Net Return (USD)', mc.expected_net_return_usd.toFixed(2)].join(','),
    ['Expected Advantage vs HODL (USD)', mc.expected_advantage_vs_hodl_usd.toFixed(2)].join(','),
    ['Value at Risk 5th Percentile (USD)', mc.value_at_risk_5th_percentile_usd.toFixed(2)].join(','),
    ['Value at Risk 95th Percentile (USD)', mc.value_at_risk_95th_percentile_usd.toFixed(2)].join(','),
    ['Probability of Profit (%)', (mc.probability_of_profit).toFixed(1)].join(','),
    ['Probability Beats HODL (%)', (mc.probability_beats_hodl).toFixed(1)].join(','),
    ['Volatility Used (%)', (mc.volatility_used).toFixed(2)].join(','),
    ['', ''].join(','), // Empty row
    ['Price Distribution', ''].join(','),
    ['Minimum', mc.price_distribution.min.toFixed(6)].join(','),
    ['10th Percentile', mc.price_distribution.percentile_10.toFixed(6)].join(','),
    ['Median', mc.price_distribution.median.toFixed(6)].join(','),
    ['90th Percentile', mc.price_distribution.percentile_90.toFixed(6)].join(','),
    ['Maximum', mc.price_distribution.max.toFixed(6)].join(','),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

// Export chart as PNG
export const exportChartAsPNG = (chartRef: any, filename: string = 'chart') => {
  if (!chartRef?.current) return;

  const canvas = chartRef.current.canvas;
  const url = canvas.toDataURL('image/png');
  
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = url;
  link.click();
};

// Export complete analysis as JSON
export const exportToJSON = (data: AdvancedLPAnalysis, filename: string = 'lp-analysis') => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

// Generate PDF report (simplified HTML version)
export const exportToPDF = (data: AdvancedLPAnalysis, _filename: string = 'lp-analysis-report') => {
  const htmlContent = generateHTMLReport(data);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
  
  // Clean up after a delay
  setTimeout(() => {
    printWindow.close();
  }, 1000);
};

// Helper function to download files
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Generate HTML report for PDF export
const generateHTMLReport = (data: AdvancedLPAnalysis): string => {
  const { strategy_analysis, scenario_analysis, capital_efficiency, market_context } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>LP Strategy Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #3b82f6; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
        .metric { background: #f9fafb; padding: 15px; border-radius: 8px; }
        .metric-label { font-weight: bold; color: #374151; }
        .metric-value { font-size: 1.2em; color: #1f2937; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; font-weight: bold; }
        .positive { color: #059669; }
        .negative { color: #dc2626; }
        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>LP Strategy Analysis Report</h1>
        <p><strong>Pool:</strong> ${strategy_analysis.pool_name} | <strong>Analysis Date:</strong> ${new Date(strategy_analysis.analysis_date).toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>Strategy Overview</h2>
        <div class="grid">
          <div class="metric">
            <div class="metric-label">Current Price</div>
            <div class="metric-value">$${strategy_analysis.current_price.toFixed(6)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Selected Range</div>
            <div class="metric-value">$${strategy_analysis.selected_range.lower.toFixed(6)} - $${strategy_analysis.selected_range.upper.toFixed(6)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Range Width</div>
            <div class="metric-value">${strategy_analysis.selected_range.width_percent.toFixed(1)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Liquidity Amount</div>
            <div class="metric-value">$${strategy_analysis.liquidity_amount_usd.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Scenario Analysis</h2>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Final Price</th>
              <th>In Range</th>
              <th>Fees Earned</th>
              <th>Impermanent Loss</th>
              <th>Net Return</th>
              <th>vs HODL</th>
            </tr>
          </thead>
          <tbody>
            ${scenario_analysis.map(scenario => `
              <tr>
                <td>${scenario.scenario}</td>
                <td>$${scenario.final_price.toFixed(6)}</td>
                <td>${scenario.in_range ? '✓' : '✗'}</td>
                <td class="positive">$${scenario.fees_earned_usd.toFixed(2)}</td>
                <td class="negative">${scenario.impermanent_loss_percent.toFixed(2)}%</td>
                <td class="${scenario.net_return_usd >= 0 ? 'positive' : 'negative'}">$${scenario.net_return_usd.toFixed(2)}</td>
                <td class="${scenario.lp_vs_hodl.advantage_usd >= 0 ? 'positive' : 'negative'}">$${scenario.lp_vs_hodl.advantage_usd.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Capital Efficiency</h2>
        <div class="grid">
          <div class="metric">
            <div class="metric-label">Efficiency Score</div>
            <div class="metric-value">${capital_efficiency.capital_efficiency_score.toFixed(1)}/100</div>
          </div>
          <div class="metric">
            <div class="metric-label">Utilization Rate</div>
            <div class="metric-value">${capital_efficiency.utilization_rate_percent.toFixed(1)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Days Analyzed</div>
            <div class="metric-value">${capital_efficiency.days_analyzed}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Recommendation</div>
            <div class="metric-value">${capital_efficiency.recommendation}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Market Context</h2>
        <div class="grid">
          <div class="metric">
            <div class="metric-label">Daily Volatility</div>
            <div class="metric-value">${market_context.historical_volatility_daily.toFixed(2)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Average Daily Volume</div>
            <div class="metric-value">$${market_context.average_daily_volume_usd.toLocaleString()}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Fee Rate</div>
            <div class="metric-value">${market_context.fee_rate_percent.toFixed(3)}%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Data Points</div>
            <div class="metric-value">${market_context.data_points_analyzed}</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Generated by SaucerSwap V2 LP Strategy Analyzer | ${new Date().toLocaleString()}</p>
        <p>This analysis is for informational purposes only and should not be considered financial advice.</p>
      </div>
    </body>
    </html>
  `;
};

// Copy analysis summary to clipboard
export const copyToClipboard = async (data: AdvancedLPAnalysis): Promise<boolean> => {
  const summary = generateTextSummary(data);
  
  try {
    await navigator.clipboard.writeText(summary);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Generate text summary for sharing
const generateTextSummary = (data: AdvancedLPAnalysis): string => {
  const { strategy_analysis, scenario_analysis } = data;
  const expectedReturn = scenario_analysis.reduce((sum, s) => sum + s.net_return_usd * s.probability, 0);
  const profitableScenarios = scenario_analysis.filter(s => s.net_return_usd > 0).length;
  
  return `🔍 LP Strategy Analysis Summary

📊 Pool: ${strategy_analysis.pool_name}
💰 Liquidity: $${strategy_analysis.liquidity_amount_usd.toLocaleString()}
📈 Range: $${strategy_analysis.selected_range.lower.toFixed(6)} - $${strategy_analysis.selected_range.upper.toFixed(6)} (${strategy_analysis.selected_range.width_percent.toFixed(1)}% width)

📈 Expected Return: $${expectedReturn.toFixed(2)}
✅ Profitable Scenarios: ${profitableScenarios}/${scenario_analysis.length}
⚡ Capital Efficiency: ${data.capital_efficiency.capital_efficiency_score.toFixed(1)}/100

Generated by SaucerSwap V2 LP Strategy Analyzer
${new Date().toLocaleString()}`;
};
