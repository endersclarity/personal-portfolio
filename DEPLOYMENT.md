# 🚀 Deployment Guide

This document provides comprehensive instructions for deploying the Kaelen Jennings Portfolio to various platforms.

## 📋 Pre-Deployment Checklist

Before deploying, ensure the following:

- [ ] All features are working correctly
- [ ] Images are optimized (WebP format with fallbacks)
- [ ] HTML validation passes
- [ ] Lighthouse scores meet requirements (90+)
- [ ] Contact forms are properly configured
- [ ] Service Worker is properly registered
- [ ] PWA manifest is complete

## 🎯 Supported Platforms

### 1. GitHub Pages (Primary)

**Setup:**
```bash
# Build and deploy
npm run deploy

# Production deployment
npm run deploy:production
```

**Manual Setup:**
1. Go to repository Settings → Pages
2. Set source to "Deploy from a branch"
3. Select `gh-pages` branch
4. Wait 5-10 minutes for deployment

**Custom Domain Setup:**
1. Add your domain to `CNAME` file
2. Configure DNS with your domain provider:
   ```
   Type: CNAME
   Name: www
   Value: endersclarity.github.io
   ```
3. Enable "Enforce HTTPS" in GitHub Pages settings

### 2. Netlify (Alternative)

**Setup:**
```bash
# Deploy to Netlify
npm run deploy:netlify

# Production deployment
npm run deploy:netlify -- --production
```

**Manual Setup:**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.` (root)
4. Configure environment variables if needed

**Features:**
- Automatic deployments on push
- Deploy previews for PRs
- Form handling (already configured)
- Edge functions support
- Advanced headers and redirects

### 3. Vercel (Alternative)

**Setup:**
```bash
# Deploy to Vercel
npm run deploy:vercel
```

**Manual Setup:**
1. Import GitHub repository
2. Framework preset: "Other"
3. Build command: `npm run build`
4. Output directory: `.` (root)

## 🔧 Build Configuration

### Environment Variables

Set the following environment variables for different platforms:

**GitHub Pages:**
- Automatically uses repository name for base URL
- No additional configuration needed

**Netlify:**
```env
NODE_ENV=production
NETLIFY_SITE_ID=your-site-id
```

**Vercel:**
```env
NODE_ENV=production
VERCEL_PROJECT_ID=your-project-id
```

### Build Commands

| Platform | Build Command | Output Directory |
|----------|---------------|------------------|
| GitHub Pages | `npm run build` | `.` (root) |
| Netlify | `npm run build` | `.` (root) |
| Vercel | `npm run build` | `.` (root) |

## 📊 Performance Optimization

### Automatic Optimizations

The deployment process includes:

1. **Image Optimization**
   - WebP conversion with fallbacks
   - Responsive image generation
   - File size optimization

2. **Code Optimization**
   - HTML minification
   - CSS optimization
   - JavaScript optimization

3. **Caching**
   - Service Worker caching
   - CDN caching headers
   - Browser caching optimization

### Lighthouse Targets

| Metric | Target Score |
|--------|--------------|
| Performance | 90+ |
| Accessibility | 90+ |
| Best Practices | 90+ |
| SEO | 90+ |
| PWA | 80+ |

## 🔒 Security Configuration

### Headers

Security headers are automatically configured:

```toml
# Example for Netlify
[headers.values]
  X-Frame-Options = "DENY"
  X-Content-Type-Options = "nosniff"
  X-XSS-Protection = "1; mode=block"
  Content-Security-Policy = "default-src 'self'; ..."
```

### HTTPS

- GitHub Pages: Automatic with custom domains
- Netlify: Automatic with Let's Encrypt
- Vercel: Automatic with custom certificates

## 🌐 Custom Domain Setup

### DNS Configuration

For `www.kaelenjennings.dev`:

1. **CNAME Record:**
   ```
   Type: CNAME
   Name: www
   Value: endersclarity.github.io
   ```

2. **Apex Domain Redirect:**
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```

3. **CNAME File:**
   ```
   www.kaelenjennings.dev
   ```

### SSL Certificate

- Automatic with GitHub Pages, Netlify, and Vercel
- Force HTTPS redirect configured
- HSTS headers enabled

## 📱 Progressive Web App

### Manifest Configuration

The PWA manifest is configured for:
- Standalone display mode
- Custom app icons
- App shortcuts
- Offline capability

### Service Worker

Features:
- Offline caching
- Background sync
- Push notifications (ready for future implementation)

## 🔍 SEO Configuration

### Search Engine Optimization

Automatically configured:
- Sitemap.xml generation
- Robots.txt optimization
- Structured data (Schema.org)
- Open Graph meta tags
- Twitter Card meta tags

### Search Engine Submission

After deployment, submit to:
1. [Google Search Console](https://search.google.com/search-console)
2. [Bing Webmaster Tools](https://www.bing.com/webmasters)

## 📈 Monitoring

### Analytics Setup

1. Google Analytics 4
2. Performance monitoring
3. Error tracking
4. User behavior analytics

### Performance Monitoring

- Lighthouse CI for continuous monitoring
- Core Web Vitals tracking
- Performance budget alerts

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Service Worker Issues:**
- Clear browser cache
- Check browser developer tools
- Verify SW registration

**Form Submission Issues:**
- Verify Netlify forms configuration
- Check honeypot field setup
- Test form validation

### Debug Mode

Enable debug mode for development:
```bash
NODE_ENV=development npm run dev
```

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Review platform-specific documentation
3. Test locally with `npm run preview`
4. Verify all environment variables

---

**Last Updated:** 2025-05-27
**Version:** 1.0.0