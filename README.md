# Kel RTE - Enhanced Rich Text Editor

> **🎉 Major Update**: All GitHub issues have been implemented! This release includes comprehensive feature enhancements with markdown support, file uploads, whiteboard functionality, font switching, and underline formatting.

## ✨ Features

### 🎨 **Rich Text Formatting**

- **Bold**, _Italic_, and <u>Underline</u> support
- Font size adjustment with custom size input
- Font family switching (20+ built-in fonts)
- Text color picker
- Undo/Redo functionality

### 📝 **Markdown Support**

- Import markdown files directly
- Export content as markdown (copy to clipboard)
- Support for headers, emphasis, code, and more
- Real-time markdown syntax conversion

### 📁 **File Upload System**

- Drag & drop file upload
- Click-to-upload button
- Image embedding with preview
- File attachments for documents
- Multi-file support
- **🆕 Server-side upload support** with cloud storage integration
- **🆕 Environment variable configuration** for easy deployment
- **🆕 Multiple cloud provider support** (AWS, GCP, Azure, Cloudinary)
- **🆕 Upload progress tracking** and error handling
- **🆕 Automatic fallback** to base64 if server upload fails

### 🎨 **Excalidraw Whiteboard Integration**

- Professional diagramming and sketching tools
- Complete Excalidraw interface with shapes, text, and arrows
- Vector-based drawings with hand-drawn aesthetic
- SVG export and high-quality PNG embedding
- Perfect for flowcharts, wireframes, and visual diagrams
- Theme-synced (light/dark) with your app
- Responsive, isolated modal to prevent CSS collisions

### 🌙 **Theme Support**

- Built-in dark/light mode
- Automatic theme detection
- High contrast accessibility
- Consistent styling across all features
- Editor content and Excalidraw auto-sync with theme

---

## 🚀 Getting Started

### Installation

```bash
npm install @kel-app/rte
```

### Requirements

- React 18+ (React 19 recommended)
- Tailwind CSS 4.1+
- Next.js (more frameworks coming soon)

### Basic Setup

**App Router (Next.js 13+)**:

```tsx
"use client";
import { RTE } from "@kel-app/rte";
import "@kel-app/rte/dist/index.css";

export default function MyEditor() {
  return <RTE themeSwitch={true} />;
}
```

**With Server Upload (Recommended for Production)**:

```tsx
"use client";
import { RTE, createCloudStorageConfig } from "@kel-app/rte";
import "@kel-app/rte/dist/index.css";

const uploadConfig = createCloudStorageConfig('aws', {
  uploadUrl: process.env.NEXT_PUBLIC_UPLOAD_URL,
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
});

export default function MyEditor() {
  return (
    <RTE 
      themeSwitch={true}
      enableServerUpload={true}
      uploadConfig={uploadConfig}
      onFileUploadSuccess={(url, file) => {
        console.log('File uploaded:', file.name, 'to', url);
      }}
    />
  );
}
```

**Pages Router (Next.js 12)**:

```tsx
// _app.tsx
import "@kel-app/rte/dist/index.css";

// YourComponent.tsx
("use client");
import { RTE } from "@kel-app/rte";

export default function MyEditor() {
  return <RTE themeSwitch={true} />;
}
```

---

## 🎯 Usage Examples

### Standalone Editor with Theme Switch

```tsx
"use client";
import { RTE } from "@kel-app/rte";

export default function StandaloneEditor() {
  return (
    <div className="h-screen">
      <RTE themeSwitch={true} />
    </div>
  );
}
```

### Integrated Editor (No Theme Switch)

```tsx
"use client";
import { RTE } from "@kel-app/rte";

export default function IntegratedEditor() {
  return (
    <div className="h-96 border rounded-lg">
      <RTE themeSwitch={false} />
    </div>
  );
}
```

### With Default Content

```tsx
"use client";
import { RTE } from "@kel-app/rte";

export default function EditorWithContent() {
  const defaultContent = "# Welcome\nStart typing here...";

  return <RTE themeSwitch={true} defaultValue={defaultContent} />;
}
```

---

## 🛠️ Features Overview

