// Content Management System for Portfolio

class ContentManager {
  constructor() {
    this.cache = new Map();
    this.loadPromises = new Map();
    this.baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    this.githubAPI = null;
    
    this.init();
  }
  
  async init() {
    // Initialize GitHub API
    if (typeof GitHubAPI !== 'undefined') {
      this.githubAPI = new GitHubAPI('endersclarity');
    }
    
    await this.loadAllContent();
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
      
      // Enhanced projects with GitHub integration
      await this.populateProjectsContentWithGitHub(projects);
      
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
  
  // Enhanced projects content with GitHub integration
  async populateProjectsContentWithGitHub(projectsData) {
    if (!projectsData || !projectsData.featured_projects) return;
    
    const projectsGrid = document.querySelector('.projects__grid');
    if (!projectsGrid) return;
    
    // Show loading state
    projectsGrid.innerHTML = '<div class="projects-loading">Loading projects...</div>';
    
    try {
      // Get featured projects from local data
      const featuredProjects = projectsData.featured_projects.filter(project => project.featured);
      const githubConfig = projectsData.github_config || {};
      
      // Enhance projects with live GitHub data
      const enhancedProjects = await this.enhanceProjectsWithGitHubData(
        featuredProjects, 
        githubConfig
      );
      
      // Render enhanced projects
      projectsGrid.innerHTML = enhancedProjects.map(project => 
        this.renderProjectCard(project)
      ).join('');
      
      // Add GitHub stats indicators
      this.addGitHubStatsIndicators(enhancedProjects);
      
    } catch (error) {
      console.error('Error loading GitHub data:', error);
      
      // Fallback to basic project display
      this.populateProjectsContentFallback(projectsData);
    }
  }
  
  // Fallback project content population without GitHub integration
  populateProjectsContentFallback(data) {
    if (!data || !data.featured_projects) return;
    
    const projectsGrid = document.querySelector('.projects__grid');
    if (!projectsGrid) return;
    
    const featuredProjects = data.featured_projects.filter(project => project.featured);
    
    projectsGrid.innerHTML = featuredProjects.map(project => 
      this.renderProjectCard(project)
    ).join('');
  }
  
  // Enhance project data with live GitHub information
  async enhanceProjectsWithGitHubData(projects, githubConfig) {
    if (!this.githubAPI) {
      console.warn('GitHub API not available, using fallback data');
      return projects;
    }
    
    try {
      // Get GitHub repositories
      const repos = await this.githubAPI.getRepositories({
        featured: githubConfig.featured_repos,
        exclude: githubConfig.exclude_repos
      });
      
      // Create a map of repo names to repo data
      const repoMap = new Map(repos.map(repo => [repo.name, repo]));
      
      // Enhance each project with GitHub data
      const enhancedProjects = projects.map(project => {
        const githubData = repoMap.get(project.github_repo);
        
        if (githubData) {
          return {
            ...project,
            github_data: githubData,
            stats: githubData.display_stats,
            last_updated: githubData.updated_at,
            primary_language: githubData.primary_language,
            topics: githubData.topics || [],
            is_live: true
          };
        }
        
        return {
          ...project,
          is_live: false,
          fallback_message: githubConfig.fallback_message || 'GitHub data unavailable'
        };
      });
      
      return enhancedProjects;
    } catch (error) {
      console.error('Error enhancing projects with GitHub data:', error);
      return projects.map(project => ({ ...project, is_live: false }));
    }
  }
  
  // Render individual project card
  renderProjectCard(project) {
    return `
      <article class="project-card ${project.is_live ? 'project-card--live' : ''}" 
               data-category="${project.category}"
               data-repo="${project.github_repo || ''}">
        <div class="project-card__image">
          <div class="project-card__image-placeholder">
            <img src="${project.image}" 
                 alt="${project.title} screenshot" 
                 loading="lazy"
                 onerror="this.parentElement.innerHTML='<span>Project Screenshot</span>'"
                 style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          ${project.stats ? this.renderProjectStats(project.stats) : ''}
        </div>
        <div class="project-card__content">
          <div class="project-card__header">
            <h3 class="project-card__title">${project.title}</h3>
            ${project.is_live ? '<span class="project-card__live-indicator" title="Live GitHub data">🔴</span>' : ''}
          </div>
          <p class="project-card__description">${project.description}</p>
          
          ${project.primary_language ? `
            <div class="project-card__language">
              <span class="language-indicator">
                <span class="language-color" data-language="${project.primary_language}"></span>
                ${project.primary_language}
              </span>
            </div>
          ` : ''}
          
          <div class="project-card__tech">
            ${project.technologies.slice(0, 4).map(tech => 
              `<span class="tech-tag">${tech}</span>`
            ).join('')}
          </div>
          
          ${project.topics && project.topics.length > 0 ? `
            <div class="project-card__topics">
              ${project.topics.slice(0, 3).map(topic => 
                `<span class="topic-tag">${topic}</span>`
              ).join('')}
            </div>
          ` : ''}
          
          <div class="project-card__links">
            ${project.live_url ? `
              <a href="${project.live_url}" 
                 class="project-link project-link--primary" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 aria-label="View ${project.title} live demo">
                <span>Live Demo</span>
              </a>
            ` : ''}
            ${project.github_repo ? `
              <a href="https://github.com/endersclarity/${project.github_repo}" 
                 class="project-link project-link--secondary" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 aria-label="View ${project.title} source code">
                <span>Source Code</span>
              </a>
            ` : ''}
          </div>
          
          ${project.last_updated ? `
            <div class="project-card__meta">
              <span class="project-meta__updated">
                Updated ${this.formatRelativeTime(project.last_updated)}
              </span>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }
  
  // Render project statistics overlay
  renderProjectStats(stats) {
    return `
      <div class="project-card__stats">
        ${stats.stars > 0 ? `<span class="stat-item" title="${stats.stars} stars">⭐ ${stats.stars}</span>` : ''}
        ${stats.forks > 0 ? `<span class="stat-item" title="${stats.forks} forks">🍴 ${stats.forks}</span>` : ''}
        ${stats.issues > 0 ? `<span class="stat-item" title="${stats.issues} open issues">📋 ${stats.issues}</span>` : ''}
      </div>
    `;
  }
  
  // Add GitHub stats indicators and styling
  addGitHubStatsIndicators(projects) {
    // Add language color indicators
    const languageColors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C#': '#239120',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33'
    };
    
    projects.forEach(project => {
      if (project.primary_language) {
        const colorElements = document.querySelectorAll(
          `[data-repo="${project.github_repo}"] .language-color[data-language="${project.primary_language}"]`
        );
        
        colorElements.forEach(element => {
          const color = languageColors[project.primary_language] || '#888';
          element.style.backgroundColor = color;
        });
      }
    });
  }
  
  // Format relative time for last updated
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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