import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from 'chart.js';
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement
);

// Chart color palette
export const chartColors = {
  primary: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  teal: '#14b8a6',
  orange: '#f97316',
  pink: '#ec4899',
  gray: '#6b7280',
  
  // Gradients
  primaryGradient: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.2)'],
  successGradient: ['rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.2)'],
  dangerGradient: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.2)'],
  warningGradient: ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.2)'],
};

// Default chart options
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
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
      titleFont: {
        size: 13,
        weight: 'bold' as const,
      },
      bodyFont: {
        size: 12,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif',
        },
        color: '#6b7280',
      },
    },
    y: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif',
        },
        color: '#6b7280',
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart' as const,
  },
};

// Candlestick chart options
export const candlestickOptions = {
  ...defaultChartOptions,
  scales: {
    x: {
      type: 'time' as const,
      time: {
        unit: 'hour' as const,
        displayFormats: {
          hour: 'MMM dd HH:mm',
        },
      },
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif',
        },
        color: '#6b7280',
        maxTicksLimit: 10,
      },
    },
    y: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif',
        },
        color: '#6b7280',
        callback: function(value: any) {
          return '$' + Number(value).toFixed(6);
        },
      },
    },
  },
  plugins: {
    ...defaultChartOptions.plugins,
    tooltip: {
      ...defaultChartOptions.plugins.tooltip,
      callbacks: {
        title: function(context: any) {
          const date = new Date(context[0].parsed.x);
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        },
        label: function(context: any) {
          const data = context.parsed;
          return [
            `Open: $${data.o?.toFixed(6) || 'N/A'}`,
            `High: $${data.h?.toFixed(6) || 'N/A'}`,
            `Low: $${data.l?.toFixed(6) || 'N/A'}`,
            `Close: $${data.c?.toFixed(6) || 'N/A'}`,
          ];
        },
      },
    },
  },
};

// Create gradient background
export const createGradient = (ctx: CanvasRenderingContext2D, colors: string[]) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
};

// Format currency for chart labels
export const formatChartCurrency = (value: number, decimals: number = 2): string => {
  if (value === 0) return '$0';
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(decimals)}`;
};

// Format percentage for chart labels
export const formatChartPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Generate chart colors for multiple datasets
export const generateChartColors = (count: number): string[] => {
  const colors = [
    chartColors.primary,
    chartColors.success,
    chartColors.danger,
    chartColors.warning,
    chartColors.purple,
    chartColors.indigo,
    chartColors.teal,
    chartColors.orange,
    chartColors.pink,
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

