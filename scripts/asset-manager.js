// Asset Management System for Portfolio

class AssetManager {
  constructor() {
    this.assets = {
      images: new Map(),
      icons: new Map(),
      projects: new Map()
    };
    this.loadedAssets = new Set();
    this.baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    this.supportedFormats = this.detectSupportedFormats();
    
    this.init();
  }
  
  init() {
    this.registerAssets();
    this.setupLazyLoading();
    this.preloadCriticalAssets();
  }
  
  // Detect browser support for modern image formats
  detectSupportedFormats() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return {
      webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
      avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
    };
  }
  
  // Register all available assets
  registerAssets() {
    // Profile and hero images
    this.registerAsset('images', 'profile', {
      src: 'assets/images/profile-placeholder.svg',
      alt: 'Kaelen Jennings - Professional Profile Photo',
      critical: true,
      lazy: false
    });
    
    this.registerAsset('images', 'hero-bg', {
      src: 'assets/images/hero-background.jpg',
      alt: 'Hero section background',
      critical: true,
      lazy: false,
      fallback: 'assets/images/hero-background-fallback.jpg'
    });
    
    // Project screenshots
    this.registerAsset('projects', 'personal-portfolio', {
      src: 'assets/projects/portfolio-screenshot.jpg',
      alt: 'Personal Portfolio Website Screenshot',
      lazy: true,
      fallback: 'assets/projects/portfolio-placeholder.svg'
    });
    
    this.registerAsset('projects', 'task-manager', {
      src: 'assets/projects/task-manager-screenshot.jpg',
      alt: 'Task Manager Application Screenshot',
      lazy: true,
      fallback: 'assets/projects/task-manager-placeholder.svg'
    });
    
    this.registerAsset('projects', 'weather-dashboard', {
      src: 'assets/projects/weather-dashboard-screenshot.jpg',
      alt: 'Weather Dashboard Screenshot',
      lazy: true,
      fallback: 'assets/projects/weather-placeholder.svg'
    });
    
    this.registerAsset('projects', 'ecommerce-platform', {
      src: 'assets/projects/ecommerce-screenshot.jpg',
      alt: 'E-commerce Platform Screenshot',
      lazy: true,
      fallback: 'assets/projects/ecommerce-placeholder.svg'
    });
    
    this.registerAsset('projects', 'blog-cms', {
      src: 'assets/projects/blog-cms-screenshot.jpg',
      alt: 'Blog CMS Screenshot',
      lazy: true,
      fallback: 'assets/projects/blog-placeholder.svg'
    });
    
    // Icons
    this.registerAsset('icons', 'github', {
      src: 'assets/icons/github-icon.svg',
      alt: 'GitHub Icon',
      critical: false,
      lazy: false
    });
    
    this.registerAsset('icons', 'linkedin', {
      src: 'assets/icons/linkedin-icon.svg',
      alt: 'LinkedIn Icon',
      critical: false,
      lazy: false
    });
    
    this.registerAsset('icons', 'email', {
      src: 'assets/icons/email-icon.svg',
      alt: 'Email Icon',
      critical: false,
      lazy: false
    });
    
    this.registerAsset('icons', 'download', {
      src: 'assets/icons/download-icon.svg',
      alt: 'Download Icon',
      critical: false,
      lazy: false
    });
    
    this.registerAsset('icons', 'external', {
      src: 'assets/icons/external-icon.svg',
      alt: 'External Link Icon',
      critical: false,
      lazy: false
    });
  }
  
  // Register a single asset
  registerAsset(category, name, config) {
    const asset = {
      name,
      category,
      src: this.resolveAssetUrl(config.src),
      alt: config.alt || '',
      critical: config.critical || false,
      lazy: config.lazy !== false, // Default to lazy loading
      fallback: config.fallback ? this.resolveAssetUrl(config.fallback) : null,
      loaded: false,
      loading: false,
      error: false
    };
    
    this.assets[category].set(name, asset);
  }
  
  // Resolve asset URL with base path
  resolveAssetUrl(src) {
    if (src.startsWith('http') || src.startsWith('data:')) {
      return src;
    }
    return `${this.baseUrl}/${src}`;
  }
  
  // Get optimized asset URL based on browser support
  getOptimizedAssetUrl(asset) {
    const originalSrc = asset.src;
    
    // For JPEG/PNG images, try to serve WebP if supported
    if ((originalSrc.includes('.jpg') || originalSrc.includes('.png')) && this.supportedFormats.webp) {
      const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return webpSrc;
    }
    
    return originalSrc;
  }
  
  // Setup intersection observer for lazy loading
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const assetName = img.dataset.asset;
            const assetCategory = img.dataset.category || 'images';
            
            this.loadAsset(assetCategory, assetName).then(() => {
              this.lazyObserver.unobserve(img);
            });
          }
        });
      }, {
        rootMargin: '50px'
      });
    }
  }
  
  // Preload critical assets
  async preloadCriticalAssets() {
    const criticalAssets = [];
    
    // Find all critical assets
    Object.values(this.assets).forEach(category => {
      category.forEach(asset => {
        if (asset.critical) {
          criticalAssets.push(asset);
        }
      });
    });
    
    // Preload critical assets
    const preloadPromises = criticalAssets.map(asset => this.preloadAsset(asset));
    
    try {
      await Promise.allSettled(preloadPromises);
      console.log('Critical assets preloaded');
    } catch (error) {
      console.warn('Some critical assets failed to preload:', error);
    }
  }
  
  // Preload a single asset
  preloadAsset(asset) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.getOptimizedAssetUrl(asset);
      
      link.onload = () => {
        asset.loaded = true;
        resolve(asset);
      };
      
      link.onerror = () => {
        asset.error = true;
        reject(new Error(`Failed to preload asset: ${asset.name}`));
      };
      
      document.head.appendChild(link);
    });
  }
  
  // Load asset and update DOM
  async loadAsset(category, name) {
    const asset = this.assets[category]?.get(name);
    if (!asset || asset.loaded || asset.loading) {
      return asset;
    }
    
    asset.loading = true;
    
    try {
      await this.loadImage(asset);
      asset.loaded = true;
      asset.error = false;
      
      // Update all images with this asset
      this.updateImageElements(asset);
      
      return asset;
    } catch (error) {
      asset.error = true;
      console.warn(`Failed to load asset ${category}/${name}:`, error);
      
      // Try fallback if available
      if (asset.fallback) {
        try {
          await this.loadImage({ ...asset, src: asset.fallback });
          this.updateImageElements({ ...asset, src: asset.fallback });
        } catch (fallbackError) {
          console.error(`Fallback also failed for ${category}/${name}:`, fallbackError);
        }
      }
      
      throw error;
    } finally {
      asset.loading = false;
    }
  }
  
  // Load image with promise
  loadImage(asset) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const src = this.getOptimizedAssetUrl(asset);
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load: ${src}`));
      
      img.src = src;
    });
  }
  
  // Update all image elements with the loaded asset
  updateImageElements(asset) {
    const selector = `img[data-asset="${asset.name}"][data-category="${asset.category}"]`;
    const images = document.querySelectorAll(selector);
    
    images.forEach(img => {
      img.src = this.getOptimizedAssetUrl(asset);
      img.alt = asset.alt;
      img.classList.add('asset-loaded');
      
      // Remove lazy loading attributes
      img.removeAttribute('data-asset');
      img.removeAttribute('data-category');
    });
  }
  
  // Get asset by category and name
  getAsset(category, name) {
    return this.assets[category]?.get(name);
  }
  
  // Set up asset in DOM with lazy loading
  setupAssetElement(element, category, name) {
    const asset = this.getAsset(category, name);
    if (!asset) {
      console.warn(`Asset not found: ${category}/${name}`);
      return;
    }
    
    // Set data attributes for lazy loading
    element.dataset.asset = name;
    element.dataset.category = category;
    element.alt = asset.alt;
    
    // If not lazy or critical, load immediately
    if (!asset.lazy || asset.critical) {
      this.loadAsset(category, name);
    } else if (this.lazyObserver) {
      // Set up lazy loading
      this.lazyObserver.observe(element);
    }
    
    // Set placeholder or low-quality image
    if (asset.fallback) {
      element.src = asset.fallback;
    }
  }
  
  // Generate responsive image srcset
  generateSrcSet(asset, sizes = [320, 640, 1024, 1920]) {
    const srcSet = sizes.map(size => {
      const url = this.getOptimizedAssetUrl(asset);
      // In a real implementation, you'd have different sized versions
      return `${url} ${size}w`;
    }).join(', ');
    
    return srcSet;
  }
  
  // Get asset loading statistics
  getLoadingStats() {
    const stats = {
      total: 0,
      loaded: 0,
      loading: 0,
      error: 0,
      critical: 0,
      lazy: 0
    };
    
    Object.values(this.assets).forEach(category => {
      category.forEach(asset => {
        stats.total++;
        if (asset.loaded) stats.loaded++;
        if (asset.loading) stats.loading++;
        if (asset.error) stats.error++;
        if (asset.critical) stats.critical++;
        if (asset.lazy) stats.lazy++;
      });
    });
    
    stats.loadedPercentage = Math.round((stats.loaded / stats.total) * 100);
    
    return stats;
  }
  
  // Clean up observers
  destroy() {
    if (this.lazyObserver) {
      this.lazyObserver.disconnect();
    }
  }
}

// Global asset manager instance
let assetManager = null;

// Initialize asset manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  assetManager = new AssetManager();
  window.assetManager = assetManager;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssetManager;
}