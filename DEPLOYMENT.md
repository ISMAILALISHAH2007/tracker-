# Deployment Guide - Family Location Tracker

This guide covers deploying the Family Location Tracker to Vercel and other platforms.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [Alternative Platforms](#alternative-platforms)
4. [Environment Variables](#environment-variables)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Post-Deployment](#post-deployment)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Mapbox access token (production token recommended)
- [ ] Configured all geofence locations
- [ ] Tested the app locally
- [ ] Reviewed security settings
- [ ] Prepared environment variables
- [ ] Git repository set up (for Vercel Git integration)

## Vercel Deployment

Vercel is the recommended platform for deploying this application due to its excellent support for React and Node.js serverless functions.

### Method 1: Vercel CLI (Recommended)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

#### 3. Configure Project

From the project root directory:

```bash
vercel
```

Answer the setup questions:
- **Set up and deploy?** Yes
- **Which scope?** Select your account/team
- **Link to existing project?** No (first time)
- **Project name?** family-tracker (or your preferred name)
- **Directory?** ./ (current directory)
- **Override settings?** No

#### 4. Set Environment Variables

```bash
# Add Mapbox token
vercel env add VITE_MAPBOX_TOKEN

# Add other variables
vercel env add VITE_API_URL
vercel env add VITE_WS_URL
vercel env add VITE_GEOFENCE_LOCATIONS
vercel env add NODE_ENV
```

For each command, you'll be prompted to:
1. Enter the value
2. Select environment (Production, Preview, Development)
3. Select "All" to apply to all environments

**Production values:**
```
VITE_MAPBOX_TOKEN=pk.your_production_token
VITE_API_URL=https://your-app.vercel.app
VITE_WS_URL=https://your-app.vercel.app
VITE_GEOFENCE_LOCATIONS=[{"name":"Home","lat":37.7749,"lng":-122.4194,"radius":100}]
NODE_ENV=production
```

#### 5. Deploy to Production

```bash
vercel --prod
```

Your app will be deployed and you'll receive a production URL.

### Method 2: Vercel Dashboard (Git Integration)

#### 1. Push to Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### 3. Add Environment Variables

In the project settings:
1. Go to "Settings" > "Environment Variables"
2. Add each variable with appropriate values
3. Select "Production", "Preview", and "Development"
4. Click "Save"

#### 4. Deploy

Click "Deploy" and Vercel will build and deploy your application.

### Method 3: Vercel GitHub Integration (Automatic)

1. Connect your GitHub account to Vercel
2. Push changes to your repository
3. Vercel automatically deploys:
   - `main` branch → Production
   - Other branches → Preview deployments
4. Pull request deployments get unique preview URLs

## Alternative Platforms

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "api"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. Deploy:
```bash
netlify deploy --prod
```

**Note**: WebSocket support on Netlify requires Netlify Edge Functions. Consider using Vercel for better WebSocket support.

### Deploy to Railway

1. Create `railway.toml`:
```toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "npm start"
  restartPolicyType = "always"
```

2. Install Railway CLI:
```bash
npm install -g @railway/cli
```

3. Deploy:
```bash
railway login
railway init
railway up
```

### Deploy to Render

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: family-tracker
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

2. Connect your Git repository in Render dashboard
3. Add environment variables in Render settings
4. Deploy automatically on push

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_MAPBOX_TOKEN` | Mapbox public access token | `pk.eyJ1...` |
| `VITE_API_URL` | Backend API URL | `https://your-app.vercel.app` |
| `VITE_WS_URL` | WebSocket server URL | `https://your-app.vercel.app` |
| `NODE_ENV` | Node environment | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GEOFENCE_LOCATIONS` | Array of geofence locations | `[]` |
| `VITE_APP_NAME` | Application name | `Family Tracker` |
| `VITE_DEFAULT_ZOOM` | Default map zoom level | `12` |
| `VITE_DEFAULT_LAT` | Default latitude | `37.7749` |
| `VITE_DEFAULT_LNG` | Default longitude | `-122.4194` |
| `VITE_LOCATION_UPDATE_INTERVAL` | Update interval (ms) | `10000` |
| `VITE_MAP_REFRESH_INTERVAL` | Map refresh interval (ms) | `5000` |

### Setting Environment Variables

#### Vercel CLI

```bash
vercel env add VARIABLE_NAME
```

#### Vercel Dashboard

1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Click "Add New"
4. Enter key and value
5. Select environments
6. Save

#### Local Development

Create `.env` files:
- `.env` - Local development
- `.env.production` - Production build
- `.env.staging` - Staging environment

## Custom Domain Setup

### Vercel

1. Go to Project Settings > Domains
2. Click "Add"
3. Enter your domain (e.g., `tracker.yourdomain.com`)
4. Follow DNS configuration instructions:

**For Vercel DNS:**
```
Type: CNAME
Name: tracker (or @)
Value: cname.vercel-dns.com
```

**For External DNS:**
```
Type: A
Name: tracker
Value: 76.76.19.19
```

5. Wait for DNS propagation (up to 48 hours)
6. Update environment variables:
```bash
vercel env add VITE_API_URL
# Enter: https://tracker.yourdomain.com

vercel env add VITE_WS_URL
# Enter: https://tracker.yourdomain.com
```

7. Redeploy:
```bash
vercel --prod
```

### SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt. No additional configuration needed.

## Post-Deployment

### 1. Test the Deployment

- [ ] Open the production URL
- [ ] Test tracker role on mobile
- [ ] Test monitor role on desktop
- [ ] Verify WebSocket connection
- [ ] Check geofence notifications
- [ ] Test PWA installation
- [ ] Verify location updates

### 2. Configure Notifications

Enable browser notifications:
1. Open the app
2. Grant notification permissions
3. Test geofence entry/exit

### 3. Monitor Performance

Check Vercel Analytics:
1. Go to Project > Analytics
2. Review:
   - Page load times
   - Core Web Vitals
   - Traffic patterns
   - Error rates

### 4. Set Up Error Tracking (Optional)

Integrate Sentry for error tracking:

```bash
npm install @sentry/react @sentry/vite-plugin
```

Configure in `vite.config.js`:
```javascript
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "family-tracker"
    })
  ]
});
```

## Monitoring and Maintenance

### Regular Checks

- **Weekly**: Check Vercel deployment logs
- **Monthly**: Review Mapbox usage and costs
- **Quarterly**: Update dependencies

### Monitoring Tools

1. **Vercel Logs**: Real-time function logs
2. **Vercel Analytics**: Performance metrics
3. **Mapbox Dashboard**: API usage statistics
4. **Browser DevTools**: Client-side debugging

### Updating the App

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install
cd api && npm install && cd ..

# Test locally
npm run dev

# Deploy
vercel --prod
```

