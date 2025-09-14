# Kel RTE - Enhanced Features Documentation

This document outlines all the new features implemented in the Kel Rich Text Editor library.

## 🎯 Implemented Features

### ✅ Issue #19: Underline Support

**Status**: ✅ Complete  
**Description**: Added underline text formatting with proper ProseMirror mark support.

**Features**:

- Underline toggle button in toolbar
- Keyboard shortcut support (Ctrl+U)
- Proper mark serialization for export/import
- Cross-browser compatibility

**Usage**:

- Click the underline button (U) in the toolbar
- Use keyboard shortcut Ctrl+U
- Works with markdown export/import

---

### ✅ Issue #6: Font Switching

**Status**: ✅ Complete  
**Description**: Comprehensive font family selection with support for web-safe fonts and custom fonts.

**Features**:

- 20+ built-in font options including system fonts and web fonts
- Support for custom fonts from the `/public` directory
- Font preview in dropdown
- Proper font fallbacks for better compatibility

**Available Fonts**:

- System fonts: Arial, Helvetica, Times New Roman, etc.
- Web fonts: Assistant, Cascadia Code, Comic Shanns, Excalifont, etc.
- Custom fonts can be easily added to `src/components/utils/fonts.ts`

**Usage**:

- Use the font dropdown in the toolbar
- Fonts are applied to selected text or current typing position
- Fonts persist through markdown export/import

---

### ✅ Issue #7: Markdown Support

**Status**: ✅ Complete  
**Description**: Full markdown import/export functionality with live conversion.

**Features**:

- **Export**: Convert rich text to markdown format
- **Import**: Load markdown files into the editor
- **Live conversion**: Real-time markdown syntax support
- **Format support**: Headers, bold, italic, underline, code, links

**Supported Markdown Elements**:

- Headers: `# ## ###`
- Bold: `**text**` or `__text__`
- Italic: `*text*` or `_text_`
- Code: `` `code` ``
- Underline: `<u>text</u>` (HTML extension)

**Usage**:

- Export: Click the document icon (📄) to copy markdown to clipboard
- Import: Click the import button to load markdown files
- Auto-conversion happens as you type markdown syntax

---

### ✅ Issue #9: File Upload Support

**Status**: ✅ Complete  
**Description**: Comprehensive file upload system with drag-and-drop support.

**Features**:

- **Drag & Drop**: Drag files directly into the editor
- **Click Upload**: Use the upload button to select files
- **Image Support**: Images are embedded inline with preview
- **File Attachments**: Non-image files become downloadable attachments
- **Multiple Files**: Upload multiple files at once

**Supported File Types**:

- Images: JPG, PNG, GIF, WebP, SVG
- Documents: PDF, DOC, DOCX, TXT, MD
- Archives: ZIP, RAR, 7Z
- And more...

**Usage**:

- Drag files into the editor area
- Click the upload button (📤) to select files
- Images appear inline, other files as download links

---

### ✅ Issue #8: Whiteboard Support

**Status**: ✅ Complete  
**Description**: Integrated drawing/whiteboard functionality for sketches and diagrams.

**Features**:

- **Drawing Tools**: Pen, eraser, different brush sizes
- **Colors**: Full color picker for drawing
- **Canvas Size**: Configurable drawing area
- **Save as Image**: Drawings saved as PNG images in the editor
- **Undo/Clear**: Drawing history management

**Tools Available**:

- Pen tool with adjustable width (1-20px)
- Color picker for stroke colors
- Eraser tool
- Undo last stroke
- Clear entire canvas

**Usage**:

- Click the palette button (🎨) to open whiteboard
- Draw using mouse or touch
- Save to insert drawing into document
- Cancel to discard changes

---

## 🛠️ Technical Implementation

### Architecture Overview

The enhanced RTE follows a modular architecture:

```
src/components/
├── textEditor.tsx          # Main editor component
├── utils/
│   ├── text-style.ts       # ProseMirror mark definitions
│   ├── fonts.ts           # Font configuration
│   ├── markdown-support.ts # Markdown import/export
│   ├── file-upload.ts     # File handling
│   ├── whiteboard.tsx     # Drawing component
│   ├── toolbar.tsx        # Unified toolbar
│   └── rte-enhancements.css # Additional styles
└── ui/                    # Reusable UI components
```

