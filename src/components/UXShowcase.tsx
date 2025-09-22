import React, { useState } from 'react';
import { Download, HelpCircle, Smartphone, Monitor, Palette } from 'lucide-react';
import HelpTooltip, { HELP_CONTENT } from './HelpTooltip';
// import ExportPanel from './ExportPanel';

const UXShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'tooltips' | 'export' | 'responsive'>('tooltips');

  const demos = [
    { id: 'tooltips' as const, label: 'Help Tooltips', icon: HelpCircle },
    { id: 'export' as const, label: 'Export Features', icon: Download },
    { id: 'responsive' as const, label: 'Responsive Design', icon: Smartphone },
  ];

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <Palette className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Phase 3: UX Enhancements</h2>
      </div>

      {/* Demo Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${
                  activeDemo === demo.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{demo.label}</span>
            </button>
          );
        })}
      </div>

      {/* Demo Content */}
      {activeDemo === 'tooltips' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Interactive Help Tooltips</h3>
            <p className="text-gray-600 mb-4">
              Hover or click on the help icons to see contextual information:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">Impermanent Loss</span>
                <HelpTooltip {...HELP_CONTENT.impermanentLoss} />
              </div>
              <p className="text-sm text-gray-600">
                Understanding the risk of price divergence
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">Concentrated Liquidity</span>
                <HelpTooltip {...HELP_CONTENT.concentratedLiquidity} />
              </div>
              <p className="text-sm text-gray-600">
                Benefits and risks of range-based LP
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">Monte Carlo Simulation</span>
                <HelpTooltip {...HELP_CONTENT.monteCarlo} />
              </div>
              <p className="text-sm text-gray-600">
                Statistical analysis with thousands of scenarios
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">Capital Efficiency</span>
                <HelpTooltip {...HELP_CONTENT.capitalEfficiency} />
              </div>
              <p className="text-sm text-gray-600">
                Measuring liquidity effectiveness
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Tooltip Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Responsive positioning (top, bottom, left, right)</li>
              <li>• Mobile-friendly with close buttons</li>
              <li>• External links to documentation</li>
              <li>• Rich HTML content support</li>
              <li>• Accessible with ARIA labels</li>
            </ul>
          </div>
        </div>
      )}

      {activeDemo === 'export' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Export & Sharing Features</h3>
            <p className="text-gray-600 mb-4">
              Multiple export formats for different use cases:
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> Export functionality requires analysis results. 
              Run an analysis first to see the full export panel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Data Export Options:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Download className="w-4 h-4 text-primary-600" />
                  <span className="text-sm">CSV - Scenario data for spreadsheets</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Download className="w-4 h-4 text-primary-600" />
                  <span className="text-sm">JSON - Complete data for developers</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Download className="w-4 h-4 text-primary-600" />
                  <span className="text-sm">PDF - Professional reports</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Chart Export Options:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Download className="w-4 h-4 text-success-600" />
                  <span className="text-sm">PNG - High-quality chart images</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Copy to clipboard - Quick sharing</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Download className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Share link - URL sharing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Export Features:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Real-time status feedback</li>
              <li>• Error handling with user-friendly messages</li>
              <li>• Automatic filename generation with timestamps</li>
              <li>• Chart export directly from Canvas elements</li>
              <li>• Professional PDF reports with branding</li>
            </ul>
          </div>
        </div>
      )}

      {activeDemo === 'responsive' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Responsive Design</h3>
            <p className="text-gray-600 mb-4">
              Optimized experience across all device sizes:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="font-medium mb-2">Mobile First</h4>
              <p className="text-sm text-gray-600">
                Touch-friendly interface with mobile-optimized navigation
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Monitor className="w-8 h-8 text-success-600" />
              </div>
              <h4 className="font-medium mb-2">Desktop Enhanced</h4>
              <p className="text-sm text-gray-600">
                Full-featured experience with sidebar and advanced controls
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Adaptive UI</h4>
              <p className="text-sm text-gray-600">
                Components adapt to screen size and user preferences
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-medium text-indigo-900 mb-3">Responsive Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
              <div>
                <strong>Mobile (&lt; 768px):</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Collapsible navigation</li>
                  <li>Stacked layouts</li>
                  <li>Touch-optimized controls</li>
                  <li>Simplified charts</li>
                </ul>
              </div>
              <div>
                <strong>Desktop (&ge; 768px):</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Sidebar navigation</li>
                  <li>Grid layouts</li>
                  <li>Hover interactions</li>
                  <li>Full-featured charts</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Current Breakpoints:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><code className="bg-gray-200 px-2 py-1 rounded">sm: 640px</code> - Small devices</div>
              <div><code className="bg-gray-200 px-2 py-1 rounded">md: 768px</code> - Medium devices</div>
              <div><code className="bg-gray-200 px-2 py-1 rounded">lg: 1024px</code> - Large devices</div>
              <div><code className="bg-gray-200 px-2 py-1 rounded">xl: 1280px</code> - Extra large devices</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UXShowcase;
