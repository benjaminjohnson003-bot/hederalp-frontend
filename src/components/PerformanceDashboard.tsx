import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  TrendingUp, 
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useEnhancedLPStore } from '../store/enhancedLPStore';
import { performanceMonitor, getMemoryUsage } from '../utils/performance';

const PerformanceDashboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState<ReturnType<typeof getMemoryUsage>>(null);
  const [performanceReport, setPerformanceReport] = useState(performanceMonitor.getReport());
  
  const { 
    performance, 
    cache, 
    preferences, 
    // getPerformanceStats,
    clearCache,
    optimizeState 
  } = useEnhancedLPStore();

  // Update performance data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryUsage(getMemoryUsage());
      setPerformanceReport(performanceMonitor.getReport());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Subscribe to performance monitor
  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((entry) => {
      console.log('Performance entry:', entry);
    });

    return unsubscribe;
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getCacheSize = () => {
    return cache.analyses.size + cache.ohlcv.size + (cache.pools ? 1 : 0);
  };

  const getCacheHitRateColor = (rate: number) => {
    if (rate >= 0.8) return 'text-success-600';
    if (rate >= 0.6) return 'text-warning-600';
    return 'text-danger-600';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors z-50 ${className}`}
        title="Show Performance Dashboard"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Performance</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={optimizeState}
            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
            title="Optimize State"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close Dashboard"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Analysis Performance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
            Analysis Performance
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-gray-600">Total Analyses</div>
              <div className="font-semibold">{performance.analysesRun}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-gray-600">Avg Duration</div>
              <div className="font-semibold">
                {formatDuration(performance.averageAnalysisTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Cache Performance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Database className="w-4 h-4 mr-2 text-green-600" />
            Cache Performance
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Hit Rate</span>
              <span className={`font-semibold ${getCacheHitRateColor(performance.cacheHitRate)}`}>
                {(performance.cacheHitRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Size</span>
              <span className="font-semibold">{getCacheSize()} entries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Size</span>
              <span className="font-semibold">{preferences.maxCacheSize}</span>
            </div>
            <button
              onClick={clearCache}
              className="w-full mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>

        {/* Memory Usage */}
        {memoryUsage && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
              Memory Usage
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Used Heap</span>
                <span className="font-semibold">
                  {formatBytes(memoryUsage.usedJSHeapSize)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Heap</span>
                <span className="font-semibold">
                  {formatBytes(memoryUsage.totalJSHeapSize)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Limit</span>
                <span className="font-semibold">
                  {formatBytes(memoryUsage.jsHeapSizeLimit)}
                </span>
              </div>
              {/* Memory usage bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit) > 0.8
                        ? 'bg-red-500'
                        : (memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit) > 0.6
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${(memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operation Times */}
        {performanceReport.totalEntries > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-orange-600" />
              Operation Times
            </h4>
            <div className="space-y-2 text-sm">
              {performanceReport.slowestOperation && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Slowest</span>
                  <span className="font-semibold text-red-600">
                    {formatDuration(performanceReport.slowestOperation.duration!)}
                  </span>
                </div>
              )}
              {performanceReport.fastestOperation && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fastest</span>
                  <span className="font-semibold text-green-600">
                    {formatDuration(performanceReport.fastestOperation.duration!)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Average</span>
                <span className="font-semibold">
                  {formatDuration(performanceReport.averageDuration)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-2 text-gray-600" />
            Settings
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Expiry</span>
              <span className="font-semibold">{preferences.cacheExpiry}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Animations</span>
              <span className="font-semibold">
                {preferences.chartAnimations ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Performance Monitor</span>
          <button
            onClick={() => {
              setMemoryUsage(getMemoryUsage());
              setPerformanceReport(performanceMonitor.getReport());
            }}
            className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
