// Asset Generator for Portfolio Website

class AssetGenerator {
  constructor() {
    this.primaryColor = '#3b82f6';
    this.secondaryColor = '#1e40af';
    this.accentColor = '#06d6a0';
    this.textColor = '#1f2937';
    this.init();
  }
  
  init() {
    this.generateFavicon();
    this.generateProfilePlaceholder();
    this.generateProjectPlaceholders();
    this.generateIconSet();
  }
  
  // Generate favicon SVG
  generateFavicon() {
    const faviconSVG = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${this.primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${this.secondaryColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="6" fill="url(#faviconGradient)"/>
        <text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
              text-anchor="middle" fill="white">KJ</text>
      </svg>
    `;
    
    this.downloadSVG(faviconSVG, 'favicon.svg');
    return faviconSVG;
  }
  
  // Generate profile image placeholder
  generateProfilePlaceholder() {
    const profileSVG = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${this.primaryColor};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${this.accentColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${this.secondaryColor};stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background circle -->
        <circle cx="200" cy="200" r="190" fill="url(#profileGradient)" opacity="0.1"/>
        
        <!-- Profile silhouette -->
        <circle cx="200" cy="160" r="60" fill="url(#profileGradient)" opacity="0.8"/>
        <path d="M 120 280 Q 120 240 200 240 Q 280 240 280 280 L 280 320 Q 280 340 260 340 L 140 340 Q 120 340 120 320 Z" 
              fill="url(#profileGradient)" opacity="0.8"/>
        
        <!-- Initials -->
        <text x="200" y="380" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="${this.textColor}" opacity="0.7">Kaelen Jennings</text>
        
        <!-- Decorative elements -->
        <circle cx="100" cy="100" r="4" fill="${this.accentColor}" opacity="0.6" filter="url(#glow)"/>
        <circle cx="320" cy="120" r="3" fill="${this.primaryColor}" opacity="0.8" filter="url(#glow)"/>
        <circle cx="80" cy="300" r="2" fill="${this.secondaryColor}" opacity="0.7" filter="url(#glow)"/>
        <circle cx="300" cy="320" r="3" fill="${this.accentColor}" opacity="0.5" filter="url(#glow)"/>
      </svg>
    `;
    
    this.downloadSVG(profileSVG, 'profile-placeholder.svg');
    return profileSVG;
  }
  
  // Generate project screenshot placeholders
  generateProjectPlaceholders() {
    const projects = [
      { name: 'personal-portfolio', title: 'Personal Portfolio', color: this.primaryColor },
      { name: 'task-manager', title: 'Task Manager', color: this.accentColor },
      { name: 'weather-dashboard', title: 'Weather Dashboard', color: this.secondaryColor },
      { name: 'ecommerce-platform', title: 'E-commerce Platform', color: '#ef4444' },
      { name: 'blog-cms', title: 'Blog CMS', color: '#8b5cf6' }
    ];
    
    projects.forEach(project => {
      const projectSVG = this.generateProjectScreenshot(project.title, project.color);
      this.downloadSVG(projectSVG, `${project.name}-screenshot.svg`);
    });
  }
  
  // Generate individual project screenshot
  generateProjectScreenshot(title, primaryColor) {
    return `
      <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="projectGradient-${title.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:${primaryColor};stop-opacity:0.3" />
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="0.2"/>
          </pattern>
        </defs>
        
        <!-- Background -->
        <rect width="600" height="400" fill="#f8fafc"/>
        <rect width="600" height="400" fill="url(#grid)"/>
        
        <!-- Browser chrome -->
        <rect width="600" height="50" fill="#e2e8f0"/>
        <circle cx="20" cy="25" r="6" fill="#ef4444"/>
        <circle cx="40" cy="25" r="6" fill="#f59e0b"/>
        <circle cx="60" cy="25" r="6" fill="#10b981"/>
        <rect x="100" y="15" width="400" height="20" rx="10" fill="#f1f5f9"/>
        
        <!-- Content area -->
        <rect x="20" y="70" width="560" height="310" fill="white" stroke="${primaryColor}" stroke-width="1" opacity="0.5"/>
        <rect x="20" y="70" width="560" height="60" fill="url(#projectGradient-${title.replace(/\s+/g, '')})"/>
        
        <!-- Header -->
        <text x="300" y="105" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="${primaryColor}">${title}</text>
        
        <!-- Content blocks -->
        <rect x="40" y="150" width="200" height="20" fill="${primaryColor}" opacity="0.2" rx="4"/>
        <rect x="40" y="180" width="150" height="15" fill="${primaryColor}" opacity="0.1" rx="4"/>
        <rect x="40" y="200" width="180" height="15" fill="${primaryColor}" opacity="0.1" rx="4"/>
        
        <rect x="280" y="150" width="280" height="120" fill="${primaryColor}" opacity="0.1" rx="8"/>
        <text x="420" y="190" font-family="Arial, sans-serif" font-size="14" 
              text-anchor="middle" fill="${primaryColor}" opacity="0.7">Interactive Demo</text>
        
        <!-- Bottom section -->
        <rect x="40" y="290" width="520" height="60" fill="${primaryColor}" opacity="0.05" rx="8"/>
        <circle cx="80" cy="320" r="15" fill="${primaryColor}" opacity="0.3"/>
        <circle cx="120" cy="320" r="15" fill="${primaryColor}" opacity="0.2"/>
        <circle cx="160" cy="320" r="15" fill="${primaryColor}" opacity="0.1"/>
        
        <!-- Tech stack indicators -->
        <rect x="450" y="300" width="60" height="20" fill="${primaryColor}" opacity="0.2" rx="10"/>
        <text x="480" y="313" font-family="Arial, sans-serif" font-size="10" 
              text-anchor="middle" fill="${primaryColor}">React</text>
        
        <rect x="450" y="325" width="60" height="20" fill="${this.accentColor}" opacity="0.2" rx="10"/>
        <text x="480" y="338" font-family="Arial, sans-serif" font-size="10" 
              text-anchor="middle" fill="${this.accentColor}">Node.js</text>
      </svg>
    `;
  }
  
  // Generate icon set
  generateIconSet() {
    const icons = {
      github: this.generateGitHubIcon(),
      linkedin: this.generateLinkedInIcon(),
      email: this.generateEmailIcon(),
      download: this.generateDownloadIcon(),
      external: this.generateExternalLinkIcon()
    };
    
    Object.entries(icons).forEach(([name, svg]) => {
      this.downloadSVG(svg, `${name}-icon.svg`);
    });
    
    return icons;
  }
  
  generateGitHubIcon() {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="${this.textColor}" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    `;
  }
  
  generateLinkedInIcon() {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="${this.primaryColor}" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    `;
  }
  
  generateEmailIcon() {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="${this.accentColor}" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819A1.636 1.636 0 0 1 24 5.457z"/>
      </svg>
    `;
  }
  
  generateDownloadIcon() {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="${this.textColor}" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
    `;
  }
  
  generateExternalLinkIcon() {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="${this.textColor}" d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
      </svg>
    `;
  }
  
  // Utility method to download SVG
  downloadSVG(svgContent, filename) {
    if (typeof document !== 'undefined') {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // For Node.js environment, just return the SVG content
      return svgContent;
    }
  }
  
  // Generate all assets programmatically
  generateAllAssets() {
    return {
      favicon: this.generateFavicon(),
      profile: this.generateProfilePlaceholder(),
      projects: this.generateProjectPlaceholders(),
      icons: this.generateIconSet()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssetGenerator;
}