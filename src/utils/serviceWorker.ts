// Service Worker registration and management

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

const isLocalhost = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );
};

export function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  const publicUrl = new URL(process.env.NEXT_PUBLIC_PUBLIC_URL || '', window.location.href);
    
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

  window.addEventListener('load', () => {
    const swUrl = `${process.env.NEXT_PUBLIC_PUBLIC_URL || ''}/sw.js`;

    if (isLocalhost()) {
      checkValidServiceWorker(swUrl, config);
      navigator.serviceWorker.ready.then(() => {
        console.log('[SW] This web app is being served cache-first by a service worker.');
      });
    } else {
      registerValidServiceWorker(swUrl, config);
    }
  });
}

function registerValidServiceWorker(swUrl: string, config: ServiceWorkerConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[SW] Service worker registered:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('[SW] New content is available; please refresh.');
              if (config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('[SW] Content is cached for offline use.');
              if (config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[SW] Error during service worker registration:', error);
      if (config.onError) {
        config.onError(error);
      }
    });
}

function checkValidServiceWorker(swUrl: string, config: ServiceWorkerConfig) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidServiceWorker(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[SW] No internet connection found. App is running in offline mode.');
    });
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('[SW] Service worker unregistered');
      })
      .catch((error) => {
        console.error('[SW] Error unregistering service worker:', error);
      });
  }
}

// Service Worker messaging utilities
export class ServiceWorkerMessenger {
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        this.setupMessageListener();
      } catch (error) {
        console.error('[SW] Failed to initialize service worker messenger:', error);
      }
    }
  }

  private setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[SW] Message from service worker:', event.data);
      
      if (event.data.type === 'SYNC_SUCCESS') {
        this.handleSyncSuccess(event.data);
      }
    });
  }

  private handleSyncSuccess(data: any) {
    // Notify app about successful background sync
    window.dispatchEvent(new CustomEvent('sw-sync-success', { detail: data }));
  }

  // Send message to service worker
  async postMessage(message: any): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage(message);
    }
  }

  // Cache analysis data for offline use
  async cacheAnalysisData(data: any): Promise<void> {
    await this.postMessage({
      type: 'CACHE_ANALYSIS',
      payload: data,
    });
  }

  // Request background sync
  async requestBackgroundSync(tag: string): Promise<void> {
    if ((this.registration as any)?.sync) {
      try {
        await (this.registration as any).sync.register(tag);
        console.log('[SW] Background sync registered:', tag);
      } catch (error) {
        console.error('[SW] Background sync registration failed:', error);
      }
    }
  }

  // Check if app is running offline
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // Get cache usage information
  async getCacheInfo(): Promise<{ size: number; count: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          size: estimate.usage || 0,
          count: estimate.quota || 0,
        };
      } catch (error) {
        console.error('[SW] Failed to get cache info:', error);
      }
    }
    return null;
  }
}

// Global service worker messenger instance
export const swMessenger = new ServiceWorkerMessenger();

// PWA installation utilities
export class PWAInstaller {
  private deferredPrompt: any = null;
  private isInstallable = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.isInstallable = true;
      
      // Dispatch custom event for app to handle
      window.dispatchEvent(new CustomEvent('pwa-installable'));
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed');
      this.deferredPrompt = null;
      this.isInstallable = false;
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  // Check if PWA can be installed
  canInstall(): boolean {
    return this.isInstallable && this.deferredPrompt !== null;
  }

  // Prompt user to install PWA
  async promptInstall(): Promise<boolean> {
    if (!this.canInstall()) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('[PWA] Install prompt result:', outcome);
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        this.isInstallable = false;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Install prompt error:', error);
      return false;
    }
  }

  // Check if app is running as PWA
  isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
}

// Global PWA installer instance
export const pwaInstaller = new PWAInstaller();

// Offline status management
export class OfflineManager {
  private isOnline = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  // Subscribe to online status changes
  subscribe(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current online status
  getStatus(): boolean {
    return this.isOnline;
  }

  // Ping server to check actual connectivity
  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Global offline manager instance
export const offlineManager = new OfflineManager();
