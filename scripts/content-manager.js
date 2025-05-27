// Content Management System for Portfolio

class ContentManager {
  constructor() {
    this.cache = new Map();
    this.loadPromises = new Map();
    this.baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    
    this.init();
  }
  
  init() {
    this.loadAllContent();
  }
  
  // Load all content data files
  async loadAllContent() {
    try {
      const [portfolio, skills, projects] = await Promise.all([
        this.loadContent('portfolio'),
        this.loadContent('skills'),
        this.loadContent('projects')
      ]);
      
      // Populate content on page load
      this.populatePortfolioContent(portfolio);
      this.populateSkillsContent(skills);
      this.populateProjectsContent(projects);
      
      return { portfolio, skills, projects };
    } catch (error) {
      console.error('Error loading content:', error);
      this.handleContentLoadError(error);
    }
  }
  
  // Generic content loader with caching
  async loadContent(type) {
    // Check cache first
    if (this.cache.has(type)) {
      return this.cache.get(type);
    }
    
    // Check if already loading
    if (this.loadPromises.has(type)) {
      return this.loadPromises.get(type);
    }
    
    // Load content
    const loadPromise = this.fetchContent(type);
    this.loadPromises.set(type, loadPromise);
    
    try {
      const data = await loadPromise;
      this.cache.set(type, data);
      this.loadPromises.delete(type);
      return data;
    } catch (error) {
      this.loadPromises.delete(type);
      throw error;
    }
  }
  
