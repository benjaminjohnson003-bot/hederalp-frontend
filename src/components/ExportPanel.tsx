import React, { useState } from 'react';
import { Download, FileText, Image, Copy, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import { useLPStrategyStore } from '../store/lpStrategyStore';
import { 
  exportToCSV, 
  exportMonteCarloToCSV, 
  exportToJSON, 
  exportToPDF, 
  copyToClipboard 
} from '../utils/exportUtils';

interface ExportPanelProps {
  className?: string;
  chartRefs?: { [key: string]: React.RefObject<any> };
}

const ExportPanel: React.FC<ExportPanelProps> = ({ className = '', chartRefs = {} }) => {
  const { results } = useLPStrategyStore();
  const [exportStatus, setExportStatus] = useState<{ type: string; status: 'success' | 'error'; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!results) return null;

  const showStatus = (type: string, status: 'success' | 'error', message: string) => {
    setExportStatus({ type, status, message });
    setTimeout(() => setExportStatus(null), 3000);
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const filename = `lp-analysis-${results.strategy_analysis.pool_id}-${new Date().toISOString().split('T')[0]}`;
      exportToCSV(results, filename);
      showStatus('CSV', 'success', 'Scenario analysis exported successfully');
    } catch (error) {
      showStatus('CSV', 'error', 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMonteCarloCSV = async () => {
    if (!results.monte_carlo_simulation) {
      showStatus('Monte Carlo', 'error', 'Monte Carlo data not available');
      return;
    }

    try {
      setIsExporting(true);
      const filename = `monte-carlo-${results.strategy_analysis.pool_id}-${new Date().toISOString().split('T')[0]}`;
      exportMonteCarloToCSV(results, filename);
      showStatus('Monte Carlo', 'success', 'Monte Carlo analysis exported successfully');
    } catch (error) {
      showStatus('Monte Carlo', 'error', 'Failed to export Monte Carlo data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const filename = `lp-analysis-complete-${results.strategy_analysis.pool_id}-${new Date().toISOString().split('T')[0]}`;
      exportToJSON(results, filename);
      showStatus('JSON', 'success', 'Complete analysis exported as JSON');
    } catch (error) {
      showStatus('JSON', 'error', 'Failed to export JSON');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      exportToPDF(results);
      showStatus('PDF', 'success', 'PDF report generated (check your browser)');
    } catch (error) {
      showStatus('PDF', 'error', 'Failed to generate PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      setIsExporting(true);
      const success = await copyToClipboard(results);
      if (success) {
        showStatus('Clipboard', 'success', 'Analysis summary copied to clipboard');
      } else {
        showStatus('Clipboard', 'error', 'Failed to copy to clipboard');
      }
    } catch (error) {
      showStatus('Clipboard', 'error', 'Failed to copy to clipboard');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportChart = (chartKey: string, chartName: string) => {
    const chartRef = chartRefs[chartKey];
    if (!chartRef?.current) {
      showStatus('Chart', 'error', `${chartName} chart not available for export`);
      return;
    }

    try {
      const canvas = chartRef.current.canvas;
      const url = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `${chartName.toLowerCase().replace(/\s+/g, '-')}-${results.strategy_analysis.pool_id}.png`;
      link.href = url;
      link.click();
      
      showStatus('Chart', 'success', `${chartName} chart exported successfully`);
    } catch (error) {
      showStatus('Chart', 'error', `Failed to export ${chartName} chart`);
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Export Analysis</h3>
        </div>
        {isExporting && (
          <div className="flex items-center space-x-2 text-primary-600">
            <div className="w-4 h-4 loading-spinner" />
            <span className="text-sm">Exporting...</span>
          </div>
        )}
      </div>

      {/* Status Message */}
      {exportStatus && (
        <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
          exportStatus.status === 'success' 
            ? 'bg-success-50 text-success-800 border border-success-200' 
            : 'bg-danger-50 text-danger-800 border border-danger-200'
        }`}>
          {exportStatus.status === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{exportStatus.message}</span>
        </div>
      )}

      {/* Data Export Options */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Data Export
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="btn btn-secondary text-sm py-2 px-3 justify-start"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Scenarios (CSV)
            </button>

            {results.monte_carlo_simulation && (
              <button
                onClick={handleExportMonteCarloCSV}
                disabled={isExporting}
                className="btn btn-secondary text-sm py-2 px-3 justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Monte Carlo (CSV)
              </button>
            )}

            <button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="btn btn-secondary text-sm py-2 px-3 justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              Complete Data (JSON)
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="btn btn-secondary text-sm py-2 px-3 justify-start"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF Report
            </button>
          </div>
        </div>

        {/* Chart Export Options */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Image className="w-4 h-4 mr-2" />
            Chart Export
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(chartRefs).map(([key, ref]) => {
              const chartNames: { [key: string]: string } = {
                price: 'Price Chart',
                fees: 'Fee Analysis',
                monteCarlo: 'Monte Carlo',
                backtest: 'Backtest Results',
              };
              
              return (
                <button
                  key={key}
                  onClick={() => handleExportChart(key, chartNames[key] || key)}
                  disabled={isExporting || !ref?.current}
                  className="btn btn-secondary text-sm py-2 px-3 justify-start disabled:opacity-50"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {chartNames[key] || key} (PNG)
                </button>
              );
            })}
          </div>
        </div>

        {/* Share Options */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Share2 className="w-4 h-4 mr-2" />
            Share Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleCopyToClipboard}
              disabled={isExporting}
              className="btn btn-secondary text-sm py-2 px-3 justify-start"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Summary
            </button>

            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url).then(() => {
                  showStatus('Link', 'success', 'Analysis link copied to clipboard');
                }).catch(() => {
                  showStatus('Link', 'error', 'Failed to copy link');
                });
              }}
              disabled={isExporting}
              className="btn btn-secondary text-sm py-2 px-3 justify-start"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Export Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Export Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>• <strong>CSV:</strong> Scenario data for spreadsheet analysis</div>
          <div>• <strong>JSON:</strong> Complete analysis data for developers</div>
          <div>• <strong>PDF:</strong> Professional report for presentations</div>
          <div>• <strong>PNG:</strong> High-quality chart images</div>
          <div>• <strong>Summary:</strong> Quick text overview for sharing</div>
        </div>
      </div>

      {/* Analysis Metadata */}
      <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Analysis Date:</span><br />
            {new Date(results.strategy_analysis.analysis_date).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Data Points:</span><br />
            {results.market_context.data_points_analyzed} candles analyzed
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;

