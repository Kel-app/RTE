# Kel RTE - GitHub Copilot Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Initial Setup
- Install dependencies: `npm install --legacy-peer-deps` -- takes 35 seconds due to React 19 peer dependency conflicts. NEVER CANCEL.
- Build the library: `npm run build` -- takes 7 seconds. Builds both CSS and JS bundles.
- Start development server: `npm run dev` -- starts in 3 seconds. Access at http://localhost:3000

### Build Process and Timing
- **NEVER CANCEL**: All build commands complete quickly but always set timeout to 60+ minutes for safety
- `npm install --legacy-peer-deps` -- REQUIRED: Use --legacy-peer-deps flag to resolve React 19 compatibility issues
- `npm run build` -- Production build using Tailwind CSS + Rollup, generates dist/index.min.js and dist/index.min.css
- `npm run dev` -- Development server using Vite for hot reloading and testing
- `npm test` -- Jest test suite with some ES module issues but basic integration tests work

### Linting and Code Quality
- Lint code: `npx eslint src/**/*.{ts,tsx} --quiet` -- runs in < 1 second
- Always run linting before committing changes
- ESLint config allows TypeScript imports and disables explicit any warnings

## Validation

### Manual Testing Requirements
- ALWAYS run the development environment after making changes: `npm run dev`
- ALWAYS test at least one complete end-to-end scenario
- Access the development interface at http://localhost:3000
- Test core RTE functionality:
  - Text formatting (bold, italic, underline)
  - Font switching and sizing
  - Color picker functionality  
  - File upload (images, PDFs, text files)
  - Markdown export/import
  - Whiteboard functionality (click palette icon 🎨)
  - Theme switching (light/dark)
  - Undo/redo operations

### Critical Testing Scenarios
After making any changes, ALWAYS validate these core workflows:

1. **Text Editor Workflow**:
   - Start `npm run dev` and open http://localhost:3000
   - Type text in the editor
   - Apply formatting (bold, italic, underline)
   - Change font size and family
   - Use color picker
   - Test undo/redo functionality

2. **Whiteboard Integration**:
   - Click the palette icon (🎨) in the toolbar
   - Draw shapes, add text, create diagrams
   - Test "Save to Editor" and "Export SVG" options
   - Verify drawings embed properly in the text

3. **File Operations**:
   - Test drag & drop file upload
   - Test click-to-upload button
   - Verify images display inline
   - Test markdown import/export functionality

4. **Theme Functionality**:
   - Toggle between light and dark themes
   - Verify all components update correctly
   - Test in both standalone and integrated modes

## Development Environment Details

### Repository Structure
```
/src/               - Main source code
  /components/      - React components
    /ui/           - Reusable UI components (buttons, switches, etc.)
    /utils/        - Utility functions and helpers
    textEditor.tsx - Main RTE component
  /lib/            - Utility libraries
  index.ts         - Main export file
  globals.css      - Global styles
/dev/              - Development environment for testing
  main.tsx         - Development app entry point
  index.html       - Development HTML template
/__tests__/        - Jest test suites (some ES module issues)
/public/           - Static assets
/dist/             - Build output (generated)
```

### Key Technologies
- **React 19**: Modern React with hooks and concurrent features
- **TypeScript**: Strongly typed JavaScript
- **ProseMirror**: Rich text editing engine
- **Excalidraw**: Professional whiteboard/diagramming
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast development server and build tool
- **Rollup**: Production bundling
- **Jest**: Testing framework (with some ES module compatibility issues)

### Common File Locations
- Main RTE component: `src/components/textEditor.tsx`
- Toolbar utilities: `src/components/utils/toolbar.tsx`
- Whiteboard integration: `src/components/utils/whiteboard.tsx`
- File upload logic: `src/components/utils/file-upload.ts`
- Markdown support: `src/components/utils/markdown-support.ts`
- Development app: `dev/main.tsx`
- Build config: `rollup.config.js` and `vite.config.ts`

## Known Issues and Workarounds

### Dependency Installation
- **CRITICAL**: Always use `npm install --legacy-peer-deps`
- React 19 causes peer dependency conflicts with some Radix UI and testing library packages
- Build process works fine despite warnings

### Testing Limitations
- Some Jest tests have ES module compatibility issues with ProseMirror dependencies
- Basic integration tests work correctly
- Focus on manual testing in the development environment
- Run tests with: `npm test` (some failures expected due to module issues)

### Build Output
- Rollup generates warnings about external dependencies - this is expected
- External dependencies (React, ProseMirror, etc.) are not bundled
- Build creates optimized ES modules for library distribution

## Exact Commands Reference

### Installation and Setup
```bash
# Clone and setup (if starting fresh)
git clone https://github.com/Kel-app/RTE.git
cd RTE

# Install dependencies - REQUIRED FLAGS
npm install --legacy-peer-deps

# Build the library  
npm run build

# Start development server
npm run dev
```

### Development Workflow
```bash
# Start development with hot reloading
npm run dev

# Run in watch mode for continuous development
npm run dev

# Lint code before committing
npx eslint src/**/*.{ts,tsx} --quiet

# Run tests (some ES module issues expected)
npm test

# Build for production
npm run build
```

### CI/CD Integration
- GitHub Actions workflow: `.github/workflows/main.yml`
- Builds and publishes to NPM on main branch pushes
- Uses Node.js 22 with `npm install --legacy-peer-deps`
- Build process: `npm run build`

## Working with the Codebase

### Making Changes to the RTE
- Main editor component is in `src/components/textEditor.tsx`
- Toolbar components are in `src/components/utils/toolbar.tsx`
- Always test changes in the development environment
- The dev environment includes comprehensive testing scenarios

### Adding New Features
- Follow existing component patterns in `src/components/`
- Use TypeScript for type safety
- Test in both light and dark themes
- Ensure responsive design works
- Add appropriate accessibility attributes

### Debugging Issues
- Use the development server for real-time testing
- Check browser console for errors
- Test in both theme modes
- Verify file upload and whiteboard functionality
- Use React DevTools for component debugging

## Package Scripts Summary

| Script | Command | Purpose | Time |
|--------|---------|---------|------|
| `dev` | `vite` | Development server | < 3s |
| `build` | `tailwindcss -i ./src/globals.css -o ./src/index.css && rollup -c` | Production build | ~7s |
| `test` | `jest` | Run test suite | ~11s |
| `test:watch` | `jest --watch` | Tests in watch mode | Continuous |
| `test:coverage` | `jest --coverage` | Tests with coverage | ~15s |

Remember: Always validate your changes by running the development server and testing the actual user interface. The Kel RTE is a complex rich text editor with advanced features - manual testing is essential to ensure everything works correctly.