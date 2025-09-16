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
  const [serverUploadEnabled, setServerUploadEnabled] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});

  // Mock server upload configuration for development
  const mockUploadConfig = {
    uploadUrl: "https://httpbin.org/post", // Mock endpoint for testing
    apiKey: "dev-test-key",
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/*", "application/pdf", "text/*"],
    enableProgress: true,
  };

  const handleUploadProgress = React.useCallback((progress: any) => {
    // In a real app, you'd track progress per file
    setUploadProgress(prev => ({
      ...prev,
      latest: progress.progress
    }));
  }, []);

  const handleUploadSuccess = React.useCallback((url: string, file: File) => {
    console.log("✅ File uploaded successfully:", file.name, "to", url);
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress.latest;
      return newProgress;
    });
  }, []);

  const handleUploadError = React.useCallback((error: Error, file: File) => {
    console.error("❌ Upload failed:", file.name, error.message);
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress.latest;
      return newProgress;
    });
  }, []);

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

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={serverUploadEnabled}
                  onChange={(e) => setServerUploadEnabled(e.target.checked)}
                  className="rounded"
                />
                Server Upload (Mock)
              </label>
            </div>
          </div>

          {uploadProgress.latest && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                Upload Progress: {uploadProgress.latest}%
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.latest}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Mode:</strong>{" "}
              {mode === "standalone"
                ? "Standalone (with theme switch)"
                : "Integrated (no theme switch)"}
            </p>
            <p>
              <strong>Server Upload:</strong>{" "}
              {serverUploadEnabled 
                ? "Enabled (using mock endpoint)" 
                : "Disabled (using base64)"}
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
            enableServerUpload={serverUploadEnabled}
            uploadConfig={serverUploadEnabled ? mockUploadConfig : undefined}
            onFileUploadProgress={handleUploadProgress}
            onFileUploadSuccess={handleUploadSuccess}
            onFileUploadError={handleUploadError}
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
                <li>• Toggle server upload to test both modes</li>
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
