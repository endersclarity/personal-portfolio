/**
 * Real-time Performance Monitoring and Core Web Vitals Tracking
 * Implements performance measurement and optimization recommendations
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.observer = null;
        this.init();
    }

    init() {
        this.measureCoreWebVitals();
        this.setupPerformanceObserver();
        this.trackResourceTiming();
        this.reportMetrics();
    }

    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        this.measureLCP();
        
        // First Input Delay (FID)
        this.measureFID();
        
        // Cumulative Layout Shift (CLS)
        this.measureCLS();
        
        // Additional metrics
        this.measureFCP();
        this.measureTTI();
    }

    measureLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.lcp = {
                    value: lastEntry.startTime,
                    rating: this.getRating(lastEntry.startTime, [2500, 4000]),
                    element: lastEntry.element
                };
                
                this.logMetric('LCP', this.metrics.lcp);
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    measureFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = {
                        value: entry.processingStart - entry.startTime,
                        rating: this.getRating(entry.processingStart - entry.startTime, [100, 300])
                    };
                    
                    this.logMetric('FID', this.metrics.fid);
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        }
    }

    measureCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            let clsEntries = [];
            
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push(entry);
                    }
                });
                
                this.metrics.cls = {
                    value: clsValue,
                    rating: this.getRating(clsValue, [0.1, 0.25]),
                    entries: clsEntries
                };
                
                this.logMetric('CLS', this.metrics.cls);
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }

    measureFCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = {
                            value: entry.startTime,
                            rating: this.getRating(entry.startTime, [1800, 3000])
                        };
                        
                        this.logMetric('FCP', this.metrics.fcp);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['paint'] });
        }
    }

    measureTTI() {
        // Time to Interactive approximation
        if ('performance' in window && 'timing' in performance) {
            window.addEventListener('load', () => {
                const timing = performance.timing;
                const tti = timing.domInteractive - timing.navigationStart;
                
                this.metrics.tti = {
                    value: tti,
                    rating: this.getRating(tti, [3800, 7300])
                };
                
                this.logMetric('TTI', this.metrics.tti);
            });
        }
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            this.observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        this.analyzeNavigationTiming(entry);
                    } else if (entry.entryType === 'resource') {
                        this.analyzeResourceTiming(entry);
                    }
                });
            });
            
            this.observer.observe({ entryTypes: ['navigation', 'resource'] });
        }
    }

    trackResourceTiming() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const resources = performance.getEntriesByType('resource');
                
                const analysis = {
                    totalResources: resources.length,
                    totalSize: 0,
                    slowResources: [],
                    largeResources: []
                };
                
                resources.forEach(resource => {
                    const duration = resource.responseEnd - resource.startTime;
                    const size = resource.transferSize || 0;
                    
                    analysis.totalSize += size;
                    
                    // Flag slow resources (>1s)
                    if (duration > 1000) {
                        analysis.slowResources.push({
                            name: resource.name,
                            duration: Math.round(duration),
                            size: Math.round(size / 1024) + 'KB'
                        });
                    }
                    
                    // Flag large resources (>100KB)
                    if (size > 100000) {
                        analysis.largeResources.push({
                            name: resource.name,
                            size: Math.round(size / 1024) + 'KB',
                            duration: Math.round(duration)
                        });
                    }
                });
                
                this.metrics.resources = analysis;
                this.logResourceAnalysis();
            });
        }
    }

    getRating(value, thresholds) {
        if (value <= thresholds[0]) return 'good';
        if (value <= thresholds[1]) return 'needs-improvement';
        return 'poor';
    }

    logMetric(name, metric) {
        const emoji = metric.rating === 'good' ? '✅' : 
                     metric.rating === 'needs-improvement' ? '⚠️' : '❌';
        
        console.log(`${emoji} ${name}: ${Math.round(metric.value)}ms (${metric.rating})`);
    }

    logResourceAnalysis() {
        if (this.metrics.resources) {
            const r = this.metrics.resources;
            console.log(`📊 Resource Analysis:`);
            console.log(`  Total resources: ${r.totalResources}`);
            console.log(`  Total size: ${Math.round(r.totalSize / 1024)}KB`);
            
            if (r.slowResources.length > 0) {
                console.log(`  ⚠️ Slow resources (>1s):`, r.slowResources);
            }
            
            if (r.largeResources.length > 0) {
                console.log(`  ⚠️ Large resources (>100KB):`, r.largeResources);
            }
        }
    }

    reportMetrics() {
        // Send metrics to analytics or monitoring service
        window.addEventListener('beforeunload', () => {
            if (navigator.sendBeacon && Object.keys(this.metrics).length > 0) {
                const data = JSON.stringify({
                    url: window.location.href,
                    metrics: this.metrics,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                });
                
                // Example: send to analytics endpoint
                // navigator.sendBeacon('/api/performance', data);
                console.log('Performance metrics ready for reporting:', data);
            }
        });
    }

    analyzeNavigationTiming(entry) {
        const metrics = {
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            connection: entry.connectEnd - entry.connectStart,
            ssl: entry.secureConnectionStart ? entry.connectEnd - entry.secureConnectionStart : 0,
            ttfb: entry.responseStart - entry.requestStart,
            download: entry.responseEnd - entry.responseStart,
            domProcessing: entry.domComplete - entry.domLoading,
            total: entry.loadEventEnd - entry.startTime
        };
        
        this.metrics.navigation = metrics;
        console.log('🚀 Navigation Timing:', metrics);
    }

    analyzeResourceTiming(entry) {
        // Analyze individual resource performance
        const duration = entry.responseEnd - entry.startTime;
        
        if (duration > 1000) { // Resources taking >1s
            console.warn(`⚠️ Slow resource: ${entry.name} (${Math.round(duration)}ms)`);
        }
    }

    // Public API for manual measurements
    markStart(name) {
        performance.mark(`${name}-start`);
    }

    markEnd(name) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const measure = performance.getEntriesByName(name)[0];
        console.log(`📏 ${name}: ${Math.round(measure.duration)}ms`);
        
        return measure.duration;
    }
}

// Initialize performance monitoring
const perfMonitor = new PerformanceMonitor();

// Export for manual usage
window.perfMonitor = perfMonitor;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}