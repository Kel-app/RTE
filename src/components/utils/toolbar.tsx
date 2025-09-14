import React from "react";
import { EditorView } from "prosemirror-view";
import { undo, redo } from "prosemirror-history";
import {
  Bold,
  Italic,
  Underline,
  Upload,
  FileText,
  Palette,
} from "lucide-react";
import { Toggle } from "../ui/toggle";
import { availableFonts } from "./fonts";
import applyFontSize from "./apply-font-size";
import applyFontFace from "./apply-font-face";
import applyColor from "./apply-color";
import applyMarkCmd from "./apply-mark-cmd";
import markdownSupport from "./markdown-support";
import fileUpload from "./file-upload";
import { createWhiteboardButton } from "./whiteboard";

interface ToolbarProps {
  view: EditorView | null;
  defaultColor: string;
  className?: string;
  onWhiteboardOpen?: () => void;
}

export default function Toolbar({
  view,
  defaultColor,
  className = "",
  onWhiteboardOpen,
}: ToolbarProps) {
  const handleFileUpload = () => {
    if (!view) return;
    const input = fileUpload.createFileUploadButton(view);
    input.click();
  };

  const handleWhiteboard = () => {
    if (onWhiteboardOpen) {
      onWhiteboardOpen();
    } else if (view) {
      // Fallback to old method if no callback provided
      createWhiteboardButton(view).click();
    }
  };

  const handleMarkdownExport = () => {
    if (!view) return;
    const markdown = markdownSupport.exportMarkdown(view);
    navigator.clipboard.writeText(markdown);
    alert("Markdown copied to clipboard!");
  };

  const handleMarkdownImport = () => {
    if (!view) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          markdownSupport.importMarkdown(content, view);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className={`rte-toolbar ${className}`}>
      {/* Font Size Selector */}
      <select
        onChange={(e) => applyFontSize(e.target.value, view)}
        defaultValue="16px"
        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white"
        title="Font Size"
      >
        <option value="custom">Custom</option>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="24px">24px</option>
        <option value="32px">32px</option>
        <option value="48px">48px</option>
      </select>

      {/* Font Family Selector */}
      <select
        onChange={(e) => applyFontFace(e.target.value, view)}
        defaultValue={availableFonts[0].value}
        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white"
        title="Font Family"
      >
        {availableFonts.map((font) => (
          <option
            key={font.value}
            value={font.value}
            style={{ fontFamily: font.value }}
          >
            {font.name}
          </option>
        ))}
      </select>

      {/* Color Picker */}
      <input
        type="color"
        defaultValue={defaultColor}
        onChange={(e) => applyColor(e.target.value, view)}
        className="w-8 h-8 p-0 border-none cursor-pointer rounded"
        title="Text Color"
      />

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      {/* Text Formatting */}
      <Toggle
        onClick={() => applyMarkCmd("strong", view)}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </Toggle>

      <Toggle
        onClick={() => applyMarkCmd("em", view)}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </Toggle>

      <Toggle
        onClick={() => applyMarkCmd("underline", view)}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </Toggle>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      {/* History */}
      <button
        onClick={() => view && undo(view.state, view.dispatch)}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        title="Undo (Ctrl+Z)"
      >
        ↶
      </button>

      <button
        onClick={() => view && redo(view.state, view.dispatch)}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        title="Redo (Ctrl+Y)"
      >
        ↷
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      {/* File Operations */}
      <button
        onClick={handleFileUpload}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        title="Upload File"
      >
        <Upload size={16} />
      </button>

      <button
        onClick={handleWhiteboard}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        title="Open Whiteboard"
      >
        <Palette size={16} />
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      {/* Markdown Operations */}
      <button
        onClick={handleMarkdownImport}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        title="Import Markdown"
      >
        📄
      </button>

      <button
        onClick={handleMarkdownExport}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        title="Export as Markdown"
      >
        <FileText size={16} />
      </button>
    </div>
  );
}
