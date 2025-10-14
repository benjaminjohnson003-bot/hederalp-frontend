/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['hederalp-backend.onrender.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hederalp-backend.onrender.com',
    NEXT_PUBLIC_ENABLE_ADVANCED_MODE: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_MODE || 'true',
    NEXT_PUBLIC_ENABLE_BACKTEST_MODE: process.env.NEXT_PUBLIC_ENABLE_BACKTEST_MODE || 'true',
    NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA || 'true',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https: blob:;
              font-src 'self' data: https://fonts.gstatic.com;
              connect-src 'self' https://hederalp-backend.onrender.com https://api.saucerswap.finance https://vercel.live wss://ws-us3.pusher.com https://fonts.googleapis.com;
              frame-src 'none';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim(),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|webp|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects and rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hederalp-backend.onrender.com'}/:path*`,
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        charts: {
          test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|chartjs-.*)[\\/]/,
          name: 'charts',
          chunks: 'all',
          priority: 20,
        },
        common: {
          minChunks: 2,
          chunks: 'all',
          name: 'common',
          priority: 5,
        },
      },
    };
    
    // Add bundle analyzer
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.ANALYZE': JSON.stringify('true'),
        })
      );
    }
    
    return config;
  },
  
  // Output configuration for static export if needed
  output: 'standalone',
  
  // Experimental features
  experimental: {
    webpackBuildWorker: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig);
