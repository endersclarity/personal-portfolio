#!/usr/bin/env node

/**
 * Security Audit Script
 * Automated security testing and vulnerability assessment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityAuditor {
  constructor() {
    this.projectRoot = process.cwd();
    this.auditResults = {
      timestamp: new Date().toISOString(),
      score: 0,
      maxScore: 100,
      categories: {},
      vulnerabilities: [],
      recommendations: []
    };
  }

  async runFullAudit() {
    console.log('🔒 Starting comprehensive security audit...');
    
    try {
      await this.auditHeaders();
      await this.auditCSP();
      await this.auditHTTPS();
      await this.auditDependencies();
      await this.auditFilePermissions();
      await this.auditContentSecurity();
      await this.auditPrivacyCompliance();
      
      this.calculateFinalScore();
      this.generateReport();
      
      console.log(`✅ Security audit completed! Score: ${this.auditResults.score}/${this.auditResults.maxScore}`);
      
    } catch (error) {
      console.error('❌ Security audit failed:', error.message);
      process.exit(1);
    }
  }

  async auditHeaders() {
    console.log('🛡️  Auditing security headers...');
    
    const requiredHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Referrer-Policy',
      'Permissions-Policy'
    ];
    
    const results = {
      score: 0,
      maxScore: 25,
      findings: [],
      implemented: []
    };
    
    // Check HTML meta tags
    const indexPath = path.join(this.projectRoot, 'index.html');
    if (fs.existsSync(indexPath)) {
      const htmlContent = fs.readFileSync(indexPath, 'utf-8');
      
      requiredHeaders.forEach(header => {
        const headerPattern = new RegExp(`http-equiv="${header}"`, 'i');
        if (headerPattern.test(htmlContent)) {
          results.implemented.push(header);
          results.score += Math.floor(results.maxScore / requiredHeaders.length);
        } else {
          results.findings.push(`Missing security header: ${header}`);
        }
      });
    }
    
    // Check Netlify configuration
    const netlifyPath = path.join(this.projectRoot, 'netlify.toml');
    if (fs.existsSync(netlifyPath)) {
      const netlifyContent = fs.readFileSync(netlifyPath, 'utf-8');
      
      if (netlifyContent.includes('Strict-Transport-Security')) {
        results.implemented.push('HSTS');
        results.score += 5;
      } else {
        results.findings.push('HSTS not configured in Netlify');
      }
    }
    
    this.auditResults.categories.headers = results;
    console.log(`  ✅ Headers audit: ${results.implemented.length}/${requiredHeaders.length} implemented`);
  }

  async auditCSP() {
    console.log('🚫 Auditing Content Security Policy...');
    
    const results = {
      score: 0,
      maxScore: 20,
      findings: [],
      directives: []
    };
    
    const indexPath = path.join(this.projectRoot, 'index.html');
    if (fs.existsSync(indexPath)) {
      const htmlContent = fs.readFileSync(indexPath, 'utf-8');
      const cspMatch = htmlContent.match(/Content-Security-Policy.*?content="([^"]+)"/i);
      
      if (cspMatch) {
        const cspPolicy = cspMatch[1];
        const directives = cspPolicy.split(';').map(d => d.trim());
        
        // Check for important directives
        const importantDirectives = [
          'default-src',
          'script-src',
          'style-src',
          'img-src',
          'connect-src',
          'form-action',
          'frame-ancestors',
          'object-src'
        ];
        
        importantDirectives.forEach(directive => {
          const hasDirective = directives.some(d => d.startsWith(directive));
          if (hasDirective) {
            results.directives.push(directive);
            results.score += Math.floor(results.maxScore / importantDirectives.length);
          } else {
            results.findings.push(`Missing CSP directive: ${directive}`);
          }
        });
        
        // Check for unsafe practices
        if (cspPolicy.includes("'unsafe-eval'")) {
          results.findings.push("CSP allows 'unsafe-eval' - security risk");
        }
        
        if (cspPolicy.includes("'unsafe-inline'")) {
          results.findings.push("CSP allows 'unsafe-inline' - consider using nonces");
        }
        
        if (cspPolicy.includes('*')) {
          results.findings.push("CSP uses wildcard (*) - too permissive");
        }
        
      } else {
        results.findings.push('No Content Security Policy found');
      }
    }
    
    this.auditResults.categories.csp = results;
    console.log(`  ✅ CSP audit: ${results.directives.length}/8 directives implemented`);
  }

  async auditHTTPS() {
    console.log('🔐 Auditing HTTPS configuration...');
    
    const results = {
      score: 0,
      maxScore: 15,
      findings: [],
      checks: []
    };
    
    // Check for HTTPS enforcement
    const netlifyPath = path.join(this.projectRoot, 'netlify.toml');
    if (fs.existsSync(netlifyPath)) {
      const netlifyContent = fs.readFileSync(netlifyPath, 'utf-8');
      
      if (netlifyContent.includes('upgrade-insecure-requests')) {
        results.checks.push('HTTPS upgrade enforced');
        results.score += 5;
      }
      
      if (netlifyContent.includes('Strict-Transport-Security')) {
        results.checks.push('HSTS enabled');
        results.score += 10;
        
        if (netlifyContent.includes('preload')) {
          results.checks.push('HSTS preload enabled');
        } else {
          results.findings.push('HSTS preload not enabled');
        }
      } else {
        results.findings.push('HSTS not configured');
      }
    }
    
    // Check .htaccess for Apache
    const htaccessPath = path.join(this.projectRoot, '.htaccess');
    if (fs.existsSync(htaccessPath)) {
      const htaccessContent = fs.readFileSync(htaccessPath, 'utf-8');
      
      if (htaccessContent.includes('RewriteRule') && htaccessContent.includes('https://')) {
        results.checks.push('Apache HTTPS redirect configured');
      }
    }
    
    this.auditResults.categories.https = results;
    console.log(`  ✅ HTTPS audit: ${results.checks.length} security measures found`);
  }

  async auditDependencies() {
    console.log('📦 Auditing dependencies...');
    
    const results = {
      score: 0,
      maxScore: 15,
      findings: [],
      stats: {
        total: 0,
        vulnerabilities: 0,
        outdated: 0
      }
    };
    
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        // Run npm audit if available
        const auditOutput = execSync('npm audit --json', { 
          encoding: 'utf-8',
          cwd: this.projectRoot 
        });
        
        const auditData = JSON.parse(auditOutput);
        results.stats.vulnerabilities = auditData.metadata?.vulnerabilities?.total || 0;
        
        if (results.stats.vulnerabilities === 0) {
          results.score = results.maxScore;
          results.findings.push('No known vulnerabilities found');
        } else {
          results.findings.push(`${results.stats.vulnerabilities} vulnerabilities found`);
          results.score = Math.max(0, results.maxScore - (results.stats.vulnerabilities * 2));
        }
        
      } catch (error) {
        // npm audit might fail if no dependencies or npm not available
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        const depCount = Object.keys(packageJson.dependencies || {}).length + 
                        Object.keys(packageJson.devDependencies || {}).length;
        
        if (depCount === 0) {
          results.score = results.maxScore;
          results.findings.push('No dependencies to audit');
        } else {
          results.findings.push('Unable to run dependency audit');
          results.score = Math.floor(results.maxScore * 0.7); // Partial credit
        }
      }
    } else {
      results.score = results.maxScore;
      results.findings.push('No package.json found - static site');
    }
    
    this.auditResults.categories.dependencies = results;
    console.log(`  ✅ Dependencies audit: ${results.stats.vulnerabilities} vulnerabilities`);
  }

  async auditFilePermissions() {
    console.log('📁 Auditing file permissions...');
    
    const results = {
      score: 0,
      maxScore: 10,
      findings: [],
      checks: []
    };
    
    // Check for sensitive files
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'config.json',
      'secrets.json',
      'private.key',
      '.htpasswd'
    ];
    
    let foundSensitive = false;
    sensitiveFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        results.findings.push(`Sensitive file found: ${file}`);
        foundSensitive = true;
      }
    });
    
    if (!foundSensitive) {
      results.score += 5;
      results.checks.push('No sensitive files in repository');
    }
    
    // Check .gitignore
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      
      const shouldIgnore = ['.env', 'node_modules', '*.log', '.DS_Store'];
      let ignoreScore = 0;
      
      shouldIgnore.forEach(pattern => {
        if (gitignoreContent.includes(pattern)) {
          ignoreScore++;
        } else {
          results.findings.push(`Missing from .gitignore: ${pattern}`);
        }
      });
      
      results.score += Math.floor((ignoreScore / shouldIgnore.length) * 5);
      results.checks.push(`${ignoreScore}/${shouldIgnore.length} important patterns in .gitignore`);
    } else {
      results.findings.push('No .gitignore file found');
    }
    
    this.auditResults.categories.filePermissions = results;
    console.log(`  ✅ File permissions audit: ${results.checks.length} checks passed`);
  }

  async auditContentSecurity() {
    console.log('📝 Auditing content security...');
    
    const results = {
      score: 0,
      maxScore: 10,
      findings: [],
      checks: []
    };
    
    // Check for potential XSS vectors in HTML
    const htmlFiles = ['index.html', 'thank-you.html'];
    
    htmlFiles.forEach(filename => {
      const filePath = path.join(this.projectRoot, filename);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for dangerous patterns
        const dangerousPatterns = [
          { pattern: /document\.write\s*\(/gi, message: 'document.write() usage found' },
          { pattern: /innerHTML\s*=/gi, message: 'innerHTML assignment found - use textContent instead' },
          { pattern: /eval\s*\(/gi, message: 'eval() usage found' },
          { pattern: /javascript:/gi, message: 'javascript: protocol found' }
        ];
        
        dangerousPatterns.forEach(({ pattern, message }) => {
          if (pattern.test(content)) {
            results.findings.push(`${filename}: ${message}`);
          }
        });
      }
    });
    
    if (results.findings.length === 0) {
      results.score = results.maxScore;
      results.checks.push('No dangerous content patterns found');
    } else {
      results.score = Math.max(0, results.maxScore - (results.findings.length * 2));
    }
    
    this.auditResults.categories.contentSecurity = results;
    console.log(`  ✅ Content security audit: ${results.findings.length} issues found`);
  }

  async auditPrivacyCompliance() {
    console.log('🔍 Auditing privacy compliance...');
    
    const results = {
      score: 0,
      maxScore: 5,
      findings: [],
      checks: []
    };
    
    // Check for privacy-related configurations
    const indexPath = path.join(this.projectRoot, 'index.html');
    if (fs.existsSync(indexPath)) {
      const htmlContent = fs.readFileSync(indexPath, 'utf-8');
      
      // Check for Google Analytics without consent
      if (htmlContent.includes('google-analytics') || htmlContent.includes('gtag')) {
        results.findings.push('Analytics tracking detected - ensure GDPR compliance');
      }
      
      // Check for cookie usage
      if (htmlContent.includes('cookie') || htmlContent.includes('localStorage')) {
        results.findings.push('Browser storage usage - may need cookie notice');
      }
      
      // Check for Permissions Policy (disables tracking)
      if (htmlContent.includes('interest-cohort=()')) {
        results.checks.push('FLoC disabled via Permissions Policy');
        results.score += 3;
      }
      
      // Check for privacy-friendly defaults
      if (htmlContent.includes('data:') && !htmlContent.includes('http://')) {
        results.checks.push('Using data URLs instead of external resources');
        results.score += 2;
      }
    }
    
    this.auditResults.categories.privacy = results;
    console.log(`  ✅ Privacy audit: ${results.checks.length} privacy measures found`);
  }

  calculateFinalScore() {
    let totalScore = 0;
    let totalMaxScore = 0;
    
    Object.values(this.auditResults.categories).forEach(category => {
      totalScore += category.score;
      totalMaxScore += category.maxScore;
    });
    
    this.auditResults.score = totalScore;
    this.auditResults.maxScore = totalMaxScore;
    
    // Generate overall recommendations
    if (totalScore < totalMaxScore * 0.7) {
      this.auditResults.recommendations.push('Security score below 70% - immediate attention required');
    }
    
    if (totalScore >= totalMaxScore * 0.9) {
      this.auditResults.recommendations.push('Excellent security posture - maintain current practices');
    }
    
    // Collect all findings as vulnerabilities
    Object.values(this.auditResults.categories).forEach(category => {
      this.auditResults.vulnerabilities.push(...category.findings);
    });
  }

  generateReport() {
    console.log('📊 Generating security audit report...');
    
    // Generate JSON report
    const jsonReport = path.join(this.projectRoot, 'security-audit-results.json');
    fs.writeFileSync(jsonReport, JSON.stringify(this.auditResults, null, 2));
    
    // Generate HTML report
    this.generateHTMLReport();
    
    // Generate markdown report
    this.generateMarkdownReport();
    
    console.log('📋 Security reports generated:');
    console.log(`  - JSON: ${jsonReport}`);
    console.log(`  - HTML: security-audit-report.html`);
    console.log(`  - Markdown: SECURITY-AUDIT.md`);
  }

  generateHTMLReport() {
    const scorePercent = Math.round((this.auditResults.score / this.auditResults.maxScore) * 100);
    const scoreColor = scorePercent >= 90 ? '#28a745' : scorePercent >= 70 ? '#ffc107' : '#dc3545';
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .score { font-size: 48px; font-weight: bold; color: ${scoreColor}; }
        .category { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; }
        .category-header { background: #f8f9fa; padding: 15px; border-radius: 8px 8px 0 0; }
        .category-content { padding: 20px; }
        .finding { background: #f8d7da; padding: 10px; border-radius: 4px; margin: 5px 0; }
        .check { background: #d4edda; padding: 10px; border-radius: 4px; margin: 5px 0; }
        .recommendation { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Security Audit Report</h1>
        <div class="score">${scorePercent}%</div>
        <p>Score: ${this.auditResults.score}/${this.auditResults.maxScore}</p>
        <p>Generated: ${new Date(this.auditResults.timestamp).toLocaleString()}</p>
    </div>
    
    ${Object.entries(this.auditResults.categories).map(([name, category]) => `
        <div class="category">
            <div class="category-header">
                <h3>${name.charAt(0).toUpperCase() + name.slice(1)} 
                    (${category.score}/${category.maxScore})</h3>
            </div>
            <div class="category-content">
                ${category.checks?.map(check => `<div class="check">✅ ${check}</div>`).join('') || ''}
                ${category.findings?.map(finding => `<div class="finding">⚠️ ${finding}</div>`).join('') || ''}
            </div>
        </div>
    `).join('')}
    
    ${this.auditResults.recommendations.length > 0 ? `
        <h2>Recommendations</h2>
        ${this.auditResults.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
    ` : ''}
</body>
</html>`;
    
    fs.writeFileSync('security-audit-report.html', html);
  }

  generateMarkdownReport() {
    const scorePercent = Math.round((this.auditResults.score / this.auditResults.maxScore) * 100);
    
    let markdown = `# Security Audit Report

## Overall Score: ${scorePercent}% (${this.auditResults.score}/${this.auditResults.maxScore})

Generated: ${new Date(this.auditResults.timestamp).toLocaleString()}

## Category Breakdown

`;

    Object.entries(this.auditResults.categories).forEach(([name, category]) => {
      const categoryPercent = Math.round((category.score / category.maxScore) * 100);
      markdown += `### ${name.charAt(0).toUpperCase() + name.slice(1)} - ${categoryPercent}% (${category.score}/${category.maxScore})

`;
      
      if (category.checks && category.checks.length > 0) {
        markdown += `**Passed Checks:**\n`;
        category.checks.forEach(check => {
          markdown += `- ✅ ${check}\n`;
        });
        markdown += '\n';
      }
      
      if (category.findings && category.findings.length > 0) {
        markdown += `**Issues Found:**\n`;
        category.findings.forEach(finding => {
          markdown += `- ⚠️ ${finding}\n`;
        });
        markdown += '\n';
      }
    });

    if (this.auditResults.recommendations.length > 0) {
      markdown += `## Recommendations

`;
      this.auditResults.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }

    fs.writeFileSync('SECURITY-AUDIT.md', markdown);
  }
}

// CLI interface
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runFullAudit().catch(console.error);
}

module.exports = SecurityAuditor;