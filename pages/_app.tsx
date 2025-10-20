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
        {/* Basic Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>HederaLP - Advanced SaucerSwap V2 LP Strategy Analyzer</title>
        <meta name="description" content="Professional liquidity provider strategy analyzer for SaucerSwap V2 on Hedera. Features: Scenario analysis, Monte Carlo simulation, backtesting, APR comparison, and capital efficiency metrics. Optimize your concentrated liquidity positions." />
        <meta name="keywords" content="SaucerSwap, Hedera, HBAR, liquidity provider, LP, DeFi, yield farming, concentrated liquidity, Uniswap V3, APR calculator, impermanent loss" />
        <meta name="author" content="HederaLP" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hederalp.com/" />
        <meta property="og:title" content="HederaLP - Advanced SaucerSwap V2 LP Strategy Analyzer" />
        <meta property="og:description" content="Professional liquidity provider strategy analyzer for SaucerSwap V2. Analyze scenarios, run Monte Carlo simulations, backtest strategies, and optimize your LP positions." />
        <meta property="og:image" content="https://hederalp.com/og-image.png" />
        <meta property="og:site_name" content="HederaLP" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://hederalp.com/" />
        <meta name="twitter:title" content="HederaLP - Advanced SaucerSwap V2 LP Strategy Analyzer" />
        <meta name="twitter:description" content="Professional liquidity provider strategy analyzer for SaucerSwap V2. Optimize your concentrated liquidity positions with advanced analytics." />
        <meta name="twitter:image" content="https://hederalp.com/og-image.png" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <link rel="canonical" href="https://hederalp.com/" />
        
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "HederaLP",
            "description": "Advanced liquidity provider strategy analyzer for SaucerSwap V2 on Hedera",
            "url": "https://hederalp.com",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Scenario Analysis (Bear/Base/Bull)",
              "Monte Carlo Simulation",
              "Historical Backtesting",
              "APR Comparison",
              "Capital Efficiency Metrics",
              "Impermanent Loss Calculator",
              "Real-time Pool Data"
            ]
          })}
        </script>
      </Head>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  );
}
