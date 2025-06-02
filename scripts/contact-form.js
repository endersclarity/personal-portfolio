/**
 * Contact Form Enhancement with Netlify Forms Integration
 * Provides client-side validation, submission handling, and user feedback
 */

class ContactForm {
    constructor() {
        this.form = document.querySelector('#contact-form, [data-netlify="true"]');
        this.submitButton = null;
        this.statusMessage = null;
        this.init();
    }

    init() {
        if (!this.form) {
            console.warn('Contact form not found');
            return;
        }

        this.setupFormElements();
        this.bindEvents();
        this.createStatusMessage();
    }

    setupFormElements() {
        this.submitButton = this.form.querySelector('button[type="submit"], input[type="submit"]');
        
        // Ensure Netlify form attributes are set
        if (!this.form.hasAttribute('data-netlify')) {
            this.form.setAttribute('data-netlify', 'true');
        }
        
        // Add honeypot field for spam protection
        if (!this.form.querySelector('input[name="bot-field"]')) {
            const honeypot = document.createElement('input');
            honeypot.type = 'hidden';
            honeypot.name = 'bot-field';
            honeypot.style.display = 'none';
            this.form.appendChild(honeypot);
        }
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    createStatusMessage() {
        if (document.querySelector('.form-status')) return;
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'form-status';
        statusDiv.setAttribute('aria-live', 'polite');
        statusDiv.style.display = 'none';
        
        this.form.parentNode.insertBefore(statusDiv, this.form.nextSibling);
        this.statusMessage = statusDiv;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showStatus('Please fix the errors above.', 'error');
            return;
        }

        this.setSubmitState(true);
        this.showStatus('Sending message...', 'loading');

        try {
            const formData = new FormData(this.form);
            
            const response = await fetch(this.form.action || '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                this.showStatus('Thank you! Your message has been sent successfully.', 'success');
                this.form.reset();
                
                // Optional: redirect to thank you page
                setTimeout(() => {
                    if (document.querySelector('a[href="thank-you.html"]')) {
                        window.location.href = 'thank-you.html';
                    }
                }, 2000);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showStatus('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            this.setSubmitState(false);
        }
    }

    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const isRequired = field.hasAttribute('required');
        
        this.clearFieldError(field);

        // Required field validation
        if (isRequired && !value) {
            this.showFieldError(field, 'This field is required.');
            return false;
        }

        // Email validation
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid email address.');
                return false;
            }
        }

        // Minimum length validation
        const minLength = field.getAttribute('minlength');
        if (minLength && value.length < parseInt(minLength)) {
            this.showFieldError(field, `Minimum ${minLength} characters required.`);
            return false;
        }

        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.setAttribute('aria-live', 'polite');
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        field.setAttribute('aria-describedby', errorElement.id || 'error-' + field.name);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        field.removeAttribute('aria-describedby');
    }

    showStatus(message, type) {
        if (!this.statusMessage) return;
        
        this.statusMessage.textContent = message;
        this.statusMessage.className = `form-status ${type}`;
        this.statusMessage.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.statusMessage.style.display = 'none';
            }, 5000);
        }
    }

    setSubmitState(isSubmitting) {
        if (!this.submitButton) return;
        
        this.submitButton.disabled = isSubmitting;
        
        if (isSubmitting) {
            this.submitButton.dataset.originalText = this.submitButton.textContent;
            this.submitButton.textContent = 'Sending...';
        } else {
            this.submitButton.textContent = this.submitButton.dataset.originalText || 'Send Message';
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ContactForm();
    });
} else {
    new ContactForm();
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactForm;
}