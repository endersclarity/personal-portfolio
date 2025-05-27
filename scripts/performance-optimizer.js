// Performance Optimization Module
// Handles critical performance features for maximum Lighthouse scores

class PerformanceOptimizer {
  constructor() {
    this.observers = new Map();
    this.loadTimes = new Map();
    this.init();
  }

  init() {
    this.trackPerformanceMetrics();
    this.optimizeImageLoading();
    this.implementCriticalResourceHints();
    this.setupServiceWorkerRegistration();
    this.enableResourcePrefetching();
  }

  // Track Core Web Vitals and performance metrics
  trackPerformanceMetrics() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
      
      // Optimize if LCP is slow
      if (lastEntry.startTime > 2500) {
        this.optimizeLCP();
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        console.log('FID:', entry.processingStart - entry.startTime);
        
        // Optimize if FID is slow
        if (entry.processingStart - entry.startTime > 100) {
          this.optimizeFID();
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log('CLS:', clsValue);
      
      // Optimize if CLS is high
      if (clsValue > 0.1) {
        this.optimizeCLS();
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Enhanced image loading optimization
  optimizeImageLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Add loading start time
          this.loadTimes.set(img, performance.now());
          
          // Enhance lazy loading with better prioritization
          if (img.dataset.asset) {
            this.loadOptimizedImage(img);
          }
          
          // Add fade-in animation
          img.addEventListener('load', () => {
            const loadTime = performance.now() - this.loadTimes.get(img);
            console.log(`Image loaded in ${loadTime}ms:`, img.src);
            
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
          });
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all images with data-asset attribute
    document.querySelectorAll('img[data-asset]').forEach(img => {
      // Set initial loading state
      img.style.opacity = '0';
      img.style.transform = 'scale(0.95)';
      img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      imageObserver.observe(img);
    });

    this.observers.set('images', imageObserver);
  }

  // Load optimized images with WebP detection
  loadOptimizedImage(img) {
    if (window.assetManager) {
      const asset = window.assetManager.getAsset(img.dataset.asset, img.dataset.category);
      if (asset) {
        const optimizedUrl = window.assetManager.getOptimizedAssetUrl(asset);
        
        // Use intersection observer for srcset switching
        img.src = optimizedUrl;
        img.alt = img.alt || `${img.dataset.asset} image`;
      }
    }
  }

  // Implement critical resource hints dynamically
  implementCriticalResourceHints() {
    // Preload next page resources when user hovers over links
    const linkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          
          link.addEventListener('mouseenter', () => {
            this.preloadPage(link.href);
          }, { once: true });
        }
      });
    });

    document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
      linkObserver.observe(link);
    });
  }

  // Preload page resources
  preloadPage(url) {
    if (!url || url === window.location.href) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  // Service Worker registration for caching
  setupServiceWorkerRegistration() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  // Enable intelligent resource prefetching
  enableResourcePrefetching() {
    // Prefetch GitHub API data when user scrolls to projects section
    const projectsSection = document.querySelector('#projects');
    if (projectsSection) {
      const projectsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.prefetchGitHubData();
            projectsObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px 0px' });
      
      projectsObserver.observe(projectsSection);
    }
  }

  // Prefetch GitHub API data
  prefetchGitHubData() {
    if (window.contentManager && window.contentManager.githubAPI) {
      // Prefetch repository data
      window.contentManager.githubAPI.prefetchRepositories();
    }
  }

  // Optimize Largest Contentful Paint
  optimizeLCP() {
    // Identify and optimize LCP element
    const heroImage = document.querySelector('.hero__image');
    if (heroImage && !heroImage.complete) {
      // Add higher priority loading
      heroImage.loading = 'eager';
      heroImage.fetchPriority = 'high';
    }
  }

  // Optimize First Input Delay
  optimizeFID() {
    // Break up long tasks using scheduler.postTask if available
    if ('scheduler' in window && 'postTask' in window.scheduler) {
      // Defer non-critical JavaScript execution
      this.deferNonCriticalTasks();
    } else {
      // Fallback to setTimeout for task scheduling
      this.deferNonCriticalTasksLegacy();
    }
  }

  // Optimize Cumulative Layout Shift
  optimizeCLS() {
    // Add explicit dimensions to images and dynamic content
    document.querySelectorAll('img:not([width])').forEach(img => {
      // Add default aspect ratio to prevent layout shift
      img.style.aspectRatio = '16/9';
      img.style.width = '100%';
      img.style.height = 'auto';
    });

    // Reserve space for dynamic content
    this.reserveSpaceForDynamicContent();
  }

  // Defer non-critical tasks (modern browsers)
  deferNonCriticalTasks() {
    const nonCriticalTasks = [
      () => this.initializeAnalytics(),
      () => this.setupSocialMediaEmbeds(),
      () => this.initializeThirdPartyWidgets()
    ];

    nonCriticalTasks.forEach(task => {
      window.scheduler.postTask(task, { priority: 'background' });
    });
  }

  // Defer non-critical tasks (legacy browsers)
  deferNonCriticalTasksLegacy() {
    setTimeout(() => {
      this.initializeAnalytics();
    }, 0);
    
    setTimeout(() => {
      this.setupSocialMediaEmbeds();
    }, 100);
    
    setTimeout(() => {
      this.initializeThirdPartyWidgets();
    }, 200);
  }

  // Reserve space for dynamic content to prevent CLS
  reserveSpaceForDynamicContent() {
    const dynamicContainers = document.querySelectorAll('[data-dynamic-height]');
    dynamicContainers.forEach(container => {
      const height = container.dataset.dynamicHeight;
      container.style.minHeight = height;
    });
  }

  // Initialize analytics (placeholder)
  initializeAnalytics() {
    // Placeholder for analytics initialization
    console.log('Analytics initialized (deferred)');
  }

  // Setup social media embeds (placeholder)
  setupSocialMediaEmbeds() {
    // Placeholder for social media embeds
    console.log('Social media embeds initialized (deferred)');
  }

  // Initialize third-party widgets (placeholder)
  initializeThirdPartyWidgets() {
    // Placeholder for third-party widgets
    console.log('Third-party widgets initialized (deferred)');
  }

  // Cleanup observers on page unload
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.loadTimes.clear();
  }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  window.PerformanceOptimizer = PerformanceOptimizer;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}