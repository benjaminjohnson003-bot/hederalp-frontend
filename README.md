# HederaLP Frontend

Advanced Liquidity Provider Strategy Analyzer for SaucerSwap V2 on Hedera

## 🚀 Features

- **Real-time LP Strategy Analysis** - Advanced fee calculations and range optimization
- **Interactive Charts** - Price movements, fee earnings, and backtest results
- **Monte Carlo Simulations** - Risk analysis and scenario modeling
- **Performance Dashboard** - Comprehensive metrics and analytics
- **PWA Support** - Offline functionality and mobile-optimized
- **Modern UI/UX** - Responsive design with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React Chart.js 2
- **State Management**: Zustand
- **HTTP Client**: Axios with React Query
- **Deployment**: Vercel

## 🏗️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/hederalp-frontend.git
cd hederalp-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm run analyze      # Analyze bundle size
```

## 🌐 Deployment

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js and configure build settings
3. Environment variables are configured in `vercel.json`
4. API requests are proxied to the backend automatically

### Environment Variables

The following environment variables are configured in `vercel.json`:

- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `NEXT_PUBLIC_ENABLE_ADVANCED_MODE`: Enable advanced features
- `NEXT_PUBLIC_ENABLE_BACKTEST_MODE`: Enable backtesting
- `NEXT_PUBLIC_ENABLE_PWA`: Enable PWA features

## 🔗 Backend Integration

This frontend connects to the HederaLP Backend API:
- Repository: [hederalp-backend](https://github.com/YOUR_USERNAME/hederalp-backend)
- Deployed at: https://hederalp-backend.onrender.com

API requests are automatically proxied through Vercel's edge functions for optimal performance and CORS handling.

## 📱 PWA Features

- Offline functionality
- Installable on mobile devices
- Service worker for caching
- Optimized for mobile performance

## 🔒 Security

- Content Security Policy (CSP) headers
- CORS configuration
- XSS protection
- Frame options security
- HTTPS enforcement

## 📊 Performance

- Code splitting and lazy loading
- Image optimization
- Bundle analysis tools
- Performance monitoring
- Static generation where possible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.