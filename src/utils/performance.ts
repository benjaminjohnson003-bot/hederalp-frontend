// Performance monitoring and optimization utilities

interface PerformanceEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private entries: Map<string, PerformanceEntry> = new Map();
  private observers: Array<(entry: PerformanceEntry) => void> = [];

  // Start timing an operation
  start(name: string, metadata?: Record<string, any>): void {
    this.entries.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  // End timing an operation
  end(name: string): number | null {
    const entry = this.entries.get(name);
    if (!entry) {
      console.warn(`Performance entry "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - entry.startTime;

    const completedEntry: PerformanceEntry = {
      ...entry,
      endTime,
      duration,
    };

    this.entries.set(name, completedEntry);
    this.notifyObservers(completedEntry);

    return duration;
  }

  // Get performance entry
  getEntry(name: string): PerformanceEntry | undefined {
    return this.entries.get(name);
  }

  // Get all entries
  getAllEntries(): PerformanceEntry[] {
    return Array.from(this.entries.values());
  }

  // Clear all entries
  clear(): void {
    this.entries.clear();
  }

  // Subscribe to performance events
  subscribe(callback: (entry: PerformanceEntry) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(entry: PerformanceEntry): void {
    this.observers.forEach(callback => callback(entry));
  }

  // Measure a function execution
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.start(name, metadata);
    try {
      const result = fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  // Measure an async function execution
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  // Get performance report
  getReport(): {
    totalEntries: number;
    averageDuration: number;
    slowestOperation: PerformanceEntry | null;
    fastestOperation: PerformanceEntry | null;
    totalTime: number;
  } {
    const entries = this.getAllEntries().filter(e => e.duration !== undefined);
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        totalTime: 0,
      };
    }

    const durations = entries.map(e => e.duration!);
    const totalTime = durations.reduce((sum, duration) => sum + duration, 0);
    const averageDuration = totalTime / durations.length;

    const slowestOperation = entries.reduce((slowest, current) => 
      (current.duration! > slowest.duration!) ? current : slowest
    );

    const fastestOperation = entries.reduce((fastest, current) => 
      (current.duration! < fastest.duration!) ? current : fastest
    );

    return {
      totalEntries: entries.length,
      averageDuration,
      slowestOperation,
      fastestOperation,
      totalTime,
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Memory usage monitoring
export const getMemoryUsage = (): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};

// Bundle size analyzer
export const analyzeBundleSize = (): void => {
  if ((import.meta as any).env?.MODE === 'development') {
    console.log('Bundle analysis is available in production builds');
    return;
  }

  // This would typically be used with webpack-bundle-analyzer
  console.log('Bundle size analysis:', {
    totalSize: document.documentElement.outerHTML.length,
    scriptsCount: document.querySelectorAll('script').length,
    stylesheetsCount: document.querySelectorAll('link[rel="stylesheet"]').length,
  });
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading utility for components
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

// Memoization utility with TTL
export class MemoCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; ttl: number }>();

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Web Worker utility for heavy computations
export const createWorker = (workerFunction: Function): Worker => {
  const workerScript = `
    self.onmessage = function(e) {
      const result = (${workerFunction.toString()})(e.data);
      self.postMessage(result);
    };
  `;

  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  
  return new Worker(workerUrl);
};

// Performance hooks for React components
export const usePerformanceMonitor = (name: string) => {
  React.useEffect(() => {
    performanceMonitor.start(name);
    return () => {
      performanceMonitor.end(name);
    };
  }, [name]);
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Import React for hooks
import React from 'react';
