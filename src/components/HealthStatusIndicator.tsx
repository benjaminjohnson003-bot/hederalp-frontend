import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Clock, Wifi } from 'lucide-react';
import { apiClient } from '../utils/api';
import { HealthStatus } from '../types';

const HealthStatusIndicator: React.FC = () => {
  const { data: health, isLoading, error } = useQuery<HealthStatus>({
    queryKey: ['health'],
    queryFn: apiClient.getHealth,
    refetchInterval: 30000, // Poll every 30 seconds
    retry: 3,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'degraded':
        return <Clock className="w-4 h-4 text-warning-600" />;
      case 'unhealthy':
        return <AlertCircle className="w-4 h-4 text-danger-600" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'degraded':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'unhealthy':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full border bg-gray-50 border-gray-200">
        <div className="w-4 h-4 loading-spinner" />
        <span className="text-sm text-gray-600">Checking...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full border bg-danger-50 border-danger-200">
        <AlertCircle className="w-4 h-4 text-danger-600" />
        <span className="text-sm text-danger-600">Offline</span>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <div className="relative group">
      <div
        className={`flex items-center space-x-2 px-3 py-1 rounded-full border cursor-pointer ${getStatusColor(
          health.status
        )}`}
        aria-label={`API Status: ${health.status}`}
      >
        {getStatusIcon(health.status)}
        <span className="text-sm font-medium capitalize">{health.status}</span>
      </div>

      {/* Detailed tooltip */}
      <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">System Status</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(health.status)}`}>
              {health.status}
            </span>
          </div>

          {health.components && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Components</h4>
              
              {/* Mirror Node Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Mirror Node</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(health.components.mirror_node.status)}
                  <span className="capitalize">{health.components.mirror_node.status}</span>
                  {health.components.mirror_node.response_time && (
                    <span className="text-gray-500">({health.components.mirror_node.response_time}ms)</span>
                  )}
                </div>
              </div>

              {/* SaucerSwap API Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">SaucerSwap API</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(health.components.saucerswap_api.status)}
                  <span className="capitalize">{health.components.saucerswap_api.status}</span>
                  {health.components.saucerswap_api.response_time && (
                    <span className="text-gray-500">({health.components.saucerswap_api.response_time}ms)</span>
                  )}
                </div>
              </div>

              {/* Cache Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cache</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(health.components.cache.status)}
                  <span className="capitalize">{health.components.cache.status}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Last checked: {new Date(health.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatusIndicator;

