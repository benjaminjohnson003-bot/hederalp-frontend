import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import the main App component dynamically for better performance
const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Loading Spinner */}
        <div className="text-center mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading SaucerSwap LP Analyzer...</h2>
          <p className="text-gray-500 mt-2">Preparing your advanced analytics dashboard</p>
        </div>

        {/* Static Content for AI Crawlers */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            HederaLP - Advanced SaucerSwap V2 LP Strategy Analyzer
          </h1>
          
          <p className="text-lg text-gray-700 mb-6">
            Professional liquidity provider strategy analyzer for SaucerSwap V2 on Hedera. 
            Optimize your concentrated liquidity positions with advanced analytics and risk assessment.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Scenario Analysis</h3>
              <p className="text-gray-600">Analyze Bear (-20%), Base (current), and Bull (+20%) market scenarios with detailed fee projections and impermanent loss calculations.</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">🎲 Monte Carlo Simulation</h3>
              <p className="text-gray-600">Run 1,000+ simulations to assess risk and expected returns across various market conditions with probability distributions.</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">📈 Historical Backtesting</h3>
              <p className="text-gray-600">Test your strategy against historical price data with HODL comparison to validate performance.</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">💰 APR Comparison</h3>
              <p className="text-gray-600">Compare pool-wide APR vs your concentrated position APR. See how liquidity concentration affects earnings.</p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">⚡ Capital Efficiency</h3>
              <p className="text-gray-600">Analyze utilization rates, range width optimization, and capital efficiency scores for your positions.</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">📉 Impermanent Loss Calculator</h3>
              <p className="text-gray-600">Real-time IL calculations across all scenarios with detailed breakdowns and risk metrics.</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Supported Pools</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>HBAR/USDC (0.15% fee tier) - $17M TVL, 129% APR</li>
            <li>HBAR/DOVU (1.00% fee tier) - $879K TVL, 164% APR</li>
            <li>SAUCE/HBAR, HBARX/HBAR, USDC/WETH, and more</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-6">
            <li>Select a liquidity pool from top 10 pools by TVL</li>
            <li>Set your price range (min/max) for concentrated liquidity</li>
            <li>Enter your liquidity amount in USD</li>
            <li>Choose analysis duration (1 day to 90 days)</li>
            <li>Click "Analyze LP Strategy" to see comprehensive results</li>
          </ol>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 Perfect For:</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Liquidity providers on SaucerSwap V2</li>
              <li>• DeFi yield farmers on Hedera</li>
              <li>• Risk-conscious investors</li>
              <li>• Strategy optimization and backtesting</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Disclaimer:</strong> This tool does not provide financial advice. 
              All information is for educational purposes only. Past performance does not predict future results. 
              Users are responsible for their own investment decisions.
            </p>
          </div>
        </div>
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

