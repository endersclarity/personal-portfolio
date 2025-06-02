/**
 * Lazy Loading Implementation for Portfolio Images
 * Implements Intersection Observer API for performance optimization
 */

class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(
                this.onIntersection.bind(this),
                {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                }
            );
            this.observeImages();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.imageObserver.unobserve(entry.target);
            }
        });
    }

    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    loadImage(img) {
        // Support WebP with fallback
        const webpSrc = img.dataset.webp;
        const fallbackSrc = img.dataset.src;
        
        if (this.supportsWebP() && webpSrc) {
            img.src = webpSrc;
        } else {
            img.src = fallbackSrc;
        }
        
        img.classList.remove('lazy');
        img.classList.add('loaded');
        
        // Remove data attributes to clean up
        delete img.dataset.src;
        delete img.dataset.webp;
    }

    loadAllImages() {
        // Fallback: load all images immediately
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LazyLoader();
    });
} else {
    new LazyLoader();
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}