import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import RichTextEditor from "../src/components/textEditor";
import "../src/index.css";

// Development Test App
function DevApp() {
  const [mode, setMode] = React.useState<"standalone" | "integrated">(
    "standalone"
  );
  const [defaultContent, setDefaultContent] = React.useState("");

  const testContent = `# Welcome to Kel RTE Dev Environment

This is a **development environment** for testing the rich text editor.

## Features to Test:
- **Bold** and *italic* text
- <u>Underline</u> formatting
- Font size and family switching
- Color picker
- File uploads (drag & drop)
- Whiteboard drawing
- Markdown import/export

Try uploading a file or opening the whiteboard! 🎨`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Dev Controls */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Kel RTE - Development Environment
          </h1>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setMode("standalone")}
                className={`px-3 py-1 rounded ${
                  mode === "standalone"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                }`}
              >
                Standalone Mode
              </button>
              <button
                onClick={() => setMode("integrated")}
                className={`px-3 py-1 rounded ${
                  mode === "integrated"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                }`}
              >
                Integrated Mode
              </button>
            </div>

            <button
              onClick={() => setDefaultContent(testContent)}
              className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
            >
              Load Test Content
            </button>

            <button
              onClick={() => setDefaultContent("")}
              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Clear Content
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Mode:</strong>{" "}
              {mode === "standalone"
                ? "Standalone (with theme switch)"
                : "Integrated (no theme switch)"}
            </p>
            <p>
              <strong>Test Features:</strong> Try file uploads, whiteboard,
              markdown export, font switching, and all formatting options.
            </p>
          </div>
        </div>

        {/* Editor Container */}
        <div
          className={
            mode === "integrated"
              ? "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              : ""
          }
        >
          <RichTextEditor
            themeSwitch={mode === "standalone"}
            defaultValue={defaultContent}
          />
        </div>

        {/* Feature Test Guide */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Testing Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Text Formatting
              </h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Try Bold, Italic, Underline buttons</li>
                <li>• Test font size selector (including custom)</li>
                <li>• Switch between different fonts</li>
                <li>• Use color picker for text</li>
                <li>• Test undo/redo functionality</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Advanced Features
              </h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Drag & drop files into editor</li>
                <li>• Click upload button for files</li>
                <li>• Open whiteboard and draw</li>
                <li>• Export content as markdown</li>
                <li>• Import markdown files</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap with theme provider
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DevApp />
    </ThemeProvider>
  );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
