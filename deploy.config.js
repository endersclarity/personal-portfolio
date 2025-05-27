/**
 * Deployment Configuration
 * Environment-specific settings for production deployment
 */

const deployConfig = {
  // Production environment (GitHub Pages)
  production: {
    baseUrl: 'https://endersclarity.github.io/personal-portfolio',
    assetsUrl: 'https://endersclarity.github.io/personal-portfolio/assets',
    apiUrl: 'https://api.github.com',
    environment: 'production',
    debug: false,
    analytics: {
      enabled: true,
      trackingId: 'GA_TRACKING_ID' // Replace with actual Google Analytics ID
    },
    performance: {
      enableServiceWorker: true,
      enablePrefetch: true,
      enableLazyLoading: true,
      imageOptimization: true
    },
    security: {
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://endersclarity.github.io"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://api.github.com", "https://netlify.com"],
        formAction: ["'self'", "https://netlify.com"]
      },
      httpsRedirect: true,
      hsts: true
    },
    seo: {
      sitemap: true,
      robotsTxt: true,
      structuredData: true,
      openGraph: true,
      twitterCards: true
    }
  },

  // Staging environment (Netlify Deploy Previews)
  staging: {
    baseUrl: 'https://deploy-preview-{PR_NUMBER}--kaelen-portfolio.netlify.app',
    assetsUrl: 'https://deploy-preview-{PR_NUMBER}--kaelen-portfolio.netlify.app/assets',
    apiUrl: 'https://api.github.com',
    environment: 'staging',
    debug: true,
    analytics: {
      enabled: false
    },
    performance: {
      enableServiceWorker: false,
      enablePrefetch: false,
      enableLazyLoading: true,
      imageOptimization: true
    },
    security: {
      contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*.netlify.app"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow eval for debugging
        connectSrc: ["'self'", "https://api.github.com", "https://netlify.com"],
        formAction: ["'self'", "https://netlify.com"]
      },
      httpsRedirect: false,
      hsts: false
    },
    seo: {
      sitemap: false,
      robotsTxt: false, // Prevent indexing of staging
      structuredData: true,
      openGraph: false,
      twitterCards: false
    }
  },

  // Development environment
  development: {
    baseUrl: 'http://localhost:8000',
    assetsUrl: 'http://localhost:8000/assets',
    apiUrl: 'https://api.github.com',
    environment: 'development',
    debug: true,
    analytics: {
      enabled: false
    },
    performance: {
      enableServiceWorker: false,
      enablePrefetch: false,
      enableLazyLoading: false, // Disable for faster dev
      imageOptimization: false
    },
    security: {
      contentSecurityPolicy: null, // Disable CSP in development
      httpsRedirect: false,
      hsts: false
    },
    seo: {
      sitemap: false,
      robotsTxt: false,
      structuredData: false,
      openGraph: false,
      twitterCards: false
    }
  }
};

// Custom domain configuration (when ready)
const customDomainConfig = {
  domain: 'kaelenjennings.dev', // Replace with actual custom domain
  subdomain: 'www',
  fullDomain: 'www.kaelenjennings.dev',
  redirects: [
    {
      from: 'kaelenjennings.dev',
      to: 'www.kaelenjennings.dev',
      status: 301
    },
    {
      from: 'endersclarity.github.io/personal-portfolio',
      to: 'www.kaelenjennings.dev',
      status: 301
    }
  ],
  ssl: {
    enabled: true,
    forceHttps: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
};

// Build configuration
const buildConfig = {
  outputDir: 'dist',
  assetsDir: 'assets',
  publicPath: '/',
  sourceMaps: false, // Disable source maps in production
  minify: {
    html: true,
    css: true,
    js: true
  },
  optimization: {
    images: {
      webp: true,
      quality: 85,
      responsive: true
    },
    fonts: {
      preload: true,
      display: 'swap'
    },
    critical: {
      inline: true,
      minify: true
    }
  }
};

// Export configuration based on environment
function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  const config = deployConfig[env] || deployConfig.development;
  
  return {
    ...config,
    customDomain: customDomainConfig,
    build: buildConfig
  };
}

// Browser globals
if (typeof window !== 'undefined') {
  window.DEPLOY_CONFIG = getConfig();
}

module.exports = {
  deployConfig,
  customDomainConfig,
  buildConfig,
  getConfig
};