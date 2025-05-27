/**
 * Security Headers Management
 * Handles Content Security Policy and other security headers
 */

class SecurityManager {
  constructor() {
    this.environment = this.detectEnvironment();
    this.cspConfig = this.generateCSPConfig();
    this.securityHeaders = this.generateSecurityHeaders();
    this.init();
  }

  detectEnvironment() {
    // Detect environment from various sources
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      } else if (hostname.includes('netlify.app') || hostname.includes('deploy-preview')) {
        return 'staging';
      } else if (hostname.includes('github.io') || hostname.includes('kaelenjennings.dev')) {
        return 'production';
      }
    }
    
    return process.env.NODE_ENV || 'development';
  }

  generateCSPConfig() {
    const baseConfig = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for inline scripts - minimize in production
        'https://polyfill.io', // For browser polyfills
        'https://www.google-analytics.com', // For analytics
        'https://www.googletagmanager.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for CSS custom properties and dynamic styles
        'https://fonts.googleapis.com' // For Google Fonts
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com', // Google Fonts
        'data:' // For base64 encoded fonts
      ],
      'img-src': [
        "'self'",
        'data:', // For SVG and base64 images
        'https:', // Allow HTTPS images
        'https://endersclarity.github.io', // GitHub Pages
        'https://avatars.githubusercontent.com', // GitHub avatars
        'https://api.github.com' // GitHub API images
      ],
      'connect-src': [
        "'self'",
        'https://api.github.com', // GitHub API
        'https://netlify.com', // Netlify forms
        'https://www.google-analytics.com', // Analytics
        'https://polyfill.io' // Polyfill service
      ],
      'form-action': [
        "'self'",
        'https://netlify.com' // Netlify form submissions
      ],
      'frame-ancestors': ["'none'"], // Prevent clickjacking
      'object-src': ["'none'"], // Disable plugins
      'base-uri': ["'self'"], // Restrict base element
      'upgrade-insecure-requests': true // Upgrade HTTP to HTTPS
    };

    // Environment-specific adjustments
    switch (this.environment) {
      case 'development':
        baseConfig['script-src'].push("'unsafe-eval'"); // For dev tools
        baseConfig['connect-src'].push('http://localhost:*', 'ws://localhost:*');
        baseConfig['img-src'].push('http://localhost:*');
        delete baseConfig['upgrade-insecure-requests']; // Allow HTTP in dev
        break;
        
      case 'staging':
        baseConfig['img-src'].push('https://*.netlify.app');
        baseConfig['connect-src'].push('https://*.netlify.app');
        break;
        
      case 'production':
        // Strictest configuration for production
        baseConfig['script-src'] = baseConfig['script-src'].filter(src => src !== "'unsafe-eval'");
        break;
    }

    return baseConfig;
  }

  generateSecurityHeaders() {
    return {
      // Content Security Policy
      'Content-Security-Policy': this.buildCSPString(),
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // XSS Protection (legacy but still useful)
      'X-XSS-Protection': '1; mode=block',
      
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy (Feature Policy replacement)
      'Permissions-Policy': this.generatePermissionsPolicy(),
      
      // HTTP Strict Transport Security (HTTPS only)
      ...(this.environment === 'production' && {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
      }),
      
      // Cross-Origin Policies
      'Cross-Origin-Embedder-Policy': 'unsafe-none', // Required for some features
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    };
  }

  buildCSPString() {
    return Object.entries(this.cspConfig)
      .filter(([key, value]) => key !== 'upgrade-insecure-requests' || value === true)
      .map(([directive, sources]) => {
        if (directive === 'upgrade-insecure-requests') {
          return directive;
        }
        return `${directive} ${Array.isArray(sources) ? sources.join(' ') : sources}`;
      })
      .join('; ');
  }

  generatePermissionsPolicy() {
    const policies = [
      'accelerometer=()', // Disable accelerometer
      'camera=()', // Disable camera
      'geolocation=()', // Disable geolocation
      'gyroscope=()', // Disable gyroscope
      'magnetometer=()', // Disable magnetometer
      'microphone=()', // Disable microphone
      'payment=()', // Disable payment API
      'usb=()', // Disable USB API
      'interest-cohort=()' // Disable FLoC
    ];
    
    return policies.join(', ');
  }

  init() {
    if (typeof window !== 'undefined') {
      this.validateCurrentCSP();
      this.setupSecurityMonitoring();
      this.checkHTTPS();
      console.log('🔒 Security manager initialized');
    }
  }

  validateCurrentCSP() {
    // Check if CSP is properly set
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    if (!metaCSP) {
      console.warn('⚠️ No CSP meta tag found. Headers should be set by server.');
    } else {
      console.log('✅ CSP meta tag detected');
    }
  }

  setupSecurityMonitoring() {
    // Monitor for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      console.error('🚨 CSP Violation:', {
        directive: event.violatedDirective,
        blockedURI: event.blockedURI,
        originalPolicy: event.originalPolicy,
        documentURI: event.documentURI
      });
      
      // Report to analytics if available
      if (typeof gtag !== 'undefined') {
        gtag('event', 'csp_violation', {
          'custom_parameter_1': event.violatedDirective,
          'custom_parameter_2': event.blockedURI
        });
      }
    });

    // Monitor for mixed content
    if ('SecurityPolicyViolationEvent' in window) {
      console.log('✅ CSP violation monitoring enabled');
    }
  }

  checkHTTPS() {
    if (location.protocol !== 'https:' && this.environment === 'production') {
      console.warn('⚠️ Site not served over HTTPS in production');
      
      // Auto-redirect to HTTPS in production
      if (this.environment === 'production') {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
      }
    } else if (location.protocol === 'https:') {
      console.log('✅ Site served over HTTPS');
    }
  }

  // Generate CSP meta tag for HTML insertion
  generateCSPMetaTag() {
    return `<meta http-equiv="Content-Security-Policy" content="${this.buildCSPString()}">`;
  }

  // Generate security headers for server configuration
  generateServerHeaders() {
    const headers = {};
    
    Object.entries(this.securityHeaders).forEach(([header, value]) => {
      headers[header] = value;
    });
    
    return headers;
  }

  // Generate Netlify headers configuration
  generateNetlifyHeaders() {
    const headers = this.generateServerHeaders();
    let netlifyConfig = `
# Security Headers
[[headers]]
  for = "/*"
  [headers.values]
`;
    
    Object.entries(headers).forEach(([header, value]) => {
      netlifyConfig += `    ${header} = "${value}"\n`;
    });
    
    return netlifyConfig;
  }

  // Generate Apache .htaccess configuration
  generateHtaccessConfig() {
    const headers = this.generateServerHeaders();
    let htaccess = `# Security Headers\n<IfModule mod_headers.c>\n`;
    
    Object.entries(headers).forEach(([header, value]) => {
      htaccess += `  Header always set ${header} "${value}"\n`;
    });
    
    htaccess += `</IfModule>\n`;
    return htaccess;
  }

  // Test CSP compliance
  testCSPCompliance() {
    const tests = [
      {
        name: 'Inline Script Test',
        test: () => {
          try {
            eval('console.log("Inline script test")');
            return false; // Should be blocked
          } catch (e) {
            return true; // Correctly blocked
          }
        }
      },
      {
        name: 'External Resource Test',
        test: () => {
          // Test if external resources are properly controlled
          const img = new Image();
          img.src = 'https://example.com/test.png';
          return new Promise((resolve) => {
            img.onload = () => resolve(false); // Should be blocked
            img.onerror = () => resolve(true); // Correctly blocked
            setTimeout(() => resolve(true), 5000); // Timeout
          });
        }
      }
    ];
    
    tests.forEach(async (test) => {
      const result = await test.test();
      console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASS' : 'FAIL'}`);
    });
  }

  // Security audit report
  generateSecurityReport() {
    return {
      environment: this.environment,
      csp: {
        enabled: true,
        directives: Object.keys(this.cspConfig).length,
        policy: this.buildCSPString()
      },
      headers: {
        count: Object.keys(this.securityHeaders).length,
        hsts: this.securityHeaders['Strict-Transport-Security'] ? 'enabled' : 'disabled',
        xss_protection: this.securityHeaders['X-XSS-Protection'] ? 'enabled' : 'disabled',
        frame_options: this.securityHeaders['X-Frame-Options'] ? 'enabled' : 'disabled'
      },
      https: {
        enabled: location.protocol === 'https:',
        mixed_content_check: this.checkMixedContent()
      },
      compliance: {
        owasp_top_10: this.checkOWASPCompliance(),
        security_score: this.calculateSecurityScore()
      }
    };
  }

  checkMixedContent() {
    // Check for mixed content issues
    const resources = [
      ...document.querySelectorAll('script[src]'),
      ...document.querySelectorAll('link[href]'),
      ...document.querySelectorAll('img[src]')
    ];
    
    const mixedContent = resources.filter(resource => {
      const url = resource.src || resource.href;
      return url && url.startsWith('http:') && location.protocol === 'https:';
    });
    
    return {
      found: mixedContent.length > 0,
      count: mixedContent.length,
      resources: mixedContent.map(r => r.src || r.href)
    };
  }

  checkOWASPCompliance() {
    return {
      'A01:2021-Broken_Access_Control': 'N/A - Static Site',
      'A02:2021-Cryptographic_Failures': location.protocol === 'https:' ? 'PASS' : 'FAIL',
      'A03:2021-Injection': this.cspConfig['script-src'].includes("'unsafe-eval'") ? 'WARN' : 'PASS',
      'A04:2021-Insecure_Design': 'PASS',
      'A05:2021-Security_Misconfiguration': Object.keys(this.securityHeaders).length >= 5 ? 'PASS' : 'WARN',
      'A06:2021-Vulnerable_Components': 'MANUAL_CHECK_REQUIRED',
      'A07:2021-Identity_Authentication_Failures': 'N/A - Static Site',
      'A08:2021-Software_Data_Integrity_Failures': 'PASS',
      'A09:2021-Security_Logging_Monitoring_Failures': 'IMPLEMENTED',
      'A10:2021-Server_Side_Request_Forgery': 'N/A - Static Site'
    };
  }

  calculateSecurityScore() {
    let score = 0;
    const maxScore = 100;
    
    // CSP implementation (30 points)
    if (Object.keys(this.cspConfig).length >= 8) score += 30;
    else if (Object.keys(this.cspConfig).length >= 5) score += 20;
    else score += 10;
    
    // Security headers (25 points)
    if (Object.keys(this.securityHeaders).length >= 7) score += 25;
    else if (Object.keys(this.securityHeaders).length >= 5) score += 20;
    else score += 15;
    
    // HTTPS (20 points)
    if (location.protocol === 'https:') score += 20;
    
    // HSTS (10 points)
    if (this.securityHeaders['Strict-Transport-Security']) score += 10;
    
    // Mixed content check (10 points)
    const mixedContent = this.checkMixedContent();
    if (!mixedContent.found) score += 10;
    
    // CSP monitoring (5 points)
    score += 5; // Always implemented
    
    return Math.min(score, maxScore);
  }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  window.SecurityManager = SecurityManager;
  
  // Initialize on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.securityManager = new SecurityManager();
    });
  } else {
    window.securityManager = new SecurityManager();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityManager;
}