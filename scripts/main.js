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
    // For Netlify Forms, we only prevent submission if validation fails
    // Otherwise, let the form submit naturally to Netlify
    
    const isValid = this.validateForm();
    
    if (!isValid) {
      e.preventDefault();
      return;
    }
    
    // If validation passes, show loading state but let form submit
    const submitButton = this.form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Form will submit naturally to Netlify action="/thank-you"
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
    
    this.parallaxElements = [];
    this.isScrolling = false;
    this.lastScrollTop = 0;
    
    this.init();
  }
  
  init() {
    this.createScrollProgressBar();
    this.createCircularProgress();
    this.initIntersectionObserver();
    this.initParallaxElements();
    this.initSmoothScrolling();
    this.initMicroInteractions();
    this.addNavigationActiveStates();
  }
  
  createScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', Utils.throttle(() => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
      
      // Update circular progress
      this.updateCircularProgress(scrolled);
    }, 16));
  }
  
  createCircularProgress() {
    const circularProgress = document.createElement('div');
    circularProgress.className = 'scroll-progress-circle';
    circularProgress.innerHTML = `
      <svg>
        <circle class="progress-circle" cx="30" cy="30" r="28"></circle>
      </svg>
    `;
    document.body.appendChild(circularProgress);
    
    this.circularProgressEl = circularProgress.querySelector('.progress-circle');
  }
  
  updateCircularProgress(percentage) {
    if (this.circularProgressEl) {
      const circumference = 2 * Math.PI * 28; // radius = 28
      const offset = circumference - (percentage / 100) * circumference;
      this.circularProgressEl.style.strokeDashoffset = offset;
    }
  }
  
  initIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      // Different observers for different animation types
      this.createRevealObserver();
      this.createStaggerObserver();
      this.createSkillsObserver();
    }
  }
  
  createRevealObserver() {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Add micro-interaction classes based on element type
          this.addMicroInteractionClasses(entry.target);
        }
      });
    }, this.observerOptions);
    
    // Different reveal animations for different elements
    const revealElements = document.querySelectorAll('.reveal');
    const revealLeftElements = document.querySelectorAll('.about__text, .contact__info');
    const revealRightElements = document.querySelectorAll('.about__image, .hero__visual');
    const revealScaleElements = document.querySelectorAll('.project-card');
    
    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
    
    revealLeftElements.forEach(el => {
      el.classList.add('reveal-left');
      revealObserver.observe(el);
    });
    
    revealRightElements.forEach(el => {
      el.classList.add('reveal-right');
      revealObserver.observe(el);
    });
    
    revealScaleElements.forEach(el => {
      el.classList.add('reveal-scale', 'card-tilt');
      revealObserver.observe(el);
    });
    
    // Add reveal class to sections and cards
    const animatedElements = document.querySelectorAll(
      '.section__title, .section__subtitle'
    );
    
    animatedElements.forEach((el, index) => {
      el.classList.add('reveal');
      if (index > 0) {
        el.classList.add(`reveal-delay-${Math.min(index, 5)}`);
      }
      revealObserver.observe(el);
    });
  }
  
  createStaggerObserver() {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const staggerItems = entry.target.querySelectorAll('.stagger-item');
          staggerItems.forEach(item => {
            item.classList.add('is-visible');
          });
        }
      });
    }, this.observerOptions);
    
    // Apply stagger animation to skill items and project cards
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach(category => {
      const skillItems = category.querySelectorAll('.skill-item');
      skillItems.forEach(item => item.classList.add('stagger-item'));
      staggerObserver.observe(category);
    });
    
    const projectsGrid = document.querySelector('.projects__grid');
    if (projectsGrid) {
      const projectCards = projectsGrid.querySelectorAll('.project-card');
      projectCards.forEach(card => card.classList.add('stagger-item'));
      staggerObserver.observe(projectsGrid);
    }
  }
  
  createSkillsObserver() {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateSkillBars(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach(category => skillsObserver.observe(category));
  }
  
  animateSkillBars(category) {
    const skillItems = category.querySelectorAll('.skill-item[data-proficiency]');
    skillItems.forEach((item, index) => {
      setTimeout(() => {
        const proficiency = item.dataset.proficiency;
        if (proficiency) {
          // Create progress bar if it doesn't exist
          let progressBar = item.querySelector('.progress-bar');
          if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.style.setProperty('--progress-width', `${proficiency}%`);
            item.appendChild(progressBar);
          }
        }
      }, index * 100);
    });
  }
  
  initParallaxElements() {
    // Add parallax classes to elements
    const heroVisual = document.querySelector('.hero__visual');
    if (heroVisual) {
      heroVisual.classList.add('parallax-slow');
      this.parallaxElements.push({ element: heroVisual, speed: 0.5 });
    }
    
    const projectCards = document.querySelectorAll('.project-card__image');
    projectCards.forEach(card => {
      card.classList.add('parallax-medium');
      this.parallaxElements.push({ element: card, speed: 0.2 });
    });
    
    // Setup parallax scroll listener
    if (this.parallaxElements.length > 0) {
      this.initParallaxScroll();
    }
  }
  
  initParallaxScroll() {
    let ticking = false;
    
    const updateParallax = () => {
      const scrollTop = window.pageYOffset;
      
      this.parallaxElements.forEach(({ element, speed }) => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Only apply parallax when element is in viewport
        if (rect.bottom >= 0 && rect.top <= windowHeight) {
          const yPos = (scrollTop - elementTop) * speed;
          element.style.transform = `translateY(${yPos}px)`;
        }
      });
      
      ticking = false;
    };
    
    const requestParallaxUpdate = () => {
      if (!ticking && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestParallaxUpdate);
  }
  
  initSmoothScrolling() {
    // Enhanced smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
          
          // Update active navigation state
          this.updateActiveNavigation(targetId);
        }
      });
    });
  }
  
  updateActiveNavigation(activeId) {
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.classList.remove('is-active');
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('is-active');
      }
    });
  }
  
  addNavigationActiveStates() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');
    
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-80px 0px -50% 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          this.updateActiveNavigation(sectionId);
        }
      });
    }, observerOptions);
    
    sections.forEach(section => sectionObserver.observe(section));
  }
  
  initMicroInteractions() {
    // Add button press effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.classList.add('btn-press');
      
      // Add magnetic effect for large buttons
      if (btn.classList.contains('btn--primary')) {
        this.addMagneticEffect(btn);
      }
    });
    
    // Add link underline effects
    const links = document.querySelectorAll('a:not(.btn):not(.nav__link)');
    links.forEach(link => {
      if (!link.querySelector('img')) { // Don't add to image links
        link.classList.add('link-underline');
      }
    });
    
    // Add icon bounce effects
    const icons = document.querySelectorAll('.social-link, .project-link');
    icons.forEach(icon => icon.classList.add('icon-bounce'));
    
    // Add glow effects to cards
    const cards = document.querySelectorAll('.project-card, .skill-category');
    cards.forEach(card => card.classList.add('glow-effect'));
  }
  
  addMagneticEffect(element) {
    element.classList.add('btn-magnetic');
    
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 50;
      
      if (distance < maxDistance) {
        const factor = (maxDistance - distance) / maxDistance;
        const translateX = x * factor * 0.3;
        const translateY = y * factor * 0.3;
        
        element.style.transform = `translate(${translateX}px, ${translateY}px)`;
      }
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translate(0, 0)';
    });
  }
  
  addMicroInteractionClasses(element) {
    // Add appropriate micro-interaction classes based on element type
    if (element.classList.contains('project-card')) {
      element.classList.add('card-tilt', 'hover-lift');
    }
    
    if (element.classList.contains('skill-item')) {
      element.classList.add('hover-scale');
    }
    
    if (element.classList.contains('btn')) {
      element.classList.add('btn-press');
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