### Key Technologies Used

- **ProseMirror**: Core rich text editing
- **React 18+**: Component architecture
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **HTML5 Canvas**: Whiteboard functionality
- **File API**: File upload handling

### Performance Optimizations

- Lazy loading of heavy components
- Efficient file handling with chunked uploads
- Optimized canvas rendering for smooth drawing
- Minimal bundle size impact

---

## 🎨 Styling and Theming

### Dark Mode Support

All new features support both light and dark themes:

- Automatic theme detection
- Consistent styling across components
- High contrast for accessibility

### Responsive Design

The toolbar automatically adapts to different screen sizes:

- Mobile-friendly layout
- Touch-optimized controls
- Collapsible sections on small screens

### Customization

Easy to customize via CSS variables and Tailwind classes:

```css
/* Custom toolbar styling */
.rte-toolbar {
  --toolbar-bg: your-color;
  --toolbar-border: your-border;
}
```

---

## 🔧 Configuration Options

### Font Configuration

Add custom fonts in `src/components/utils/fonts.ts`:

```typescript
export const availableFonts = [
  // Add your custom font
  { name: "My Font", value: "MyFont, sans-serif" },
];
```

### File Upload Limits

Configure in `src/components/utils/file-upload.ts`:

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/*", "application/pdf"];
```

### Whiteboard Settings

Customize in `src/components/utils/whiteboard.tsx`:

```typescript
const DEFAULT_CANVAS_SIZE = { width: 800, height: 600 };
const DEFAULT_STROKE_WIDTH = 2;
```

---

## 🧪 Testing

### Feature Testing

Each feature includes comprehensive testing:

- Unit tests for utility functions
- Integration tests for editor functionality
- E2E tests for user workflows

### Test Files

```
__tests__/
├── text-formatting.test.ts   # Bold, italic, underline
├── file-upload.test.ts      # File upload functionality
├── markdown-support.test.ts  # Markdown import/export
└── theme-switching.test.ts   # Theme compatibility
```

---

## 🚀 Usage Examples

### Basic Implementation

```tsx
import { RTE } from "@kel-app/rte";

function MyApp() {
  return (
    <div>
      <RTE themeSwitch={true} />
    </div>
  );
}
```

### Advanced Implementation with Callbacks

```tsx
import { RTE } from "@kel-app/rte";

function AdvancedApp() {
  const handleFileUpload = (file) => {
    console.log("File uploaded:", file.name);
  };

  const handleMarkdownExport = (markdown) => {
    console.log("Exported markdown:", markdown);
  };

  return (
    <RTE
      themeSwitch={false}
      onFileUpload={handleFileUpload}
      onMarkdownExport={handleMarkdownExport}
    />
  );
}
```

---

## 🐛 Known Issues and Limitations

### Current Limitations

1. **File Storage**: Files are stored as data URLs (base64) - consider server upload for production
2. **Whiteboard**: Limited to basic drawing tools - advanced features like shapes/text planned
3. **Markdown**: Complex markdown features (tables, footnotes) not yet supported
4. **Mobile**: Some touch interactions on whiteboard could be improved

### Planned Improvements

- Server-side file upload integration
- Advanced whiteboard tools (shapes, text, layers)
- Extended markdown support (tables, footnotes, math)
- Better mobile touch support
- Plugin system for custom extensions

---

## 🤝 Contributing

### Adding New Features

1. Create utility functions in `src/components/utils/`
2. Add UI components as needed
3. Update the main `textEditor.tsx`
4. Add to the unified `Toolbar` component
5. Write tests and documentation

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Write comprehensive JSDoc comments
- Ensure accessibility compliance

---

## 📄 License

This project is licensed under the GPL-3.0 License - see the LICENSE file for details.

---

## 🆘 Support

For issues, feature requests, or questions:

- GitHub Issues: [https://github.com/Kel-app/RTE/issues](https://github.com/Kel-app/RTE/issues)
- Documentation: [https://github.com/Kel-app/RTE/blob/main/README.md](https://github.com/Kel-app/RTE/blob/main/README.md)

---

**Last Updated**: September 13, 2025  
**Version**: 1.0.0-enhanced  
**Maintainer**: Kel-app Team
