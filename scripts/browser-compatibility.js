/**
 * Browser Compatibility Module
 * Handles feature detection, polyfills, and browser-specific optimizations
 */

class BrowserCompatibility {
  constructor() {
    this.userAgent = navigator.userAgent;
    this.browserInfo = this.detectBrowser();
    this.supportedFeatures = this.detectFeatures();
    this.init();
  }

  init() {
    this.addBrowserClasses();
    this.loadPolyfills();
    this.applyBrowserSpecificFixes();
    this.setupFeatureDetection();
    console.log('🌐 Browser compatibility initialized:', this.browserInfo);
  }

  detectBrowser() {
    const ua = this.userAgent;
    let browser = {
      name: 'unknown',
      version: 'unknown',
      engine: 'unknown',
      platform: 'unknown',
      mobile: /Mobile|Android|iPhone|iPad/.test(ua)
    };

    // Detect browser
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser.name = 'chrome';
      browser.version = ua.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
      browser.engine = 'blink';
    } else if (ua.includes('Firefox')) {
      browser.name = 'firefox';
      browser.version = ua.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
      browser.engine = 'gecko';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser.name = 'safari';
      browser.version = ua.match(/Version\/(\d+)/)?.[1] || 'unknown';
      browser.engine = 'webkit';
    } else if (ua.includes('Edg')) {
      browser.name = 'edge';
      browser.version = ua.match(/Edg\/(\d+)/)?.[1] || 'unknown';
      browser.engine = 'blink';
    } else if (ua.includes('MSIE') || ua.includes('Trident')) {
      browser.name = 'ie';
      browser.version = ua.match(/(?:MSIE |rv:)(\d+)/)?.[1] || 'unknown';
      browser.engine = 'trident';
    }

    // Detect platform
    if (ua.includes('Windows')) {
      browser.platform = 'windows';
    } else if (ua.includes('Mac')) {
      browser.platform = 'mac';
    } else if (ua.includes('Linux')) {
      browser.platform = 'linux';
    } else if (ua.includes('Android')) {
      browser.platform = 'android';
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      browser.platform = 'ios';
    }

