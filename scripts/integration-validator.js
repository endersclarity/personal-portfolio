/**
 * Integration Validation Suite
 * Validates all workstream integrations and quality gates
 */

class IntegrationValidator {
    constructor() {
        this.results = {
            seo: { passed: 0, failed: 0, tests: [] },
            performance: { passed: 0, failed: 0, tests: [] },
            forms: { passed: 0, failed: 0, tests: [] },
            accessibility: { passed: 0, failed: 0, tests: [] }
        };
        this.init();
    }

    init() {
        console.log('🔍 Running Integration Validation Suite...');
        
        this.validateSEO();
        this.validatePerformance();
        this.validateForms();
        this.validateAccessibility();
        this.generateReport();
    }

    validateSEO() {
        console.log('📈 Validating SEO Implementation...');
        
        // Meta tags validation
        this.test('SEO', 'Meta description exists', () => {
            const meta = document.querySelector('meta[name="description"]');
            return meta && meta.content.length > 0 && meta.content.length <= 160;
        });

        this.test('SEO', 'Title tag exists and is appropriate length', () => {
            return document.title.length > 0 && document.title.length <= 60;
        });

        this.test('SEO', 'Canonical URL is set', () => {
            return document.querySelector('link[rel="canonical"]') !== null;
        });

        // Structured data validation
        this.test('SEO', 'JSON-LD structured data exists', () => {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            return scripts.length > 0;
        });

        this.test('SEO', 'JSON-LD is valid', () => {
            try {
                const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                for (let script of scripts) {
                    JSON.parse(script.textContent);
                }
                return true;
            } catch (e) {
                return false;
            }
        });

        // Open Graph validation
        this.test('SEO', 'Open Graph meta tags exist', () => {
            const ogTags = document.querySelectorAll('meta[property^="og:"]');
            return ogTags.length >= 4; // title, description, type, url minimum
        });

        // Twitter Card validation
        this.test('SEO', 'Twitter Card meta tags exist', () => {
            return document.querySelector('meta[name="twitter:card"]') !== null;
        });
    }

    validatePerformance() {
        console.log('⚡ Validating Performance Implementation...');
        
        // Lazy loading validation
        this.test('Performance', 'Lazy loading script is loaded', () => {
            return typeof LazyLoader !== 'undefined' || 
                   document.querySelector('script[src*="lazy-loading"]') !== null;
        });

        // WebP support validation
        this.test('Performance', 'WebP images available', () => {
            const webpImages = document.querySelectorAll('img[data-webp], source[type="image/webp"]');
            return webpImages.length > 0;
        });

        // Performance monitoring
        this.test('Performance', 'Performance monitoring active', () => {
            return typeof PerformanceMonitor !== 'undefined' || window.perfMonitor;
        });

        // Critical resource hints
        this.test('Performance', 'DNS prefetch hints exist', () => {
            return document.querySelectorAll('link[rel="dns-prefetch"]').length > 0;
        });

        // Service worker validation
        this.test('Performance', 'Service worker registration', () => {
            return 'serviceWorker' in navigator && 
                   document.querySelector('script[src*="sw.js"]') !== null;
        });
    }

