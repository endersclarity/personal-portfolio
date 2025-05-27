/**
 * Theme Manager - Dark Mode Toggle with System Preference Detection
 * Handles theme switching, persistence, and smooth transitions
 */

class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.systemPreference = this.getSystemPreference();
    this.storageKey = 'portfolio-theme-preference';
    this.toggleButton = null;
    this.init();
  }

  /**
   * Initialize theme system
   */
  init() {
    this.loadStoredTheme();
    this.applyTheme();
    this.createToggleButton();
    this.attachEventListeners();
    this.watchSystemPreference();
  }

  /**
   * Get system color scheme preference
   */
  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Load theme preference from localStorage
   */
  loadStoredTheme() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored && ['light', 'dark', 'auto'].includes(stored)) {
        this.currentTheme = stored;
      } else {
        this.currentTheme = 'auto'; // Default to system preference
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      this.currentTheme = 'auto';
    }
  }

  /**
   * Save theme preference to localStorage
   */
  saveTheme() {
    try {
      localStorage.setItem(this.storageKey, this.currentTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Get effective theme (resolves 'auto' to actual theme)
   */
  getEffectiveTheme() {
    if (this.currentTheme === 'auto') {
      return this.systemPreference;
    }
    return this.currentTheme;
  }

  /**
   * Apply theme to document
   */
  applyTheme() {
    const effectiveTheme = this.getEffectiveTheme();
    const html = document.documentElement;
    
    // Remove existing theme attributes
    html.removeAttribute('data-theme');
    
    // Apply new theme
    if (effectiveTheme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    }
    
    // Update toggle button if it exists
    this.updateToggleButton();
    
    // Dispatch theme change event
    this.dispatchThemeChangeEvent(effectiveTheme);
  }

  /**
   * Create theme toggle button
   */
  createToggleButton() {
    // Create toggle button container
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'theme-toggle-container';
    
    // Create toggle button
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'theme-toggle';
    this.toggleButton.setAttribute('aria-label', 'Toggle theme');
    this.toggleButton.setAttribute('aria-pressed', 'false');
    this.toggleButton.type = 'button';
    
    // Create icons
    const sunIcon = this.createIcon('sun');
    const moonIcon = this.createIcon('moon');
    const autoIcon = this.createIcon('auto');
    
    this.toggleButton.appendChild(sunIcon);
    this.toggleButton.appendChild(moonIcon);
    this.toggleButton.appendChild(autoIcon);
    
    toggleContainer.appendChild(this.toggleButton);
    
    // Add to header navigation
    const nav = document.querySelector('nav ul, nav .nav-links, header nav');
    if (nav) {
      nav.appendChild(toggleContainer);
    } else {
      // Fallback: add to header
      const header = document.querySelector('header');
      if (header) {
        header.appendChild(toggleContainer);
      }
    }
    
    this.updateToggleButton();
  }

  /**
   * Create SVG icons for theme toggle
   */
  createIcon(type) {
    const icon = document.createElement('span');
    icon.className = `theme-icon theme-icon--${type}`;
    icon.setAttribute('aria-hidden', 'true');
    
    let svg = '';
    switch (type) {
      case 'sun':
        svg = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        `;
        break;
      case 'moon':
        svg = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        `;
        break;
      case 'auto':
        svg = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        `;
        break;
    }
    
    icon.innerHTML = svg;
    return icon;
  }

  /**
   * Update toggle button state
   */
  updateToggleButton() {
    if (!this.toggleButton) return;
    
    const effectiveTheme = this.getEffectiveTheme();
    
    // Update aria-pressed
    this.toggleButton.setAttribute('aria-pressed', effectiveTheme === 'dark' ? 'true' : 'false');
    
    // Update aria-label based on current theme
    const labels = {
      light: 'Switch to dark theme',
      dark: 'Switch to auto theme',
      auto: 'Switch to light theme'
    };
    this.toggleButton.setAttribute('aria-label', labels[this.currentTheme] || 'Toggle theme');
    
    // Update active icon
    const icons = this.toggleButton.querySelectorAll('.theme-icon');
    icons.forEach(icon => icon.classList.remove('active'));
    
    const activeIcon = this.toggleButton.querySelector(`.theme-icon--${this.currentTheme}`);
    if (activeIcon) {
      activeIcon.classList.add('active');
    }
  }

  /**
   * Cycle through themes: light -> dark -> auto -> light
   */
  cycleTheme() {
    const themeOrder = ['light', 'dark', 'auto'];
    const currentIndex = themeOrder.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    
    this.setTheme(themeOrder[nextIndex]);
  }

  /**
   * Set specific theme
   */
  setTheme(theme) {
    if (!['light', 'dark', 'auto'].includes(theme)) {
      console.warn('Invalid theme:', theme);
      return;
    }
    
    this.currentTheme = theme;
    this.saveTheme();
    this.applyTheme();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle button click
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.cycleTheme();
      });
      
      // Keyboard support
      this.toggleButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.cycleTheme();
        }
      });
    }
  }

  /**
   * Watch for system preference changes
   */
  watchSystemPreference() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        this.systemPreference = e.matches ? 'dark' : 'light';
        
        // Only apply if current theme is 'auto'
        if (this.currentTheme === 'auto') {
          this.applyTheme();
        }
      };
      
      // Modern browsers
      if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
      } else if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      }
    }
  }

  /**
   * Dispatch theme change event
   */
  dispatchThemeChangeEvent(effectiveTheme) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme: this.currentTheme,
        effectiveTheme: effectiveTheme,
        systemPreference: this.systemPreference
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Get current theme info
   */
  getThemeInfo() {
    return {
      current: this.currentTheme,
      effective: this.getEffectiveTheme(),
      system: this.systemPreference
    };
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
  });
} else {
  window.themeManager = new ThemeManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}