    return browser;
  }

  detectFeatures() {
    return {
      // CSS Features
      cssGrid: this.supportsCSS('display', 'grid'),
      cssFlexbox: this.supportsCSS('display', 'flex'),
      cssCustomProperties: this.supportsCSS('--test', 'value'),
      cssClamp: this.supportsCSS('width', 'clamp(1rem, 5vw, 3rem)'),
      cssAspectRatio: this.supportsCSS('aspect-ratio', '1/1'),
      
      // JavaScript Features
      es6Modules: 'noModule' in document.createElement('script'),
      intersectionObserver: 'IntersectionObserver' in window,
      serviceWorker: 'serviceWorker' in navigator,
      webp: this.supportsWebP(),
      avif: this.supportsAVIF(),
      
      // Web APIs
      fetch: 'fetch' in window,
      localStorage: this.supportsLocalStorage(),
      sessionStorage: this.supportsSessionStorage(),
      pushNotifications: 'PushManager' in window,
      geolocation: 'geolocation' in navigator,
      
      // Touch and Input
      touch: 'ontouchstart' in window,
      pointerEvents: 'PointerEvent' in window,
      
      // Media Features
      webGL: this.supportsWebGL(),
      canvas: this.supportsCanvas(),
      
      // Network Features
      networkInformation: 'connection' in navigator,
      onlineStatus: 'onLine' in navigator
    };
  }

  supportsCSS(property, value) {
    try {
      const element = document.createElement('div');
      element.style[property] = value;
      return element.style[property] === value;
    } catch {
      return false;
    }
  }

  supportsWebP() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => resolve(webP.height === 2);
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  supportsAVIF() {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => resolve(avif.height === 2);
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAQAAAAEAAAAQcGl4aQAAAAADCAgIAAAAFmF1eEMAAAAQdXJuOm1wZWc6bXBlZ0I6Y2ljcAAAABJhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }

  supportsLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  supportsSessionStorage() {
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  supportsWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  supportsCanvas() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch {
      return false;
    }
  }

  addBrowserClasses() {
    const html = document.documentElement;
    const classes = [];
    
    // Browser classes
    classes.push(`browser-${this.browserInfo.name}`);
    classes.push(`engine-${this.browserInfo.engine}`);
    classes.push(`platform-${this.browserInfo.platform}`);
    
    if (this.browserInfo.mobile) {
      classes.push('mobile');
    } else {
      classes.push('desktop');
    }
    
    // Feature classes
    Object.entries(this.supportedFeatures).forEach(([feature, supported]) => {
      classes.push(supported ? feature : `no-${feature}`);
    });
    
    // Version-specific classes
    if (this.browserInfo.name === 'ie' && parseInt(this.browserInfo.version) < 11) {
      classes.push('legacy-browser');
    }
    
    html.className += ' ' + classes.join(' ');
  }

  async loadPolyfills() {
    const polyfills = [];
    
    // Critical polyfills for older browsers
    if (!this.supportedFeatures.fetch) {
      polyfills.push(this.loadPolyfill('fetch', 'https://polyfill.io/v3/polyfill.min.js?features=fetch'));
    }
    
    if (!this.supportedFeatures.intersectionObserver) {
      polyfills.push(this.loadPolyfill('intersection-observer', 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver'));
    }
    
    if (!this.supportedFeatures.es6Modules) {
      polyfills.push(this.loadPolyfill('es6-modules', 'https://polyfill.io/v3/polyfill.min.js?features=es6'));
    }
    
    // CSS polyfills for older browsers
    if (!this.supportedFeatures.cssCustomProperties) {
      polyfills.push(this.loadCSSPolyfill('css-custom-properties'));
    }
    
    if (!this.supportedFeatures.cssGrid) {
      polyfills.push(this.loadCSSPolyfill('css-grid'));
    }
    
    await Promise.all(polyfills);
    console.log('🔧 Polyfills loaded successfully');
  }

  loadPolyfill(name, url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        console.log(`✅ Polyfill loaded: ${name}`);
        resolve();
      };
      script.onerror = () => {
        console.warn(`⚠️ Failed to load polyfill: ${name}`);
        resolve(); // Don't reject to avoid breaking the site
      };
      document.head.appendChild(script);
    });
  }

  loadCSSPolyfill(name) {
    return new Promise((resolve) => {
      switch (name) {
        case 'css-custom-properties':
          this.polyfillCSSCustomProperties();
          break;
        case 'css-grid':
          this.polyfillCSSGrid();
          break;
        default:
          console.warn(`Unknown CSS polyfill: ${name}`);
      }
      resolve();
    });
  }

  polyfillCSSCustomProperties() {
    // Basic CSS custom properties fallback
    if (!this.supportedFeatures.cssCustomProperties) {
      const fallbackColors = {
        '--color-primary': '#3b82f6',
        '--color-primary-dark': '#2563eb',
        '--color-primary-light': '#93c5fd',
        '--color-background': '#ffffff',
        '--color-text-primary': '#1e293b',
        '--color-text-secondary': '#64748b'
      };
      
      const style = document.createElement('style');
      let css = '';
      
      Object.entries(fallbackColors).forEach(([property, value]) => {
        css += `
          .browser-ie *,
          .no-cssCustomProperties * {
            color: ${value} !important;
          }
        `;
      });
      
      style.textContent = css;
      document.head.appendChild(style);
      console.log('🎨 CSS Custom Properties polyfill applied');
    }
  }

  polyfillCSSGrid() {
    // Basic CSS Grid fallback using flexbox
    if (!this.supportedFeatures.cssGrid) {
      const style = document.createElement('style');
      style.textContent = `
        .no-cssGrid .projects__grid,
        .no-cssGrid .skills__categories {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 1rem !important;
        }
        
        .no-cssGrid .project-card,
        .no-cssGrid .skill-category {
          flex: 1 1 300px !important;
          min-width: 300px !important;
        }
        
        .no-cssGrid .contact__content {
          display: block !important;
        }
        
        .no-cssGrid .contact__info,
        .no-cssGrid .contact__form {
          margin-bottom: 2rem !important;
        }
      `;
      document.head.appendChild(style);
      console.log('📱 CSS Grid polyfill applied');
    }
  }

  applyBrowserSpecificFixes() {
    // Safari-specific fixes
    if (this.browserInfo.name === 'safari') {
      this.applySafariFixes();
    }
    
    // Firefox-specific fixes
    if (this.browserInfo.name === 'firefox') {
      this.applyFirefoxFixes();
    }
    
    // Edge-specific fixes
    if (this.browserInfo.name === 'edge') {
      this.applyEdgeFixes();
    }
    
    // IE-specific fixes
    if (this.browserInfo.name === 'ie') {
      this.applyIEFixes();
    }
    
    // Mobile-specific fixes
    if (this.browserInfo.mobile) {
      this.applyMobileFixes();
    }
  }

  applySafariFixes() {
    const style = document.createElement('style');
    style.textContent = `
      /* Safari scroll behavior fix */
      .browser-safari {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Safari flexbox gap fallback */
      .browser-safari .projects__grid {
        margin: -0.5rem;
      }
      
      .browser-safari .project-card {
        margin: 0.5rem;
      }
      
      /* Safari backdrop-filter fallback */
      .browser-safari .header {
        background-color: rgba(255, 255, 255, 0.95);
      }
    `;
    document.head.appendChild(style);
    console.log('🍎 Safari-specific fixes applied');
  }

  applyFirefoxFixes() {
    const style = document.createElement('style');
    style.textContent = `
      /* Firefox scroll behavior */
      .browser-firefox {
        scroll-behavior: smooth;
      }
      
      /* Firefox animation performance */
      .browser-firefox * {
        will-change: auto;
      }
    `;
    document.head.appendChild(style);
    console.log('🦊 Firefox-specific fixes applied');
  }

  applyEdgeFixes() {
    const style = document.createElement('style');
    style.textContent = `
      /* Edge compatibility fixes */
      .browser-edge .hero__image {
        object-fit: cover;
      }
    `;
    document.head.appendChild(style);
    console.log('🔷 Edge-specific fixes applied');
  }

  applyIEFixes() {
    // Show warning for IE users
    this.showIEWarning();
    
    const style = document.createElement('style');
    style.textContent = `
      /* IE fallback styles */
      .browser-ie .hero {
        background: #f8fafc;
      }
      
      .browser-ie .btn {
        display: inline-block;
        padding: 12px 24px;
        background: #3b82f6;
        color: white;
        text-decoration: none;
        border-radius: 6px;
      }
      
      .browser-ie .project-card {
        border: 1px solid #e2e8f0;
        padding: 1rem;
        margin-bottom: 1rem;
      }
    `;
    document.head.appendChild(style);
    console.log('🌐 IE-specific fixes applied');
  }

  applyMobileFixes() {
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile-specific optimizations */
      .mobile {
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
      }
      
      .mobile .btn {
        min-height: 44px;
        min-width: 44px;
      }
      
      .mobile input,
      .mobile textarea {
        font-size: 16px; /* Prevent zoom on iOS */
      }
    `;
    document.head.appendChild(style);
    console.log('📱 Mobile-specific fixes applied');
  }

  showIEWarning() {
    const warning = document.createElement('div');
    warning.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: #fef3c7;
        color: #92400e;
        text-align: center;
        padding: 10px;
        z-index: 9999;
        font-family: Arial, sans-serif;
      ">
        ⚠️ You're using an outdated browser. For the best experience, please upgrade to a modern browser.
        <a href="https://browsehappy.com/" style="color: #92400e; text-decoration: underline;">Learn more</a>
      </div>
    `;
    document.body.insertBefore(warning, document.body.firstChild);
  }

  setupFeatureDetection() {
    // Set up runtime feature detection
    this.detectWebPSupport();
    this.detectConnectionSpeed();
    this.setupReducedMotionDetection();
  }

  async detectWebPSupport() {
    const supportsWebP = await this.supportsWebP();
    if (supportsWebP) {
      document.documentElement.classList.add('webp');
    } else {
      document.documentElement.classList.add('no-webp');
    }
  }

  detectConnectionSpeed() {
    if (this.supportedFeatures.networkInformation) {
      const connection = navigator.connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        document.documentElement.classList.add(`connection-${effectiveType}`);
        
        // Optimize for slow connections
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          this.optimizeForSlowConnection();
        }
      }
    }
  }

  optimizeForSlowConnection() {
    // Disable animations on slow connections
    const style = document.createElement('style');
    style.textContent = `
      .connection-slow-2g *,
      .connection-2g * {
        animation-duration: 0.01s !important;
        animation-delay: 0.01s !important;
        transition-duration: 0.01s !important;
      }
    `;
    document.head.appendChild(style);
    console.log('🐌 Optimizations applied for slow connection');
  }

  setupReducedMotionDetection() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      const handleReducedMotion = (e) => {
        if (e.matches) {
          document.documentElement.classList.add('reduced-motion');
        } else {
          document.documentElement.classList.remove('reduced-motion');
        }
      };
      
      mediaQuery.addListener(handleReducedMotion);
      handleReducedMotion(mediaQuery);
    }
  }

  // Public API for testing compatibility
  testBrowserCompatibility() {
    const results = {
      browser: this.browserInfo,
      features: this.supportedFeatures,
      recommendations: []
    };
    
    // Generate recommendations
    if (!this.supportedFeatures.serviceWorker) {
      results.recommendations.push('Service Worker not supported - offline functionality unavailable');
    }
    
    if (!this.supportedFeatures.cssGrid) {
      results.recommendations.push('CSS Grid not supported - using flexbox fallback');
    }
    
    if (!this.supportedFeatures.webp) {
      results.recommendations.push('WebP not supported - using JPEG/PNG fallbacks');
    }
    
    if (this.browserInfo.name === 'ie') {
      results.recommendations.push('Internet Explorer detected - consider upgrading to a modern browser');
    }
    
    return results;
  }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  window.BrowserCompatibility = BrowserCompatibility;
  
  // Initialize on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.browserCompatibility = new BrowserCompatibility();
    });
  } else {
    window.browserCompatibility = new BrowserCompatibility();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserCompatibility;
}