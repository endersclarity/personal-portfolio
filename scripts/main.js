// Main JavaScript for Portfolio Website

// =============================================================================
// NAVIGATION FUNCTIONALITY
// =============================================================================

class Navigation {
  constructor() {
    this.navToggle = document.querySelector('.nav__toggle');
    this.navMenu = document.querySelector('.nav__menu');
    this.navLinks = document.querySelectorAll('.nav__link');
    this.header = document.querySelector('.header');
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.setActiveLink();
    this.handleScroll();
  }
  
  bindEvents() {
    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    // Smooth scroll for navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e));
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    
    // Handle scroll events
    window.addEventListener('scroll', () => this.handleScroll());
    
    // Handle escape key
    document.addEventListener('keydown', (e) => this.handleEscapeKey(e));
  }
  
  toggleMobileMenu() {
    const isOpen = this.navMenu.classList.contains('is-open');
    
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  openMobileMenu() {
    this.navMenu.classList.add('is-open');
    this.navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  
  closeMobileMenu() {
    this.navMenu.classList.remove('is-open');
    this.navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  
  handleNavClick(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const headerHeight = this.header.offsetHeight;
      const targetPosition = targetElement.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      this.closeMobileMenu();
      
      // Update active link
      this.setActiveLink(targetId);
    }
  }
  
  handleOutsideClick(e) {
    if (!this.navToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
      this.closeMobileMenu();
    }
  }
  
  handleEscapeKey(e) {
    if (e.key === 'Escape') {
      this.closeMobileMenu();
    }
  }
  
  handleScroll() {
    // Add shadow to header on scroll
    if (window.scrollY > 10) {
      this.header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
      this.header.style.boxShadow = '';
    }
    
    // Update active navigation link based on scroll position
    this.updateActiveNavOnScroll();
  }
  
  updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const headerHeight = this.header.offsetHeight;
    const scrollPos = window.scrollY + headerHeight + 100;
    
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSection = `#${section.id}`;
      }
    });
    
    if (currentSection) {
      this.setActiveLink(currentSection);
    }
  }
  
  setActiveLink(activeId = null) {
    this.navLinks.forEach(link => {
      link.classList.remove('is-active');
      if (activeId && link.getAttribute('href') === activeId) {
        link.classList.add('is-active');
      }
    });
  }
}

// =============================================================================
// FORM HANDLING
// =============================================================================

class ContactForm {
  constructor() {
    this.form = document.querySelector('.contact__form');
    this.init();
  }
  
  init() {
    if (this.form) {
      this.bindEvents();
    }
  }
  
  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Real-time validation
    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    // Validate all fields
    const isValid = this.validateForm();
    
    if (isValid) {
      this.submitForm(data);
    }
  }
  
  validateForm() {
    const inputs = this.form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required.';
    }
    
    // Email validation
    if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    }
    
    // Display error
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.classList.toggle('is-visible', !isValid);
    }
    
    // Update field styling
    field.classList.toggle('is-invalid', !isValid);
    field.classList.toggle('is-valid', isValid && value);
    
    return isValid;
  }
  
  clearError(field) {
    const fieldName = field.name;
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('is-visible');
    }
    
    field.classList.remove('is-invalid');
  }
  
  async submitForm(data) {
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
      // Show loading state
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      // Simulate form submission (replace with actual endpoint)
      await this.mockFormSubmission(data);
      
      // Show success message
      this.showMessage('Message sent successfully!', 'success');
      this.form.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showMessage('Failed to send message. Please try again.', 'error');
    } finally {
      // Restore button state
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }
  
  mockFormSubmission(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful submission
        console.log('Form data:', data);
        resolve();
      }, 1000);
    });
  }
  
  showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message--${type}`;
    messageEl.textContent = message;
    
    // Insert after form
    this.form.parentNode.insertBefore(messageEl, this.form.nextSibling);
    
    // Remove after delay
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }
}

// =============================================================================
// SCROLL ANIMATIONS
// =============================================================================

class ScrollAnimations {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.init();
  }
  
  init() {
    this.createScrollProgressBar();
    this.initIntersectionObserver();
  }
  
  createScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }
  
  initIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, this.observerOptions);
      
      // Observe elements with reveal class
      const revealElements = document.querySelectorAll('.reveal');
      revealElements.forEach(el => observer.observe(el));
      
      // Add reveal class to sections and cards
      const animatedElements = document.querySelectorAll(
        '.section__title, .section__subtitle, .project-card, .skill-category'
      );
      
      animatedElements.forEach((el, index) => {
        el.classList.add('reveal');
        if (index > 0) {
          el.classList.add(`reveal-delay-${Math.min(index, 5)}`);
        }
        observer.observe(el);
      });
    }
  }
}

// =============================================================================
// PERFORMANCE OPTIMIZATIONS
// =============================================================================

class PerformanceOptimizer {
  constructor() {
    this.init();
  }
  
  init() {
    this.lazyLoadImages();
    this.preloadCriticalResources();
  }
  
  lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });
      
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }
  
  preloadCriticalResources() {
    // Preload critical images or fonts if needed
    const criticalImages = [
      // Add paths to critical images
    ];
    
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const Utils = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  new Navigation();
  new ContactForm();
  new ScrollAnimations();
  new PerformanceOptimizer();
  
  // Initialize content management system
  window.contentManager = new ContentManager();
  
  // Add smooth reveal to hero section
  const heroElements = document.querySelectorAll('.hero__title, .hero__subtitle, .hero__description, .hero__actions');
  heroElements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.2}s`;
  });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden - pause animations if needed
  } else {
    // Page is visible - resume animations
  }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Navigation, ContactForm, ScrollAnimations, PerformanceOptimizer, Utils };
}