| Feature             | Status | Description             |
| ------------------- | ------ | ----------------------- |
| **Bold/Italic**     | ✅     | Classic text formatting |
| **Underline**       | ✅     | Underline text support  |
| **Font Switching**  | ✅     | 20+ font families       |
| **Font Sizing**     | ✅     | Preset + custom sizes   |
| **Color Picker**    | ✅     | Full color selection    |
| **Markdown Import** | ✅     | Load .md files          |
| **Markdown Export** | ✅     | Copy as markdown        |
| **File Upload**     | ✅     | Drag & drop support     |
| **Image Embedding** | ✅     | Inline image preview    |
| **Whiteboard**      | ✅     | Drawing & sketching     |
| **Undo/Redo**       | ✅     | Full history support    |
| **Dark Mode**       | ✅     | Automatic theming       |
| **Mobile Support**  | ✅     | Responsive design       |

---

## 🎨 Customization

### Font Configuration

Add custom fonts by editing `src/components/utils/fonts.ts`:

```typescript
export const availableFonts = [
  { name: "Custom Font", value: "CustomFont, sans-serif" },
  // ... existing fonts
];
```

### Theme Customization

The editor respects your existing theme setup. Use `next-themes` or any theme provider:

```tsx
import { ThemeProvider } from "next-themes";

export default function App({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}
```

---

## 📚 API Reference

### Props

| Prop           | Type      | Default      | Description              |
| -------------- | --------- | ------------ | ------------------------ |
| `themeSwitch`  | `boolean` | **Required** | Show theme toggle button |
| `defaultValue` | `string`  | `""`         | Initial editor content   |

### Events

The editor handles all interactions internally. For advanced use cases, access the ProseMirror instance directly.

---

## 🧪 Development & Testing

### Running Tests

```bash
npm test
```

### Building from Source

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

> Important: From v0.1.0-alpha.3.2, the `RTE` component requires the boolean prop `themeSwitch`. Set it explicitly (true to show the switcher; false for integrated usage that adopts the parent theme).

---

## 📖 Documentation

- **[Features Guide](FEATURES.md)** - Comprehensive feature documentation
- **[Server Upload Guide](SERVER_UPLOAD_GUIDE.md)** - Complete server upload configuration
- **[Changelog](CHANGELOG.md)** - Version history and updates
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[API Reference](#-api-reference)** - Complete API documentation

---

## 🐛 Known Issues & Limitations

### Current Limitations

- Files stored as base64 by default (server upload now available for production)
- Some mobile touch interactions could be improved
- Excalidraw advanced options (e.g., libraries, collaboration) are not yet wired into the UI

### Roadmap

- [x] ~~Server-side file upload integration~~ ✅ **Completed**
- [ ] Advanced whiteboard tools (shapes, text, layers)
- [ ] Extended markdown support (tables, footnotes)
- [ ] Plugin system for custom extensions
- [ ] Real-time collaboration features

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Share your ideas in GitHub Discussions
3. **Submit PRs**: Fork, branch, code, test, and submit pull requests
4. **Improve Docs**: Help us improve documentation and examples

### Development Setup

```bash
git clone https://github.com/Kel-app/RTE.git
cd RTE
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm test            # Run tests
```

### Manual Testing Environment

We've created a comprehensive development environment for testing all features:

1. **Start Development Server**: `npm run dev`
2. **Open Browser**: Visit `http://localhost:3000`
3. **Test All Features**: Complete testing environment with sample content

The development environment includes:

- ✅ **Live Preview**: Real-time testing of all RTE features
- ✅ **Theme Testing**: Switch between light/dark themes
- ✅ **Sample Content**: Pre-loaded content for feature testing
- ✅ **Hot Reloading**: Instant updates during development

### Unit Testing

Comprehensive test suite covering:

- ✅ **Component Rendering**: All editor components and functionality
- ✅ **Text Formatting**: Bold, italic, underline, fonts, colors
- ✅ **File Operations**: Upload, embed, and file handling
- ✅ **Markdown Support**: Import/export and conversion testing
- ✅ **Theme Integration**: Theme switching and consistency

For detailed testing information, see [TESTING.md](TESTING.md).`

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/Kel-app/RTE/issues)
- **GitHub Discussions**: [Community support and ideas](https://github.com/Kel-app/RTE/discussions)
- **Documentation**: [Full feature documentation](FEATURES.md)

---

## 🙏 Acknowledgments

- Built with [ProseMirror](https://prosemirror.net/) - Excellent rich text editing toolkit
- UI components from [Radix UI](https://radix-ui.com/) and [Lucide React](https://lucide.dev/)
- Styling powered by [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ by the Kel-app team**

⭐ Star us on GitHub if this project helped you!

```

```
