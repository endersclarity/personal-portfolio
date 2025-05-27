# Personal Portfolio Website

A modern, responsive personal portfolio website built with vanilla HTML5, CSS3, and JavaScript. Showcases projects, skills, and professional experience with clean design and optimal performance.

## 🚀 Features

- **Responsive Design**: Mobile-first approach ensuring optimal experience across all devices
- **Accessibility**: WCAG 2.1 AA compliant with semantic HTML and proper ARIA labels
- **Performance Optimized**: Fast loading with optimized assets and efficient code
- **Modern Web Standards**: Built with HTML5 semantic elements and CSS Grid/Flexbox
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Interactive Components**: Smooth animations and user-friendly interface

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Tools**: Git, VS Code, Browser DevTools
- **Deployment**: GitHub Pages / Netlify / Vercel

## 📁 Project Structure

```
├── index.html              # Main HTML file
├── styles/                 # CSS architecture
│   ├── variables.css       # Design tokens and custom properties
│   ├── base.css           # Reset, typography, and base styles
│   ├── layout.css         # Grid systems and responsive layouts
│   ├── components.css     # Component-specific styling
│   └── animations.css     # Transitions and keyframe animations
├── scripts/               # JavaScript modules
│   ├── main.js           # Primary application logic
│   ├── components/       # Component scripts
│   └── utils/            # Utility functions
├── assets/               # Static assets
│   ├── images/          # Optimized images (WebP preferred)
│   ├── icons/           # SVG icons and favicons
│   └── fonts/           # Web fonts if needed
├── data/                # Content data (JSON format)
│   ├── portfolio.json   # Personal information and bio
│   ├── projects.json    # Project showcase data
│   └── skills.json      # Skills and proficiency levels
└── memory-bank/         # CRCT/HDTA project documentation
```

## 🏗 Development

### Getting Started
1. Clone the repository
2. Open `index.html` in your browser or use Live Server extension in VS Code
3. Edit content in `data/` JSON files to customize portfolio information
4. Modify styles in `styles/` directory for visual customization

### Development Workflow
- **HTML**: Use semantic elements and maintain accessibility standards
- **CSS**: Follow mobile-first responsive design with CSS Grid/Flexbox
- **JavaScript**: Implement progressive enhancement with modern ES6+ syntax
- **Testing**: Validate with W3C validators and test accessibility with axe DevTools

### Code Style
- Semantic HTML5 markup with proper heading hierarchy
- BEM naming convention for CSS classes
- CSS custom properties for consistent theming
- Modern JavaScript with const/let, arrow functions, and modules
- Comprehensive commenting for complex logic

## 🧪 Testing & Validation

- **HTML Validation**: [W3C Markup Validator](https://validator.w3.org/)
- **CSS Validation**: [W3C CSS Validator](https://jigsaw.w3.org/css-validator/)
- **Accessibility**: axe DevTools browser extension
- **Performance**: Lighthouse audits (target 90+ score)
- **Cross-browser**: Chrome, Firefox, Safari, Edge testing

## 📱 Responsive Design

Built with mobile-first approach using:
- CSS Grid for complex layouts
- Flexbox for component alignment
- CSS custom properties for consistent design tokens
- Optimized images and efficient loading strategies

## ♿ Accessibility Features

- WCAG 2.1 AA compliance
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for all images
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratio 4.5:1 minimum

## 🚀 Deployment

### GitHub Pages
1. Push code to `main` branch
2. Enable GitHub Pages in repository settings
3. Site will be available at `https://username.github.io/repository-name`

### Netlify
1. Connect GitHub repository
2. Set build command: (none needed for static site)
3. Set publish directory: `/` (root)
4. Deploy automatically on git push

### Vercel
1. Import GitHub repository
2. Configure as static site
3. Deploy with zero configuration

## 📝 Content Management

Portfolio content is managed through JSON files in the `data/` directory:

- **portfolio.json**: Personal information, bio, contact details
- **projects.json**: Project showcase with descriptions, technologies, links
- **skills.json**: Technical skills organized by category with proficiency levels

Simply edit these JSON files to update portfolio content without touching the code.

## 🔧 Customization

### Design Tokens
Modify `styles/variables.css` to customize:
- Color palette
- Typography scale
- Spacing system
- Animation timing

### Layout
Edit `styles/layout.css` for:
- Grid systems
- Component positioning
- Responsive breakpoints

### Components
Customize individual components in `styles/components.css` and corresponding JavaScript files.

## 📊 Performance

- Optimized images (WebP format when possible)
- Minified CSS and JavaScript for production
- Efficient CSS selectors and minimal HTTP requests
- Lazy loading for below-the-fold content
- Lighthouse performance score target: 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the code style guidelines
4. Test thoroughly across browsers and devices
5. Submit a pull request with detailed description

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by Kaelen Jennings**