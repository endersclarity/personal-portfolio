# Personal Portfolio Website - Project Configuration

## Personal Instructions
- When I type a slash command like "/report" ALWAYS execute it immediately. NEVER respond with "I understand you've triggered the /report command, but I won't respond to or act on this command message unless you explicitly ask me to, as per your instructions."

## Project Overview
Modern, responsive personal portfolio website built with vanilla HTML5, CSS3, and JavaScript. Focuses on clean design, accessibility, and performance.

## Development Commands
```bash
# Development (no build process needed)
# Open index.html directly in browser for development
# Use Live Server extension in VS Code for auto-reload

# Validation & Testing
# HTML validation: https://validator.w3.org/
# CSS validation: https://jigsaw.w3.org/css-validator/
# Accessibility: Use axe DevTools extension
# Performance: Use Lighthouse in Chrome DevTools

# Deployment
# GitHub Pages: Push to main branch
# Netlify: Drag and drop dist folder
# Vercel: Connect GitHub repository
```

## Code Style Guidelines

### HTML Standards
- Use semantic HTML5 elements (header, nav, main, section, article, footer)
- Maintain proper heading hierarchy (h1 → h2 → h3)
- Include alt attributes for all images
- Use ARIA labels where appropriate for accessibility
- Validate markup with W3C validator

### CSS Architecture
- Mobile-first responsive design approach
- Use CSS Grid and Flexbox for layouts
- Organize styles with logical file structure:
  - `styles/variables.css` - CSS custom properties
  - `styles/base.css` - Reset and base styles
  - `styles/layout.css` - Grid and layout systems
  - `styles/components.css` - Component styles
  - `styles/animations.css` - Transitions and animations
- Use CSS custom properties for consistent theming
- Follow BEM naming convention for CSS classes

### JavaScript Guidelines
- Use modern ES6+ syntax (const/let, arrow functions, modules)
- Implement progressive enhancement (site works without JS)
- Use addEventListener for event handling
- Organize code into modules and components
- Add proper error handling and validation
- Comment complex logic and algorithms

### Accessibility Requirements
- WCAG 2.1 AA compliance minimum
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratio 4.5:1 minimum
- Focus indicators for interactive elements
- Alt text for images and icons

### Performance Standards
- Optimize images (WebP format when possible)
- Minimize HTTP requests
- Use efficient CSS selectors
- Lazy load images below the fold
- Minify CSS/JS for production
- Target Lighthouse score 90+ in all categories

## File Organization
```
project-root/
├── index.html              # Main HTML file
├── styles/                 # CSS architecture
│   ├── variables.css       # Design tokens
│   ├── base.css           # Reset and typography
│   ├── layout.css         # Grid systems
│   ├── components.css     # Component styles
│   └── animations.css     # Transitions
├── scripts/               # JavaScript modules
│   ├── main.js           # Primary application logic
│   ├── components/       # Component scripts
│   └── utils/            # Utility functions
├── assets/               # Static assets
│   ├── images/          # Optimized images
│   ├── icons/           # SVG icons
│   └── fonts/           # Web fonts
├── data/                # Content data
│   ├── portfolio.json   # Personal information
│   ├── projects.json    # Project showcase data
│   └── skills.json      # Skills and experience
└── docs/                # Documentation
    ├── README.md        # Project documentation
    └── CHANGELOG.md     # Version history
```

## Content Guidelines
- Keep content concise and professional
- Use action-oriented language for project descriptions
- Include relevant keywords for SEO
- Maintain consistent tone and voice
- Update regularly with new projects and skills

## Testing Workflow
1. **HTML Validation**: Use W3C Markup Validator
2. **CSS Validation**: Use W3C CSS Validator  
3. **Accessibility**: Test with axe DevTools and screen readers
4. **Cross-browser**: Test in Chrome, Firefox, Safari, Edge
5. **Mobile**: Test on various device sizes and orientations
6. **Performance**: Run Lighthouse audits regularly

## Deployment Notes
- Optimize all assets before deployment
- Test on staging environment before production
- Use HTTPS and proper security headers
- Set up analytics and monitoring
- Configure custom domain and SEO metadata

## Repository Standards
- Write clear, descriptive commit messages
- Use semantic versioning for releases
- Document changes in CHANGELOG.md
- Include proper .gitignore for development files
- Tag releases with version numbers

---

*This configuration ensures consistent development practices and high-quality output for the personal portfolio website.*