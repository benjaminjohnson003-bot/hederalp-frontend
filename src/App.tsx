// import React from 'react';
import { TrendingUp, BarChart3, Settings, Activity } from 'lucide-react';
import { useLPStrategyStore } from './store/lpStrategyStore';
import HealthStatusIndicator from './components/HealthStatusIndicator';
import PoolSelector from './components/PoolSelector';
import FeeCalculatorPanel from './components/FeeCalculatorPanel';
import ResultsSection from './components/ResultsSection';
import UXShowcase from './components/UXShowcase';
import PerformanceDashboard from './components/PerformanceDashboard';
// import ResponsiveLayout from './components/ResponsiveLayout';

function App() {
  const { ui, setSelectedTab } = useLPStrategyStore();

  const tabs = [
    { id: 'scenarios' as const, label: 'Scenario Analysis', icon: TrendingUp },
    { id: 'advanced' as const, label: 'Monte Carlo', icon: BarChart3 },
    { id: 'backtest' as const, label: 'Backtesting', icon: Activity },
    { id: 'efficiency' as const, label: 'Efficiency', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gradient">
                    SaucerSwap V2 LP Analyzer
                  </h1>
                  <p className="text-sm text-gray-600">
                    Advanced liquidity provider strategy analysis
                  </p>
                </div>
              </div>
            </div>
            <HealthStatusIndicator />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pool Selection */}
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-primary-600" />
                  Pool Selection
                </h2>
                <PoolSelector />
              </div>
            </div>

            {/* Strategy Configuration */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                  Strategy Configuration
                </h2>
                <FeeCalculatorPanel />
              </div>
            </div>
          </div>

          {/* UX Showcase */}
          <UXShowcase />

          {/* Results Section */}
          {ui.isLoading || ui.error || useLPStrategyStore.getState().results ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Activity className="w-6 h-6 mr-2 text-primary-600" />
                  Analysis Results
                </h2>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`
                          flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                          ${
                            ui.selectedTab === tab.id
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                        aria-label={`Switch to ${tab.label} tab`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <ResultsSection />
            </div>
          ) : (
            <div className="card text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Analyze Your LP Strategy
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Select a pool and configure your liquidity range to get started with advanced
                scenario analysis, Monte Carlo simulation, and backtesting.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Built with ❤️ for the SaucerSwap V2 community
            </p>
            <p className="text-sm">
              Advanced LP strategy analysis with scenario modeling, Monte Carlo simulation, and backtesting
            </p>
          </div>
        </div>
      </footer>

      {/* Performance Dashboard */}
      <PerformanceDashboard />
    </div>
  );
}

export default App;
