import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import Head from 'next/head';
import '../src/index.css';
import '../src/App.css';

// Import service worker registration (dynamic import to avoid SSR issues)

export default function App({ Component, pageProps }: AppProps) {
  // Create a client with optimized settings
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  }));

  // Register service worker on mount (client-side only)
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PWA === 'true') {
      // Dynamic import to avoid SSR issues
      import('../src/utils/serviceWorker').then(({ registerServiceWorker }) => {
        registerServiceWorker({
          onUpdate: (registration) => {
            if (confirm('A new version is available. Would you like to update?')) {
              if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          },
          onSuccess: () => {
            console.log('App is cached and ready for offline use');
          },
          onError: (error) => {
            console.error('Service worker registration failed:', error);
          }
        });
      }).catch(error => {
        console.error('Failed to load service worker:', error);
      });
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  );
}