  // Fetch content from JSON files
  async fetchContent(type) {
    const response = await fetch(`${this.baseUrl}/data/${type}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${type} content: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Populate portfolio/personal content
  populatePortfolioContent(data) {
    if (!data) return;
    
    const { personal, social, contact, experience, education } = data;
    
    // Update hero section
    this.updateElement('.hero__name', personal.name);
    this.updateElement('.hero__subtitle', personal.title);
    this.updateElement('.hero__description', personal.bio.short);
    
    // Update about section
    if (personal.bio.long) {
      const aboutText = document.querySelector('.about__text');
      if (aboutText) {
        aboutText.innerHTML = personal.bio.long
          .map(paragraph => `<p class="about__paragraph">${paragraph}</p>`)
          .join('');
      }
    }
    
    // Update highlights
    if (data.highlights) {
      this.updateHighlights(data.highlights);
    }
    
    // Update contact information
    this.updateElement('.contact__link[href^="mailto:"]', personal.email, 'href', `mailto:${personal.email}`);
    this.updateElement('.contact__text', personal.location);
    
    // Update social links
    if (social) {
      this.updateElement('a[href*="github.com"]', null, 'href', social.github.url);
      this.updateElement('a[href*="linkedin.com"]', null, 'href', social.linkedin.url);
    }
    
    // Update meta tags
    this.updateMetaTags(personal);
  }
  
  // Update highlights section
  updateHighlights(highlights) {
    const highlightsContainer = document.querySelector('.about__highlights');
    if (!highlightsContainer || !highlights) return;
    
    const highlightItems = [
      { title: 'Experience', text: `${highlights.years_experience}+ years in development` },
      { title: 'Projects', text: `${highlights.projects_completed}+ projects completed` },
      { title: 'Technologies', text: `${highlights.technologies_mastered}+ technologies mastered` }
    ];
    
    highlightsContainer.innerHTML = highlightItems
      .map(item => `
        <div class="highlight">
          <h3 class="highlight__title">${item.title}</h3>
          <p class="highlight__text">${item.text}</p>
        </div>
      `).join('');
  }
  
  // Populate skills content
  populateSkillsContent(data) {
    if (!data || !data.categories) return;
    
    const skillsContainer = document.querySelector('.skills__categories');
    if (!skillsContainer) return;
    
    const categories = Object.values(data.categories);
    
    skillsContainer.innerHTML = categories.map(category => `
      <div class="skill-category">
        <h3 class="skill-category__title">${category.title}</h3>
        <div class="skill-category__items">
          ${category.skills
            .filter(skill => skill.proficiency >= 70) // Show only intermediate+ skills
            .sort((a, b) => b.proficiency - a.proficiency) // Sort by proficiency
            .slice(0, 8) // Limit to top 8 skills per category
            .map(skill => `
              <span class="skill-item" 
                    title="${skill.description} (${skill.proficiency}% proficiency)"
                    data-proficiency="${skill.proficiency}">
                ${skill.name}
              </span>
            `).join('')}
        </div>
      </div>
    `).join('');
    
    // Add proficiency-based styling
    this.addSkillProficiencyStyles();
  }
  
  // Add visual indicators for skill proficiency
  addSkillProficiencyStyles() {
    const skillItems = document.querySelectorAll('.skill-item[data-proficiency]');
    
    skillItems.forEach(item => {
      const proficiency = parseInt(item.dataset.proficiency);
      
      if (proficiency >= 90) {
        item.classList.add('skill-item--expert');
      } else if (proficiency >= 80) {
        item.classList.add('skill-item--advanced');
      } else if (proficiency >= 70) {
        item.classList.add('skill-item--intermediate');
      }
    });
  }
  
  // Populate projects content (will be enhanced with GitHub integration)
  populateProjectsContent(data) {
    if (!data || !data.featured_projects) return;
    
    const projectsGrid = document.querySelector('.projects__grid');
    if (!projectsGrid) return;
    
    // Show featured projects only for now
    const featuredProjects = data.featured_projects.filter(project => project.featured);
    
    projectsGrid.innerHTML = featuredProjects.map(project => `
      <article class="project-card" data-category="${project.category}">
        <div class="project-card__image">
          <div class="project-card__image-placeholder">
            <img src="${project.image}" 
                 alt="${project.title} screenshot" 
                 loading="lazy"
                 onerror="this.parentElement.innerHTML='<span>Project Screenshot</span>'"
                 style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>
        <div class="project-card__content">
          <h3 class="project-card__title">${project.title}</h3>
          <p class="project-card__description">${project.description}</p>
          <div class="project-card__tech">
            ${project.technologies.slice(0, 4).map(tech => 
              `<span class="tech-tag">${tech}</span>`
            ).join('')}
          </div>
          <div class="project-card__links">
            ${project.live_url ? `
              <a href="${project.live_url}" 
                 class="project-link" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 aria-label="View ${project.title} live demo">
                <span>Live Demo</span>
              </a>
            ` : ''}
            ${project.github_repo ? `
              <a href="https://github.com/endersclarity/${project.github_repo}" 
                 class="project-link" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 aria-label="View ${project.title} source code">
                <span>Source Code</span>
              </a>
            ` : ''}
          </div>
        </div>
      </article>
    `).join('');
  }
  
  // Update meta tags for SEO
  updateMetaTags(personal) {
    if (!personal) return;
    
    const title = `${personal.name} - ${personal.title}`;
    const description = personal.bio.short;
    
    document.title = title;
    
    this.updateMetaTag('description', description);
    this.updateMetaTag('og:title', title);
    this.updateMetaTag('og:description', description);
    this.updateMetaTag('twitter:title', title);
    this.updateMetaTag('twitter:description', description);
  }
  
  // Helper method to update meta tags
  updateMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  }
  
  // Helper method to update element content
  updateElement(selector, content, attribute = null, value = null) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    if (attribute && value !== null) {
      element.setAttribute(attribute, value);
    }
    
    if (content !== null) {
      element.textContent = content;
    }
  }
  
  // Handle content loading errors
  handleContentLoadError(error) {
    console.error('Content loading failed:', error);
    
    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'content-error';
    errorMessage.innerHTML = `
      <p>Some content is temporarily unavailable. Please refresh the page to try again.</p>
    `;
    
    // Insert error message at the top of the page
    const main = document.querySelector('main');
    if (main) {
      main.insertBefore(errorMessage, main.firstChild);
    }
  }
  
  // Public API methods
  async getContent(type) {
    return this.loadContent(type);
  }
  
  clearCache() {
    this.cache.clear();
  }
  
  // Refresh content
  async refreshContent(type = null) {
    if (type) {
      this.cache.delete(type);
      return this.loadContent(type);
    } else {
      this.clearCache();
      return this.loadAllContent();
    }
  }
}

// CSS for skill proficiency levels
const skillProfiencyStyles = `
  .skill-item--expert {
    background-color: var(--color-success);
    color: var(--color-white);
    font-weight: var(--font-weight-semibold);
  }
  
  .skill-item--advanced {
    background-color: var(--color-primary);
    color: var(--color-white);
  }
  
  .skill-item--intermediate {
    background-color: var(--color-primary-light);
    color: var(--color-primary-dark);
  }
  
  .content-error {
    background-color: var(--color-warning);
    color: var(--color-white);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
    text-align: center;
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = skillProfiencyStyles;
document.head.appendChild(styleSheet);

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentManager;
}