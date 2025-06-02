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
    
    // Initialize Asset Manager
    if (typeof AssetManager !== 'undefined') {
      this.assetManager = new AssetManager();
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
      
      // Process assets with lazy loading after content is populated
      if (this.assetManager) {
        this.assetManager.processAssets();
      }
      
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
      
      // Setup asset management for project images
      this.setupProjectAssets();
      
      // Setup interactive project card functionality
      this.setupProjectInteractions();
      
    } catch (error) {
      console.error('Error loading GitHub data:', error);
      
      // Fallback to basic project display
      this.populateProjectsContentFallback(projectsData);
    }
  }
  
  // Setup interactive functionality for project cards
  setupProjectInteractions() {
    // Handle project card detail toggles
    const toggleButtons = document.querySelectorAll('.project-card__toggle');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleProjectDetails(button);
      });
    });
  }
  
  // Toggle project card details
  toggleProjectDetails(button) {
    const projectCard = button.closest('.project-card');
    const details = projectCard.querySelector('.project-card__details');
    const toggleText = button.querySelector('.toggle-text');
    const toggleIcon = button.querySelector('.toggle-icon');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    if (details) {
      if (isExpanded) {
        details.style.display = 'none';
        toggleText.textContent = 'Show Details';
        button.setAttribute('aria-expanded', 'false');
        toggleIcon.style.transform = 'rotate(0deg)';
      } else {
        details.style.display = 'block';
        toggleText.textContent = 'Hide Details';
        button.setAttribute('aria-expanded', 'true');
        toggleIcon.style.transform = 'rotate(180deg)';
      }
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
  
  // Render individual project card with enhanced GitHub integration
  renderProjectCard(project) {
    const hasWorkflow = project.workflow && project.workflow.length > 0;
    const hasSkills = project.skills_demonstrated && project.skills_demonstrated.length > 0;
    const hasGitHubLink = project.links && project.links.github;
    const hasLiveLink = project.links && project.links.live;
    
    return `
      <article class="project-card ${project.is_live ? 'project-card--live' : ''}" 
               data-category="${project.category}"
               data-project-id="${project.id}"
               data-repo="${project.github_repo || ''}">
        <div class="project-card__image">
          <div class="project-card__image-placeholder">
            <img src="${project.image || 'assets/projects/placeholder.webp'}" 
                 alt="${project.title} screenshot" 
                 loading="lazy"
                 class="project-card__screenshot"
                 style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          ${project.stats ? this.renderProjectStats(project.stats) : ''}
          ${project.featured ? '<div class="project-card__featured-badge">Featured</div>' : ''}
        </div>
        <div class="project-card__content">
          <div class="project-card__header">
            <h3 class="project-card__title">${project.title}</h3>
            ${project.subtitle ? `<p class="project-card__subtitle">${project.subtitle}</p>` : ''}
            ${project.is_live ? '<span class="project-card__live-indicator" title="Live GitHub data">🔴</span>' : ''}
          </div>
          
          <p class="project-card__description">${project.description}</p>
          
          ${project.long_description ? `
            <div class="project-card__details" style="display: none;">
              <p class="project-card__long-description">${project.long_description}</p>
            </div>
          ` : ''}
          
          ${project.primary_language ? `
            <div class="project-card__language">
              <span class="language-indicator">
                <span class="language-color" data-language="${project.primary_language}"></span>
                ${project.primary_language}
              </span>
            </div>
          ` : ''}
          
          <div class="project-card__tech">
            ${project.technologies.slice(0, 6).map(tech => 
              `<span class="tech-tag">${tech}</span>`
            ).join('')}
          </div>
          
          ${hasWorkflow ? `
            <div class="project-card__workflow">
              <h4 class="workflow-title">Development Process</h4>
              <ol class="workflow-list">
                ${project.workflow.slice(0, 4).map(step => {
                  const [title, description] = step.split(': ');
                  return `<li class="workflow-step">
                    <strong>${title}:</strong> ${description || ''}
                  </li>`;
                }).join('')}
                ${project.workflow.length > 4 ? `<li class="workflow-more">+${project.workflow.length - 4} more steps...</li>` : ''}
              </ol>
            </div>
          ` : ''}
          
          ${hasSkills ? `
            <div class="project-card__skills">
              <h4 class="skills-title">Skills Demonstrated</h4>
              <div class="skills-grid">
                ${project.skills_demonstrated.slice(0, 6).map(skill => 
                  `<span class="skill-badge">${skill}</span>`
                ).join('')}
              </div>
            </div>
          ` : ''}
          
          ${project.topics && project.topics.length > 0 ? `
            <div class="project-card__topics">
              ${project.topics.slice(0, 3).map(topic => 
                `<span class="topic-tag">${topic}</span>`
              ).join('')}
            </div>
          ` : ''}
          
          <div class="project-card__links">
            ${hasLiveLink ? `
              <a href="${project.links.live}" 
                 class="project-link project-link--primary" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 aria-label="View ${project.title} live demo">
                <span>Live Demo</span>
                <svg class="link-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                </svg>
              </a>
            ` : ''}
            ${hasGitHubLink ? `
              <a href="${project.links.github}" 
                 class="project-link project-link--secondary" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 aria-label="View ${project.title} source code">
                <span>Source Code</span>
                <svg class="link-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            ` : ''}
          </div>
          
          <div class="project-card__meta">
            ${project.year ? `<span class="project-meta__year">${project.year}</span>` : ''}
            ${project.status ? `<span class="project-meta__status project-status--${project.status.toLowerCase()}">${project.status}</span>` : ''}
            ${project.last_updated ? `
              <span class="project-meta__updated">
                Updated ${this.formatRelativeTime(project.last_updated)}
              </span>
            ` : ''}
          </div>
          
          ${project.long_description || hasWorkflow ? `
            <button class="project-card__toggle" aria-expanded="false">
              <span class="toggle-text">Show Details</span>
              <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            </button>
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
  
  // Setup asset management for project images
  setupProjectAssets() {
    if (typeof window.assetManager !== 'undefined') {
      const projectImages = document.querySelectorAll('img[data-category="projects"]');
      
      projectImages.forEach(img => {
        const assetName = img.dataset.asset;
        const category = img.dataset.category;
        
        if (window.assetManager && window.assetManager.getAsset) {
          window.assetManager.setupAssetElement(img, category, assetName);
        }
      });
    }
    
    // Also setup hero and about images
    this.setupProfileAssets();
  }
  
  // Setup profile/hero image assets
  setupProfileAssets() {
    if (typeof window.assetManager !== 'undefined') {
      const profileImages = document.querySelectorAll('img[data-category="images"]');
      
      profileImages.forEach(img => {
        const assetName = img.dataset.asset;
        const category = img.dataset.category;
        
        if (window.assetManager && window.assetManager.getAsset) {
          window.assetManager.setupAssetElement(img, category, assetName);
        }
      });
    }
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

// CSS for enhanced project cards and skill proficiency levels
const enhancedProjectStyles = `
  /* Enhanced Project Card Styles */
  .project-card__subtitle {
    font-size: 0.9rem;
    color: var(--color-text-secondary, #666);
    margin: 0.25rem 0 0.5rem 0;
    font-style: italic;
  }
  
  .project-card__featured-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .project-card__workflow {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--color-background-secondary, #f8f9fa);
    border-radius: 0.5rem;
    border-left: 4px solid var(--color-primary, #007bff);
  }
  
  .workflow-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary, #333);
  }
  
  .workflow-list {
    margin: 0;
    padding-left: 1.25rem;
    list-style: none;
    counter-reset: workflow-counter;
  }
  
  .workflow-step {
    counter-increment: workflow-counter;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    line-height: 1.4;
    position: relative;
  }
  
  .workflow-step::before {
    content: counter(workflow-counter);
    position: absolute;
    left: -1.25rem;
    top: 0;
    width: 1rem;
    height: 1rem;
    background: var(--color-primary, #007bff);
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .workflow-more {
    font-style: italic;
    color: var(--color-text-secondary, #666);
    font-size: 0.8rem;
  }
  
  .project-card__skills {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--color-background-tertiary, #f0f4f8);
    border-radius: 0.5rem;
    border-left: 4px solid var(--color-success, #28a745);
  }
  
  .skills-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary, #333);
  }
  
  .skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .skill-badge {
    background: var(--color-success, #28a745);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }
  
  .project-card__toggle {
    background: none;
    border: 1px solid var(--color-border, #ddd);
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    font-size: 0.85rem;
    color: var(--color-text-primary, #333);
    transition: all 0.2s ease;
    width: 100%;
    justify-content: center;
  }
  
  .project-card__toggle:hover {
    background: var(--color-background-secondary, #f8f9fa);
    border-color: var(--color-primary, #007bff);
  }
  
  .toggle-icon {
    transition: transform 0.2s ease;
  }
  
  .project-card__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border, #eee);
    font-size: 0.8rem;
  }
  
  .project-meta__year {
    background: var(--color-background-secondary, #f8f9fa);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
  }
  
  .project-meta__status {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .project-status--complete {
    background: var(--color-success, #28a745);
    color: white;
  }
  
  .project-status--in-development {
    background: var(--color-warning, #ffc107);
    color: var(--color-text-primary, #333);
  }
  
  .project-status--active {
    background: var(--color-info, #17a2b8);
    color: white;
  }
  
  .project-meta__updated {
    color: var(--color-text-secondary, #666);
    font-style: italic;
  }
  
  .link-icon {
    margin-left: 0.25rem;
  }
  
  /* Skill proficiency levels */
  .skill-item--expert {
    background-color: var(--color-success, #28a745);
    color: white;
    font-weight: 600;
  }
  
  .skill-item--advanced {
    background-color: var(--color-primary, #007bff);
    color: white;
  }
  
  .skill-item--intermediate {
    background-color: var(--color-info, #17a2b8);
    color: white;
  }
  
  .content-error {
    background-color: var(--color-warning, #ffc107);
    color: var(--color-text-primary, #333);
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
    border: 1px solid rgba(0,0,0,0.1);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .project-card__workflow,
    .project-card__skills {
      margin: 0.75rem 0;
      padding: 0.75rem;
    }
    
    .workflow-step,
    .skills-grid .skill-badge {
      font-size: 0.8rem;
    }
    
    .project-card__meta {
      font-size: 0.75rem;
    }
  }
`;

// Inject enhanced styles
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedProjectStyles;
document.head.appendChild(styleSheet);

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentManager;
}