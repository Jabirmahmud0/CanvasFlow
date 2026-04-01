# Vercel Deployment Guide for CanvasFlow

This guide walks you through deploying CanvasFlow to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally

## Quick Deploy

### Option 1: Vercel Dashboard (Recommended)

1. **Import your project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel will auto-detect it as a Vite project

2. **Configure build settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set environment variables**
   
   In Vercel dashboard > Project Settings > Environment Variables, add:
   
   | Variable | Production | Preview | Development |
   |----------|------------|---------|-------------|
   | `VITE_SENTRY_DSN` | Your DSN | Your DSN | - |
   | `VITE_SENTRY_ENVIRONMENT` | `production` | `preview` | `development` |
   | `VITE_ANALYTICS_PROVIDER` | `google` | - | - |
   | `VITE_ANALYTICS_ID` | Your GA4 ID | - | - |

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your project

### Option 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (first time)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Configuration

The `vercel.json` file contains:

- **SPA Routing**: Rewrites all routes to `/index.html` for client-side routing
- **Security Headers**: XSS protection, content-type sniffing prevention
- **Caching**: Static assets cached for 1 year
- **Environment Variables**: Mapped to Vercel secrets

## Local Preview

Preview your Vercel build locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run local dev server with Vercel environment
vercel dev
```

## Custom Domains

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL is automatically provisioned

## Environment-Specific Deployments

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | `yourdomain.com` |
| `develop` | Preview | `yourproject-git-develop.vercel.app` |
| `feature/*` | Preview | `yourproject-git-feature.vercel.app` |

## Monitoring

After deployment:

1. **Vercel Analytics**: Enable in Project Settings > Analytics
2. **Vercel Speed Insights**: Enable in Project Settings > Speed Insights
3. **Sentry**: Already configured in the app, check your Sentry dashboard

## Troubleshooting

### Build fails

```bash
# Test build locally
npm run build

# Check for errors in build output
```

### Environment variables not working

- Ensure variables are prefixed with `VITE_`
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Routing issues

- The `vercel.json` rewrites handle client-side routing
- Ensure all links use React Router, not anchor tags

## Performance Optimization

The build is already optimized with:

- Code splitting (vendor chunks)
- Tree shaking
- Minification with Terser
- Asset caching headers

Monitor bundle sizes in Vercel dashboard > Deployments > Bundle Size.

## CI/CD Integration

Vercel automatically deploys on:

- Push to `main` → Production
- Push to other branches → Preview URL
- Pull requests → Comment with preview link

## Updating Deployments

Simply push to your Git repository:

```bash
git push origin main
```

Vercel will automatically redeploy.

## Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
- [Environment Variables](https://vercel.com/docs/environment-variables)
