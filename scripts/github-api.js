// GitHub API Integration for Portfolio

class GitHubAPI {
  constructor(username = 'endersclarity') {
    this.username = username;
    this.baseUrl = 'https://api.github.com';
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour in milliseconds
    this.rateLimitRemaining = 60;
    this.rateLimitReset = null;
    
    this.init();
  }
  
  init() {
    this.checkRateLimit();
  }
  
  // Check GitHub API rate limit status
  async checkRateLimit() {
    try {
      const response = await fetch(`${this.baseUrl}/rate_limit`);
      const data = await response.json();
      
      this.rateLimitRemaining = data.rate.remaining;
      this.rateLimitReset = new Date(data.rate.reset * 1000);
      
      console.log(`GitHub API Rate Limit: ${this.rateLimitRemaining} requests remaining`);
      return data.rate;
    } catch (error) {
      console.warn('Could not check GitHub API rate limit:', error);
      return null;
    }
  }
  
  // Generic API request with caching and rate limiting
  async apiRequest(endpoint, options = {}) {
    const cacheKey = endpoint;
    const now = Date.now();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (now - cached.timestamp < this.cacheExpiry) {
        console.log(`Using cached data for: ${endpoint}`);
        return cached.data;
      }
    }
    
    // Check rate limit
    if (this.rateLimitRemaining <= 1 && this.rateLimitReset && now < this.rateLimitReset.getTime()) {
      const waitTime = Math.ceil((this.rateLimitReset.getTime() - now) / 1000);
      console.warn(`GitHub API rate limit exceeded. Reset in ${waitTime} seconds.`);
      throw new Error(`Rate limit exceeded. Please try again in ${waitTime} seconds.`);
    }
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-Website',
          ...options.headers
        },
        ...options
      });
      
      // Update rate limit info from response headers
      this.updateRateLimitFromHeaders(response);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        }
        if (response.status === 404) {
          throw new Error('GitHub repository not found');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache successful response
      this.cache.set(cacheKey, {
        data,
        timestamp: now
      });
      
      return data;
    } catch (error) {
      console.error(`GitHub API request failed for ${endpoint}:`, error);
      
      // Return cached data if available, even if expired
      if (this.cache.has(cacheKey)) {
        console.log(`Using expired cache data for: ${endpoint}`);
        return this.cache.get(cacheKey).data;
      }
      
      throw error;
    }
  }
  
  // Update rate limit info from response headers
  updateRateLimitFromHeaders(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    
    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = new Date(parseInt(reset) * 1000);
  }
  
  // Get user profile information
  async getUserProfile() {
    try {
      return await this.apiRequest(`/users/${this.username}`);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return this.getFallbackUserData();
    }
  }
  
  // Get repositories with enhanced data
  async getRepositories(options = {}) {
    const {
      sort = 'updated',
      direction = 'desc',
      per_page = 30,
      featured = null,
      exclude = []
    } = options;
    
    try {
      const repos = await this.apiRequest(
        `/users/${this.username}/repos?sort=${sort}&direction=${direction}&per_page=${per_page}`
      );
      
      // Filter repositories
      let filteredRepos = repos.filter(repo => {
        // Exclude specified repositories
        if (exclude.includes(repo.name)) return false;
        
        // Only show public repositories
        if (repo.private) return false;
        
        // Filter by featured if specified
        if (featured && Array.isArray(featured)) {
          return featured.includes(repo.name);
        }
        
        return true;
      });
      
      // Enhance repository data
      const enhancedRepos = await Promise.all(
        filteredRepos.map(repo => this.enhanceRepositoryData(repo))
      );
      
      return enhancedRepos;
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      return this.getFallbackRepositories();
    }
  }
  
  // Enhance repository data with additional information
  async enhanceRepositoryData(repo) {
    try {
      // Get languages used in the repository
      const languages = await this.getRepositoryLanguages(repo.name);
      
      // Get latest release if available
      const latestRelease = await this.getLatestRelease(repo.name);
      
      // Get repository topics/tags
      const topics = repo.topics || [];
      
      return {
        ...repo,
        languages_data: languages,
        primary_language: this.getPrimaryLanguage(languages),
        latest_release: latestRelease,
        topics,
        enhanced: true,
        is_featured: this.isRepositoryFeatured(repo.name),
        display_stats: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          issues: repo.open_issues_count,
          size: this.formatRepoSize(repo.size)
        }
      };
    } catch (error) {
      console.warn(`Could not enhance data for repository ${repo.name}:`, error);
      return {
        ...repo,
        enhanced: false,
        is_featured: this.isRepositoryFeatured(repo.name),
        display_stats: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          issues: repo.open_issues_count,
          size: this.formatRepoSize(repo.size)
        }
      };
    }
  }
  
  // Get programming languages used in a repository
  async getRepositoryLanguages(repoName) {
    try {
      return await this.apiRequest(`/repos/${this.username}/${repoName}/languages`);
    } catch (error) {
      console.warn(`Could not fetch languages for ${repoName}:`, error);
      return {};
    }
  }
  
  // Get latest release for a repository
  async getLatestRelease(repoName) {
    try {
      return await this.apiRequest(`/repos/${this.username}/${repoName}/releases/latest`);
    } catch (error) {
      // Most repos won't have releases, so this is expected
      return null;
    }
  }
  
  // Get primary programming language from languages data
  getPrimaryLanguage(languages) {
    if (!languages || Object.keys(languages).length === 0) return null;
    
    return Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .map(([language]) => language)[0];
  }
  
  // Check if repository is featured based on project data
  isRepositoryFeatured(repoName) {
    // This will be enhanced when integrated with project data
    const featuredRepos = [
      'personal-portfolio',
      'task-manager-app',
      'weather-dashboard',
      'ecommerce-platform',
      'blog-cms'
    ];
    
    return featuredRepos.includes(repoName);
  }
  
  // Format repository size for display
  formatRepoSize(sizeInKB) {
    if (sizeInKB < 1024) return `${sizeInKB} KB`;
    const sizeInMB = (sizeInKB / 1024).toFixed(1);
    return `${sizeInMB} MB`;
  }
  
  // Get contribution statistics
  async getContributionStats() {
    try {
      // Note: GitHub doesn't provide a direct API for contribution graphs
      // This would require GitHub GraphQL API or scraping
      // For now, return calculated stats from repositories
      const repos = await this.getRepositories();
      
      const stats = repos.reduce((acc, repo) => {
        acc.totalStars += repo.stargazers_count;
        acc.totalForks += repo.forks_count;
        acc.totalRepos += 1;
        
        if (repo.languages_data) {
          Object.keys(repo.languages_data).forEach(lang => {
            acc.languages.add(lang);
          });
        }
        
        return acc;
      }, {
        totalStars: 0,
        totalForks: 0,
        totalRepos: 0,
        languages: new Set()
      });
      
      return {
        ...stats,
        languages: Array.from(stats.languages),
        languageCount: stats.languages.size
      };
    } catch (error) {
      console.error('Failed to calculate contribution stats:', error);
      return this.getFallbackStats();
    }
  }
  
  // Fallback data when API is unavailable
  getFallbackUserData() {
    return {
      login: this.username,
      name: 'Kaelen Jennings',
      bio: 'Experienced Full-Stack Developer specializing in modern web technologies',
      company: null,
      location: 'Grass Valley, CA',
      email: 'endersclarity@gmail.com',
      public_repos: 15,
      followers: 0,
      following: 0,
      created_at: '2020-01-01T00:00:00Z',
      avatar_url: 'https://github.com/identicons/endersclarity.png',
      html_url: `https://github.com/${this.username}`,
      fallback: true
    };
  }
  
  getFallbackRepositories() {
    return [
      {
        name: 'personal-portfolio',
        description: 'Modern, responsive portfolio website built with vanilla HTML5, CSS3, and JavaScript',
        html_url: `https://github.com/${this.username}/personal-portfolio`,
        stargazers_count: 0,
        forks_count: 0,
        language: 'JavaScript',
        updated_at: new Date().toISOString(),
        topics: ['portfolio', 'html5', 'css3', 'javascript'],
        fallback: true,
        is_featured: true,
        display_stats: { stars: 0, forks: 0, issues: 0, size: '2.5 MB' }
      }
    ];
  }
  
  getFallbackStats() {
    return {
      totalStars: 0,
      totalForks: 0,
      totalRepos: 5,
      languages: ['JavaScript', 'HTML', 'CSS', 'Python', 'Node.js'],
      languageCount: 5,
      fallback: true
    };
  }
  
  // Clear cache (useful for development/testing)
  clearCache() {
    this.cache.clear();
    console.log('GitHub API cache cleared');
  }
  
  // Get cache status for debugging
  getCacheStatus() {
    const cacheEntries = Array.from(this.cache.entries()).map(([key, value]) => ({
      endpoint: key,
      age: Date.now() - value.timestamp,
      expired: Date.now() - value.timestamp > this.cacheExpiry
    }));
    
    return {
      entries: cacheEntries,
      totalEntries: this.cache.size,
      rateLimitRemaining: this.rateLimitRemaining,
      rateLimitReset: this.rateLimitReset
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubAPI;
}