import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { EditorView } from "prosemirror-view";
import {
  Excalidraw,
  exportToCanvas,
  exportToSvg,
} from "@excalidraw/excalidraw";
// Critical: include Excalidraw's own styles to ensure proper layout/visibility
import "@excalidraw/excalidraw/index.css";
import "./excalidraw-whiteboard.css";

// Define types locally since the exact import path may vary
type ExcalidrawElement = any;
type AppState = any;
type ExcalidrawImperativeAPI = any;

interface WhiteboardSaveData {
  imageData: string;
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  files: any;
}

export type { WhiteboardSaveData };

interface WhiteboardProps {
  onSave?: (saveData: WhiteboardSaveData) => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
  initialData?: readonly ExcalidrawElement[];
  initialAppState?: AppState;
  initialFiles?: any;
  themeMode?: "light" | "dark";
}

export default function Whiteboard({
  onSave,
  onCancel,
  width = 800,
  height = 600,
  initialData = [],
  initialAppState,
  initialFiles,
  themeMode = "light",
}: WhiteboardProps) {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [elements, setElements] =
    useState<readonly ExcalidrawElement[]>(initialData);
  const [appState, setAppState] = useState<AppState | null>(initialAppState || null);
  const [files, setFiles] = useState<any>(initialFiles || null);

  const handleSave = useCallback(async () => {
    if (!excalidrawAPI) return;

    try {
      // Get current elements and app state
      const currentElements = excalidrawAPI.getSceneElements();
      const currentAppState = excalidrawAPI.getAppState();
      const currentFiles = excalidrawAPI.getFiles();

      if (currentElements.length === 0) {
        alert("Please draw something before saving!");
        return;
      }

      // Export to canvas for embedding in the editor
      const canvas = await exportToCanvas({
        elements: currentElements,
        appState: {
          ...currentAppState,
          exportBackground: true,
          exportWithDarkMode: false,
        },
        files: currentFiles,
        getDimensions: () => ({ width, height }),
      });

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL("image/png");

      // Clean the appState for storage (remove problematic properties)
      const cleanAppState = { ...currentAppState };
      delete cleanAppState.collaborators;
      delete cleanAppState.isLoading;
      delete cleanAppState.errorMessage;

      // Return all data needed for future editing
      onSave?.({
        imageData,
        elements: currentElements,
        appState: cleanAppState,
        files: currentFiles,
      });
    } catch (error) {
      console.error("Error saving whiteboard:", error);
      alert("Failed to save whiteboard. Please try again.");
    }
  }, [excalidrawAPI, onSave, width, height]);

  const handleExportSVG = useCallback(async () => {
    if (!excalidrawAPI) return;

    try {
      const currentElements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();

      const svg = await exportToSvg({
        elements: currentElements,
        appState,
        files: excalidrawAPI.getFiles(),
      });

      // Create a download link for the SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "whiteboard.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting SVG:", error);
    }
  }, [excalidrawAPI]);

  const handleClear = useCallback(() => {
    if (!excalidrawAPI) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear the whiteboard?"
    );
    if (confirmed) {
      excalidrawAPI.updateScene({ elements: [] });
    }
  }, [excalidrawAPI]);

  return (
    <div className="excalidraw-whiteboard-modal">
      <div
        className="excalidraw-whiteboard-container"
        style={{
          width: `min(90vw, ${width + 80}px)`,
          height: `min(90vh, ${height + 120}px)`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Excalidraw Whiteboard
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
              title="Clear whiteboard"
            >
              Clear
            </button>
            <button
              onClick={handleExportSVG}
              className="px-3 py-1 rounded bg-purple-500 hover:bg-purple-600 text-white text-sm"
              title="Export as SVG"
            >
              Export SVG
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              Save to Editor
            </button>
          </div>
        </div>

        {/* Excalidraw Container */}
        <div className="excalidraw-whiteboard-canvas">
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={{
              elements: elements,
              appState: {
                ...{
                  gridSize: null,
                  viewBackgroundColor: "#ffffff",
                  theme: themeMode,
                  collaborators: new Map(),
                },
                ...(appState || {}),
                // Always ensure these critical properties
                theme: themeMode,
              },
              files: files || {},
            }}
            onChange={(elements, appState) => {
              setElements(elements);
              setAppState(appState);
            }}
            theme={themeMode}
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: true,
                clearCanvas: false,
                export: false,
                loadScene: false,
                saveToActiveFile: false,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Enhanced whiteboard integration utility
export function insertWhiteboard(view: EditorView): void {
  // Create a modal container
  const modalContainer = document.createElement("div");
  document.body.appendChild(modalContainer);

  // Create the whiteboard component
  const handleSave = (saveData: WhiteboardSaveData) => {
    // Insert the image into the editor
    const { state } = view;
    const { tr } = state;
    const pos = state.selection.from;

    // Create an image node with Excalidraw data for future editing
    const imageNode = state.schema.nodes.image?.create({
      src: saveData.imageData,
      alt: "Whiteboard drawing",
      title: "Created with Excalidraw",
      excalidrawElements: JSON.stringify(saveData.elements),
      excalidrawAppState: JSON.stringify(saveData.appState),
      excalidrawFiles: JSON.stringify(saveData.files),
    });

    if (imageNode) {
      const transaction = tr.insert(pos, imageNode);
      view.dispatch(transaction);
    }
  };

  const handleCancel = () => {
    // This will be handled by the wrapper function
  };

  // Render the whiteboard component using React
  const root = ReactDOM.createRoot(modalContainer);
  
  // Clean up function that unmounts React and removes DOM element
  const cleanup = () => {
    root.unmount();
    if (document.body.contains(modalContainer)) {
      document.body.removeChild(modalContainer);
    }
  };

  // Wrap handlers to include cleanup
  const wrappedHandleSave = (saveData: WhiteboardSaveData) => {
    handleSave(saveData);
    cleanup();
  };

  const wrappedHandleCancel = () => {
    cleanup();
  };

  // Render the Whiteboard component
  root.render(
    React.createElement(Whiteboard, {
      onSave: wrappedHandleSave,
      onCancel: wrappedHandleCancel,
      width: 1000,
      height: 700,
      themeMode: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    })
  );
}

// Enhanced whiteboard button creator
export function createWhiteboardButton(view: EditorView): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3H21V21H3V3Z" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M9 9H15M9 12H15M9 15H13" stroke="currentColor" stroke-width="2"/>
      <circle cx="18" cy="6" r="2" fill="currentColor"/>
    </svg>
  `;
  button.title = "Open Excalidraw Whiteboard";
  button.className =
    "px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 cursor-pointer transition-colors";

  button.addEventListener("click", () => {
    insertWhiteboard(view);
  });

  return button;
}