### Scaling Considerations

**Free Tier Limits (Vercel):**
- 100GB bandwidth/month
- 100 hours serverless function execution
- Unlimited deployments

**When to Upgrade:**
- More than 10 concurrent users
- Frequent WebSocket connections
- High location update frequency
- Need for custom domains (multiple)

**Optimization Strategies:**
- Increase location update intervals
- Implement Redis for session storage
- Use CDN for static assets
- Add rate limiting

## Troubleshooting

### WebSocket Connection Fails

**Symptoms**: Real-time updates not working

**Solutions**:
1. Check CORS settings in `api/.env`:
```env
CORS_ORIGIN=https://your-app.vercel.app
```

2. Verify WebSocket URL matches API URL
3. Check Vercel function logs for errors
4. Ensure Socket.IO transport settings:
```javascript
const socket = io(VITE_WS_URL, {
  transports: ['websocket', 'polling']
});
```

### Environment Variables Not Loading

**Symptoms**: Map not loading, features broken

**Solutions**:
1. Verify variables in Vercel dashboard
2. Redeploy after adding variables:
```bash
vercel --prod
```
3. Check variable names (must start with `VITE_`)
4. Clear browser cache

### Build Failures

**Symptoms**: Deployment fails during build

**Solutions**:
1. Check build logs in Vercel
2. Verify `package.json` scripts
3. Ensure all dependencies are listed
4. Test build locally:
```bash
npm run build
```

### Mapbox Rate Limits

**Symptoms**: Map tiles not loading

**Solutions**:
1. Check Mapbox dashboard usage
2. Upgrade Mapbox plan if needed
3. Implement request caching
4. Reduce map refresh frequency

### PWA Not Installing

**Symptoms**: Install prompt not showing

**Solutions**:
1. Verify HTTPS is enabled (required for PWA)
2. Check `manifest.json` is accessible
3. Verify service worker registration
4. Check browser console for errors
5. Test with Lighthouse PWA audit

### Location Not Updating

**Symptoms**: Tracker position doesn't update

**Solutions**:
1. Check location permissions in browser
2. Verify HTTPS (required for geolocation)
3. Check network connectivity
4. Verify WebSocket connection
5. Check browser console for errors

## Security Best Practices

1. **Use Environment Variables**: Never commit tokens to Git
2. **Enable HTTPS**: Always use HTTPS in production
3. **Configure CORS**: Restrict to your domain only
4. **Rate Limiting**: Add rate limits to API endpoints
5. **Authentication**: Implement user authentication for production
6. **Token Rotation**: Rotate Mapbox tokens periodically
7. **Security Headers**: Add security headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Cost Estimation

### Free Tier (Suitable for Family Use)

**Vercel:**
- 100GB bandwidth (sufficient for ~100 users/month)
- 100 hours function execution
- Free SSL certificates
- Cost: $0/month

**Mapbox:**
- 50,000 map loads/month
- Unlimited style requests
- Cost: $0/month

**Total**: $0/month for typical family use

### Paid Tier (Extended Family/Group)

**Vercel Pro** ($20/month):
- 1TB bandwidth
- 1000 hours function execution
- Analytics included

**Mapbox Pay-as-you-go**:
- $5 per 1,000 additional map loads
- Typically $5-10/month for active use

**Total**: ~$25-30/month

## Support and Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Mapbox Documentation](https://docs.mapbox.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## Rollback Procedure

If deployment issues occur:

```bash
# List deployments
vercel ls

# Promote a previous deployment
vercel promote <deployment-url>

# Or rollback via dashboard
# Go to Deployments > Select previous > Promote to Production
```

## Backup Strategy

1. **Code**: Git repository (GitHub/GitLab)
2. **Configuration**: Export environment variables
3. **Vercel Settings**: Document in version control

No database backup needed (in-memory storage only).

---

For additional help, refer to the main README.md or contact support.
