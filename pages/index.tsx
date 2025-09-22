import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import the main App component dynamically for better performance
const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Loading SaucerSwap LP Analyzer...</h2>
        <p className="text-gray-500 mt-2">Preparing your advanced analytics dashboard</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <Head>
        <title>SaucerSwap V2 LP Strategy Analyzer</title>
        <meta name="description" content="Advanced liquidity provider strategy analysis tool for SaucerSwap V2 with scenario analysis, Monte Carlo simulation, and backtesting." />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LP Analyzer" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="SaucerSwap LP Strategy Analyzer" />
        <meta property="og:description" content="Advanced liquidity provider strategy analyzer for SaucerSwap V2 pools on Hedera" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icons/icon-512x512.png" />
        <meta property="og:url" content="https://hederalp.com" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SaucerSwap LP Strategy Analyzer" />
        <meta name="twitter:description" content="Advanced liquidity provider strategy analyzer for SaucerSwap V2 pools on Hedera" />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />
        
        {/* Preconnect to Backend */}
        <link rel="preconnect" href="https://hederalp-backend.onrender.com" />
        <link rel="dns-prefetch" href="https://hederalp-backend.onrender.com" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading SaucerSwap LP Analyzer...</h2>
            <p className="text-gray-500 mt-2">Preparing your advanced analytics dashboard</p>
          </div>
        </div>
      }>
        <App />
      </Suspense>
    </>
  );
}

