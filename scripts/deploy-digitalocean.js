#!/usr/bin/env node

/**
 * DigitalOcean Deployment Script
 * Handles deployment to DigitalOcean App Platform and Droplets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DigitalOceanDeployer {
  constructor() {
    this.projectRoot = process.cwd();
    this.config = this.loadConfig();
    this.doctl = this.checkDoctlInstallation();
  }

  loadConfig() {
    const defaultConfig = {
      app: {
        name: 'kaelen-jennings-portfolio',
        region: 'nyc1',
        spec: {
          name: 'kaelen-jennings-portfolio',
          services: [{
            name: 'web',
            source_dir: '/',
            github: {
              repo: 'endersclarity/personal-portfolio',
              branch: 'main'
            },
            run_command: 'npm start',
            environment_slug: 'node-js',
            instance_count: 1,
            instance_size_slug: 'basic-xxs',
            http_port: 8080,
            routes: [{
              path: '/'
            }]
          }]
        }
      },
      droplet: {
        name: 'portfolio-server',
        region: 'nyc1',
        size: 's-1vcpu-1gb',
        image: 'ubuntu-20-04-x64'
      }
    };

    try {
      const configPath = path.join(this.projectRoot, 'digitalocean.config.js');
      if (fs.existsSync(configPath)) {
        const userConfig = require(configPath);
        return { ...defaultConfig, ...userConfig };
      }
    } catch (error) {
      console.warn('⚠️  DigitalOcean config not found, using defaults');
    }

    return defaultConfig;
  }

  checkDoctlInstallation() {
    try {
      execSync('doctl version', { stdio: 'pipe' });
      console.log('✅ doctl CLI found');
      return true;
    } catch (error) {
      console.log('📦 doctl CLI not found. Installing...');
      return this.installDoctl();
    }
  }

  installDoctl() {
    try {
      console.log('📥 Installing doctl CLI...');
      
      // Check if we're on Linux/WSL
      const platform = process.platform;
      if (platform === 'linux') {
        execSync(`
          cd /tmp &&
          wget https://github.com/digitalocean/doctl/releases/latest/download/doctl-1.94.0-linux-amd64.tar.gz &&
          tar xf doctl-1.94.0-linux-amd64.tar.gz &&
          sudo mv doctl /usr/local/bin
        `, { stdio: 'inherit' });
      } else {
        console.log('🔗 Please install doctl manually:');
        console.log('   Linux: wget + tar method (see script)');
        console.log('   macOS: brew install doctl');
        console.log('   Windows: Download from GitHub releases');
        console.log('   📖 https://docs.digitalocean.com/reference/doctl/how-to/install/');
        return false;
      }
      
      console.log('✅ doctl CLI installed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to install doctl:', error.message);
      return false;
    }
  }

  async authenticateDoctl() {
    try {
      // Check if already authenticated
      execSync('doctl account get', { stdio: 'pipe' });
      console.log('✅ Already authenticated with DigitalOcean');
      return true;
    } catch (error) {
      console.log('🔐 Authentication required...');
      
      // Check for environment variable
      const token = process.env.DIGITALOCEAN_TOKEN;
      if (token) {
        console.log('🔑 Using DIGITALOCEAN_TOKEN environment variable');
        execSync(`doctl auth init --access-token ${token}`, { stdio: 'inherit' });
        return true;
      }
      
      console.log('🔗 Please authenticate doctl:');
      console.log('   1. Get your API token from: https://cloud.digitalocean.com/account/api/tokens');
      console.log('   2. Run: doctl auth init');
      console.log('   3. Or set DIGITALOCEAN_TOKEN environment variable');
      return false;
    }
  }

  async deployToAppPlatform() {
    console.log('🚀 Deploying to DigitalOcean App Platform...');
    
    try {
      // Create app spec file
      const appSpec = this.createAppSpec();
      const specPath = path.join(this.projectRoot, '.do-app-spec.yaml');
      
      fs.writeFileSync(specPath, appSpec);
      console.log('📝 Created app specification');
      
      // Check if app already exists
      let appExists = false;
      try {
        const apps = execSync('doctl apps list --format ID,Name --no-header', { encoding: 'utf8' });
        appExists = apps.includes(this.config.app.name);
      } catch (error) {
        console.log('📋 Checking existing apps...');
      }
      
      if (appExists) {
        console.log('🔄 Updating existing app...');
        // Get app ID
        const apps = execSync('doctl apps list --format ID,Name --no-header', { encoding: 'utf8' });
        const appLine = apps.split('\n').find(line => line.includes(this.config.app.name));
        const appId = appLine ? appLine.split(' ')[0] : null;
        
        if (appId) {
          execSync(`doctl apps update ${appId} --spec ${specPath}`, { stdio: 'inherit' });
        }
      } else {
        console.log('🆕 Creating new app...');
        execSync(`doctl apps create --spec ${specPath}`, { stdio: 'inherit' });
      }
      
      console.log('✅ App Platform deployment initiated');
      console.log('🔗 Check status at: https://cloud.digitalocean.com/apps');
      
      // Clean up spec file
      fs.unlinkSync(specPath);
      
    } catch (error) {
      console.error('❌ App Platform deployment failed:', error.message);
      throw error;
    }
  }

  createAppSpec() {
    return `name: ${this.config.app.name}
region: ${this.config.app.region}
services:
- name: web
  source_dir: /
  github:
    repo: endersclarity/personal-portfolio
    branch: main
  run_command: "python3 -m http.server 8080"
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production
static_sites:
- name: portfolio-static
  source_dir: /
  github:
    repo: endersclarity/personal-portfolio
    branch: main
  output_dir: /
  index_document: index.html
  error_document: index.html
  routes:
  - path: /
`;
  }

  async deployToDroplet() {
    console.log('🖥️  Deploying to DigitalOcean Droplet...');
    
    try {
      // Check if droplet exists
      let dropletExists = false;
      let dropletIP = null;
      
      try {
        const droplets = execSync('doctl compute droplet list --format ID,Name,PublicIPv4 --no-header', { encoding: 'utf8' });
        const dropletLine = droplets.split('\n').find(line => line.includes(this.config.droplet.name));
        
        if (dropletLine) {
          dropletExists = true;
          dropletIP = dropletLine.split(/\s+/)[2];
          console.log(`✅ Found existing droplet: ${dropletIP}`);
        }
      } catch (error) {
        console.log('📋 Checking existing droplets...');
      }
      
      if (!dropletExists) {
        console.log('🆕 Creating new droplet...');
        const createResult = execSync(`doctl compute droplet create ${this.config.droplet.name} \\
          --region ${this.config.droplet.region} \\
          --size ${this.config.droplet.size} \\
          --image ${this.config.droplet.image} \\
          --format ID,Name,PublicIPv4 --no-header`, { encoding: 'utf8' });
        
        console.log('⏳ Waiting for droplet to be ready...');
        await this.waitForDroplet(this.config.droplet.name);
        
        // Get the IP
        const droplets = execSync('doctl compute droplet list --format ID,Name,PublicIPv4 --no-header', { encoding: 'utf8' });
        const dropletLine = droplets.split('\n').find(line => line.includes(this.config.droplet.name));
        dropletIP = dropletLine ? dropletLine.split(/\s+/)[2] : null;
      }
      
      if (dropletIP) {
        console.log(`🌐 Droplet ready at: ${dropletIP}`);
        console.log('📋 Next steps:');
        console.log(`   1. SSH to droplet: ssh root@${dropletIP}`);
        console.log('   2. Install web server (nginx/apache)');
        console.log('   3. Clone repository and set up hosting');
        console.log('   4. Configure domain/DNS if needed');
      }
      
    } catch (error) {
      console.error('❌ Droplet deployment failed:', error.message);
      throw error;
    }
  }

  async waitForDroplet(name, maxWaitTime = 300000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const result = execSync(`doctl compute droplet get ${name} --format Status --no-header`, { encoding: 'utf8' });
        if (result.trim() === 'active') {
          console.log('✅ Droplet is active');
          return true;
        }
        console.log('⏳ Waiting for droplet to become active...');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      } catch (error) {
        console.log('⏳ Still creating droplet...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    throw new Error('Timeout waiting for droplet to become active');
  }

  async deploy(method = 'app-platform') {
    console.log('🌊 DigitalOcean Deployment Starting...');
    
    if (!this.doctl) {
      console.error('❌ doctl CLI is required for DigitalOcean deployment');
      return false;
    }
    
    const authenticated = await this.authenticateDoctl();
    if (!authenticated) {
      console.error('❌ DigitalOcean authentication required');
      return false;
    }
    
    try {
      switch (method) {
        case 'app-platform':
        case 'app':
          await this.deployToAppPlatform();
          break;
        case 'droplet':
          await this.deployToDroplet();
          break;
        default:
          console.log('📋 Available deployment methods:');
          console.log('   app-platform: Managed app hosting (recommended)');
          console.log('   droplet: Virtual private server');
          break;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      return false;
    }
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const method = args[0] || 'app-platform';
  
  const deployer = new DigitalOceanDeployer();
  const success = await deployer.deploy(method);
  
  if (success) {
    console.log('🎉 DigitalOcean deployment completed successfully!');
  } else {
    console.error('💥 Deployment failed');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DigitalOceanDeployer;