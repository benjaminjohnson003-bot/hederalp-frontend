# Frontend Deployment Guide

This guide covers deploying the SaucerSwap LP Strategy Analyzer frontend to various platforms.

## Prerequisites

- Node.js 18+ installed
- Backend API deployed and accessible
- Environment variables configured

## Environment Variables

Create a `.env.local` file (or configure in your deployment platform):

```bash
# Backend API Base URL
VITE_API_BASE_URL=https://hederalp-backend.onrender.com

# Optional: Feature flags
VITE_ENABLE_ADVANCED_MODE=true
VITE_ENABLE_BACKTEST_MODE=true
VITE_ENABLE_PWA=true

# Optional: Debug mode
VITE_DEBUG=false

# Optional: Cache settings (in milliseconds)
VITE_CACHE_TTL=300000
```

## Deployment Options

### 1. Vercel (Recommended)

#### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO/tree/main/frontend)

#### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Build and deploy
cd frontend
npm run build
vercel --prod
```

#### Configuration
- The `vercel.json` file is already configured
- Set environment variables in Vercel dashboard
- Custom domain can be configured in Vercel settings

### 2. Netlify

#### Quick Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/YOUR_REPO)

#### Manual Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

#### Configuration
- The `netlify.toml` file is already configured
- Set environment variables in Netlify dashboard
- Custom domain can be configured in Netlify settings

### 3. Static File Hosting (Alternative)

For platforms like GitHub Pages, Surge.sh, or any static hosting:

```bash
cd frontend
npm run build
# Upload the 'dist' folder to your hosting provider
```

## Backend Integration

### CORS Configuration
The backend is configured to allow requests from:
- `localhost:3000` (development)
- `localhost:4173` (preview)
- `*.vercel.app` (Vercel deployments)
- `*.netlify.app` and `*.netlify.com` (Netlify deployments)

### API Proxy
Both Vercel and Netlify are configured to proxy `/api/*` requests to the backend:
- Vercel: Uses `vercel.json` routes
- Netlify: Uses `netlify.toml` redirects

## Bundle with FastAPI (Optional)

To serve the frontend as static files from the FastAPI backend:

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Copy the `dist` folder to the backend:
```bash
cp -r dist ../static
```

3. Update the FastAPI backend to serve static files:
```python
from fastapi.staticfiles import StaticFiles

# Add to main.py after creating the FastAPI app
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

## Performance Optimization

### Bundle Analysis
```bash
cd frontend
npm run analyze
```

### Build Optimizations
The build is configured with:
- Code splitting by vendor, charts, and utilities
- Tree shaking for unused code
- Source maps for debugging
- Manual chunk optimization

### Caching Strategy
- Static assets: 1 year cache (immutable)
- HTML files: No cache (always fresh)
- API responses: Cached by React Query (5 minutes default)

## Security Headers

Both Vercel and Netlify configurations include security headers:
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (Netlify only)

## Monitoring and Analytics

### Error Tracking
Consider adding error tracking services:
- Sentry
- LogRocket
- Bugsnag

### Performance Monitoring
Consider adding performance monitoring:
- Vercel Analytics (built-in)
- Google Analytics
- Mixpanel

### Health Checks
The frontend includes built-in health checks:
- API connectivity status
- Cache performance metrics
- Real-time error boundaries

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify backend CORS configuration
   - Check environment variables
   - Ensure API proxy is working

2. **Build Failures**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check TypeScript errors

3. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` is correct
   - Check network connectivity
   - Test API endpoints directly

4. **Performance Issues**
   - Run bundle analyzer
   - Check cache configuration
   - Monitor network requests

### Debug Mode
Enable debug mode for troubleshooting:
```bash
VITE_DEBUG=true npm run build
```

## Custom Domain Setup

### Vercel
1. Add domain in Vercel dashboard
2. Configure DNS records
3. SSL certificates are automatic

### Netlify
1. Add domain in Netlify dashboard
2. Configure DNS records
3. SSL certificates are automatic

## Continuous Deployment

Both platforms support automatic deployments:
- Connect your Git repository
- Configure build settings
- Deployments trigger on git push

### GitHub Actions (Optional)
For custom CI/CD, see the `.github/workflows` folder for example configurations.

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review build logs
3. Test locally first with `npm run preview`
4. Contact platform support if needed

## Next Steps

After successful deployment:
1. Test all functionality
2. Set up monitoring
3. Configure custom domain
4. Add analytics tracking
5. Set up error reporting