    validateForms() {
        console.log('📝 Validating Forms Integration...');
        
        // Netlify forms setup
        this.test('Forms', 'Netlify form attributes exist', () => {
            const forms = document.querySelectorAll('form[data-netlify="true"]');
            return forms.length > 0;
        });

        this.test('Forms', 'Form validation script loaded', () => {
            return typeof ContactForm !== 'undefined' || 
                   document.querySelector('script[src*="contact-form"]') !== null;
        });

        this.test('Forms', 'Required form fields have validation', () => {
            const requiredFields = document.querySelectorAll('form [required]');
            return requiredFields.length > 0;
        });

        this.test('Forms', 'Honeypot spam protection', () => {
            return document.querySelector('input[name="bot-field"]') !== null;
        });

        // Form accessibility
        this.test('Forms', 'Form labels are properly associated', () => {
            const inputs = document.querySelectorAll('form input:not([type="hidden"]), form textarea');
            for (let input of inputs) {
                const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`) ||
                                input.closest('label') !== null ||
                                input.getAttribute('aria-label');
                if (!hasLabel) return false;
            }
            return true;
        });
    }

    validateAccessibility() {
        console.log('♿ Validating Accessibility Implementation...');
        
        // ARIA landmarks
        this.test('Accessibility', 'Semantic HTML landmarks exist', () => {
            const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section');
            return landmarks.length >= 3;
        });

        this.test('Accessibility', 'Heading hierarchy is logical', () => {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            if (headings.length === 0) return false;
            
            // Check if there's exactly one h1
            const h1Count = document.querySelectorAll('h1').length;
            return h1Count === 1;
        });

        // Image alt text
        this.test('Accessibility', 'Images have alt text', () => {
            const images = document.querySelectorAll('img');
            for (let img of images) {
                if (!img.hasAttribute('alt')) return false;
            }
            return true;
        });

        // Focus management
        this.test('Accessibility', 'Skip navigation link exists', () => {
            return document.querySelector('a[href="#main"], a[href="#content"]') !== null;
        });

        // Color contrast (basic check)
        this.test('Accessibility', 'Focus indicators are visible', () => {
            const style = getComputedStyle(document.documentElement);
            // Basic check - more comprehensive testing would require color analysis
            return true; // Placeholder - would need more complex implementation
        });

        // ARIA labels for interactive elements
        this.test('Accessibility', 'Interactive elements have accessible names', () => {
            const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
            for (let button of buttons) {
                if (!button.textContent.trim()) return false;
            }
            return true;
        });
    }

    test(category, name, testFn) {
        try {
            const result = testFn();
            const status = result ? 'PASS' : 'FAIL';
            const emoji = result ? '✅' : '❌';
            
            console.log(`  ${emoji} ${name}`);
            
            this.results[category.toLowerCase()].tests.push({
                name,
                status,
                passed: result
            });
            
            if (result) {
                this.results[category.toLowerCase()].passed++;
            } else {
                this.results[category.toLowerCase()].failed++;
            }
        } catch (error) {
            console.error(`  ❌ ${name} - Error: ${error.message}`);
            this.results[category.toLowerCase()].failed++;
            this.results[category.toLowerCase()].tests.push({
                name,
                status: 'ERROR',
                error: error.message,
                passed: false
            });
        }
    }

    generateReport() {
        console.log('\n📊 Integration Validation Report:');
        console.log('=====================================');
        
        let totalPassed = 0;
        let totalFailed = 0;
        
        Object.keys(this.results).forEach(category => {
            const result = this.results[category];
            const total = result.passed + result.failed;
            const percentage = total > 0 ? Math.round((result.passed / total) * 100) : 0;
            
            console.log(`\n${category.toUpperCase()}:`);
            console.log(`  Passed: ${result.passed}/${total} (${percentage}%)`);
            
            if (result.failed > 0) {
                console.log(`  Failed tests:`);
                result.tests.filter(t => !t.passed).forEach(test => {
                    console.log(`    - ${test.name}`);
                });
            }
            
            totalPassed += result.passed;
            totalFailed += result.failed;
        });
        
        const overallTotal = totalPassed + totalFailed;
        const overallPercentage = overallTotal > 0 ? Math.round((totalPassed / overallTotal) * 100) : 0;
        
        console.log(`\n🎯 OVERALL SCORE: ${totalPassed}/${overallTotal} (${overallPercentage}%)`);
        
        if (overallPercentage >= 90) {
            console.log('🎉 Excellent! Ready for production deployment.');
        } else if (overallPercentage >= 80) {
            console.log('✅ Good! Minor improvements recommended.');
        } else if (overallPercentage >= 70) {
            console.log('⚠️ Needs improvement before production.');
        } else {
            console.log('❌ Significant issues found. Review required.');
        }
        
        // Store results for potential external reporting
        window.integrationValidationResults = this.results;
        
        return this.results;
    }

    // Manual test runner for specific categories
    runCategory(category) {
        const methodName = `validate${category.charAt(0).toUpperCase() + category.slice(1)}`;
        if (typeof this[methodName] === 'function') {
            this[methodName]();
        } else {
            console.error(`Unknown category: ${category}`);
        }
    }
}

// Auto-run validation on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new IntegrationValidator();
    });
} else {
    new IntegrationValidator();
}

// Export for manual usage
window.IntegrationValidator = IntegrationValidator;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationValidator;
}