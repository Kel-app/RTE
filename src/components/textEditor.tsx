import React, { useEffect, useRef, useState } from "react";

// ProseMirror imports
import { EditorState } from "prosemirror-state";
import { Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";

// 3rd party imports
import { placeholder } from "@dear-rama/prosemirror-placeholder";
import { useTheme } from "next-themes";

// Custom imports
import {
  fontSizeMark,
  textColorMark,
  fontFamilyMark,
  underlineMark,
} from "./utils/text-style";
import switchTheme from "./utils/switch-theme";
import fileUpload, { imageNode, fileNode, FileUploadOptions } from "./utils/file-upload";
import { ServerUploadConfig } from "./utils/server-upload";
import Toolbar from "./utils/toolbar";
import Whiteboard from "./utils/whiteboard";

// Styles
import "prosemirror-view/style/prosemirror.css";
import "../index.css";
import "./utils/rte-enhancements.css";

// Components
import { Switch } from "./ui/switch";
import { Moon } from "lucide-react";

interface RTEProps {
  themeSwitch: boolean;
  defaultValue?: string;
  /** Server upload configuration for file uploads */
  uploadConfig?: ServerUploadConfig;
  /** Enable server-side file uploads. Defaults to false for backward compatibility */
  enableServerUpload?: boolean;
  /** Upload event callbacks */
  onFileUploadStart?: (file: File) => void;
  onFileUploadProgress?: (progress: { progress: number; loaded: number; total: number }) => void;
  onFileUploadSuccess?: (url: string, file: File) => void;
  onFileUploadError?: (error: Error, file: File) => void;
}

export default function RichTextEditor({
  themeSwitch,
  defaultValue,
  uploadConfig,
  enableServerUpload = false,
  onFileUploadStart,
  onFileUploadProgress,
  onFileUploadSuccess,
  onFileUploadError,
}: RTEProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [defaultColor, setDefaultColor] = useState("#000000");
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prepare file upload options
  const fileUploadOptions: FileUploadOptions = {
    serverConfig: uploadConfig,
    enableServerUpload,
    onProgress: onFileUploadProgress,
    onUploadSuccess: (url, file) => {
      onFileUploadSuccess?.(url, file);
    },
    onUploadError: (error, file) => {
      onFileUploadError?.(error, file);
    },
    fallbackToBase64OnError: true, // Always fallback for better UX
  };

  useEffect(() => {
    if (!editorRef.current) return;

    setTimeout(() => {
      const el = document.querySelector(".empty-node");

      if (el) {
        const style = getComputedStyle(el);
        const color = style.color;

        const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
        const match = color.match(rgbRegex);

        if (match) {
          const [_, r, g, b] = match;
          console.log(`Red: ${r}, Green: ${g}, Blue: ${b}`);

          if (r === "0" && g === "0" && b === "0") {
            setDefaultColor("#000000");
          } else if (r === "255" && g === "255" && b === "255") {
            setDefaultColor("#FFFFFF");
          }
        }
      } else {
        console.error("Element with class 'empty-node' not found.");
      }
    }, 50);

    const defaultSchema = new Schema({
      nodes: addListNodes(
        basicSchema.spec.nodes,
        "paragraph block*",
        "block"
      ).append({
        image: imageNode,
        file: fileNode,
      }),
      marks: basicSchema.spec.marks.append({
        font_size: fontSizeMark,
        font_family: fontFamilyMark,
        text_color: textColorMark,
        underline: underlineMark,
      }),
    });

    const state = EditorState.create({
      schema: defaultSchema,
      plugins: [
        placeholder(),
        history(),
        keymap({ "Mod-z": undo, "Mod-y": redo }),
        keymap(baseKeymap),
      ],
    });

    const editorView = new EditorView(editorRef.current, {
      state,
      handleDOMEvents: {
        focus: () => {
          setIsFocused(true);
          return false;
        },
        blur: () => {
          setIsFocused(false);
          return false;
        },
        beforeinput: (view, event) => {
          const ie = event as InputEvent;
          if (ie.inputType === "historyUndo") {
            undo(view.state, view.dispatch);
            event.preventDefault();
            return true;
          }
          if (ie.inputType === "historyRedo") {
            redo(view.state, view.dispatch);
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    });

    setView(editorView);

    // Setup file upload functionality
    const cleanup = fileUpload.setupFileDropZone(editorView, fileUploadOptions);

    return () => {
      cleanup();
      editorView.destroy();
    };
  }, []);

  // Whiteboard handlers
  const handleWhiteboardOpen = () => {
    setIsWhiteboardOpen(true);
  };

  const handleWhiteboardSave = (imageData: string) => {
    if (!view) return;

    // Insert the image into the editor
    const { state } = view;
    const { tr } = state;
    const pos = state.selection.from;

    // Create an image node
    const imageNode = state.schema.nodes.image?.create({
      src: imageData,
      alt: "Excalidraw whiteboard",
      title: "Created with Excalidraw",
    });

    if (imageNode) {
      const transaction = tr.insert(pos, imageNode);
      view.dispatch(transaction);
    }

    setIsWhiteboardOpen(false);
  };

  const handleWhiteboardCancel = () => {
    setIsWhiteboardOpen(false);
  };

  if (themeSwitch) {
    return (
      <div className="w-screen h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white">
        <div className="fixed top-4 right-4 w-20 h-20">
          <Switch
            id="theme-switch"
            onCheckedChange={(checked) =>
              switchTheme(theme, setTheme, setDefaultColor)
            }
          >
            <Moon />
          </Switch>
        </div>
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black px-6 py-3 shadow-lg rounded-full z-50">
          <Toolbar
            view={view}
            defaultColor={defaultColor}
            onWhiteboardOpen={handleWhiteboardOpen}
            fileUploadOptions={fileUploadOptions}
          />
        </div>

        <div
          ref={editorRef}
          className="rte-editor-container flex-1 overflow-y-auto p-8 mx-12 mt-12 mb-32 rounded-lg shadow-lg bg-white text-black dark:bg-black dark:text-white active:outline-none focus:outline-none active:border-none focus:border-none"
        />

        {/* Whiteboard Modal */}
        {isWhiteboardOpen && (
          <Whiteboard
            onSave={handleWhiteboardSave}
            onCancel={handleWhiteboardCancel}
            width={1000}
            height={700}
            themeMode={theme === "dark" ? "dark" : "light"}
          />
        )}
      </div>
    );
  }

  // if false, return withOUT a theme switch (for integrated editor)

  return (
    <div className="w-screen h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white">
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black px-6 py-3 shadow-lg rounded-full z-50">
        <Toolbar
          view={view}
          defaultColor={defaultColor}
          onWhiteboardOpen={handleWhiteboardOpen}
          fileUploadOptions={fileUploadOptions}
        />
      </div>

      <div
        ref={editorRef}
        className="rte-editor-container flex-1 overflow-y-auto p-8 mx-12 mt-12 mb-32 rounded-lg shadow-lg bg-white text-black dark:bg-black dark:text-white active:outline-none focus:outline-none active:border-none focus:border-none"
      />

      {/* Whiteboard Modal */}
      {isWhiteboardOpen && (
        <Whiteboard
          onSave={handleWhiteboardSave}
          onCancel={handleWhiteboardCancel}
          width={1000}
          height={700}
          themeMode={theme === "dark" ? "dark" : "light"}
        />
      )}
    </div>
  );
}
