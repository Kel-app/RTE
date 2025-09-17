import { EditorView } from "prosemirror-view";
import { NodeSpec } from "prosemirror-model";
import { 
  uploadFileToServer, 
  fallbackToBase64, 
  ServerUploadConfig, 
  UploadProgress 
} from "./server-upload";

// Define image node for the schema
export const imageNode: NodeSpec = {
  attrs: {
    src: {},
    alt: { default: null },
    title: { default: null },
    width: { default: null },
    height: { default: null },
  },
  inline: true,
  group: "inline",
  draggable: true,
  parseDOM: [
    {
      tag: "img[src]",
      getAttrs: (dom: HTMLElement) => ({
        src: dom.getAttribute("src"),
        title: dom.getAttribute("title"),
        alt: dom.getAttribute("alt"),
        width: dom.getAttribute("width"),
        height: dom.getAttribute("height"),
      }),
    },
  ],
  toDOM: (node) => [
    "img",
    {
      src: node.attrs.src,
      alt: node.attrs.alt,
      title: node.attrs.title,
      width: node.attrs.width,
      height: node.attrs.height,
    },
  ],
};

// Define file/attachment node for the schema
export const fileNode: NodeSpec = {
  attrs: {
    src: {},
    filename: {},
    size: { default: null },
    type: { default: null },
  },
  inline: true,
  group: "inline",
  parseDOM: [
    {
      tag: "a[data-file]",
      getAttrs: (dom: HTMLElement) => ({
        src: dom.getAttribute("href"),
        filename: dom.getAttribute("data-filename"),
        size: dom.getAttribute("data-size"),
        type: dom.getAttribute("data-type"),
      }),
    },
  ],
  toDOM: (node) => [
    "a",
    {
      href: node.attrs.src,
      "data-file": "true",
      "data-filename": node.attrs.filename,
      "data-size": node.attrs.size,
      "data-type": node.attrs.type,
      download: node.attrs.filename,
      class: "file-attachment",
    },
    ["span", { class: "file-icon" }, "📎"],
    ["span", { class: "file-name" }, node.attrs.filename],
  ],
};

export interface FileUploadOptions {
  /** Server upload configuration. If not provided, files will be stored as base64 */
  serverConfig?: ServerUploadConfig;
  /** Enable server upload. Defaults to false for backward compatibility */
  enableServerUpload?: boolean;
  /** Callback for upload progress */
  onProgress?: (progress: UploadProgress) => void;
  /** Callback for upload success */
  onUploadSuccess?: (url: string, file: File) => void;
  /** Callback for upload error */
  onUploadError?: (error: Error, file: File) => void;
  /** Whether to fallback to base64 if server upload fails */
  fallbackToBase64OnError?: boolean;
}

// File upload handler
export function handleFileUpload(
  view: EditorView, 
  file: File, 
  options: FileUploadOptions = {}
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (!view) {
      reject(new Error("No editor view provided"));
      return;
    }

    const {
      serverConfig,
      enableServerUpload = false,
      onProgress,
      onUploadSuccess,
      onUploadError,
      fallbackToBase64OnError = true
    } = options;

    try {
      let fileUrl: string;
      
      // Try server upload if enabled and configured
      if (enableServerUpload && serverConfig) {
        try {
          const uploadResponse = await uploadFileToServer(file, serverConfig, onProgress);
          fileUrl = uploadResponse.url;
          onUploadSuccess?.(fileUrl, file);
        } catch (uploadError) {
          console.warn('Server upload failed:', uploadError);
          onUploadError?.(uploadError as Error, file);
          
          // Fallback to base64 if enabled
          if (fallbackToBase64OnError) {
            console.log('Falling back to base64 storage');
            fileUrl = await fallbackToBase64(file);
          } else {
            throw uploadError;
          }
        }
      } else {
        // Use base64 (original behavior)
        fileUrl = await fallbackToBase64(file);
      }

      // Insert into editor
      if (file.type.startsWith("image/")) {
        insertImage(view, fileUrl, file.name);
      } else {
        insertFile(view, fileUrl, file.name, file.size, file.type);
      }

      resolve();
    } catch (error) {
      onUploadError?.(error as Error, file);
      reject(error);
    }
  });
}

// Insert image into editor
function insertImage(view: EditorView, src: string, alt: string): void {
  const imageNode = view.state.schema.nodes.image;
  if (!imageNode) return;

  const node = imageNode.create({ src, alt });
  const tr = view.state.tr.insert(view.state.selection.from, node);
  view.dispatch(tr);
}

// Insert file attachment into editor
function insertFile(
  view: EditorView,
  src: string,
  filename: string,
  size: number,
  type: string
): void {
  const fileNode = view.state.schema.nodes.file;
  if (!fileNode) return;

  const node = fileNode.create({ src, filename, size, type });
  const tr = view.state.tr.insert(view.state.selection.from, node);
  view.dispatch(tr);
}

// Setup drag and drop for file uploads
export function setupFileDropZone(
  view: EditorView, 
  options: FileUploadOptions = {}
): () => void {
  if (!view) return () => {};

  const editorDom = view.dom;

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    editorDom.classList.add("drag-over");
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    editorDom.classList.remove("drag-over");
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    editorDom.classList.remove("drag-over");

    const files = Array.from(e.dataTransfer?.files || []);

    for (const file of files) {
      try {
        await handleFileUpload(view, file, options);
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    }
  };

  editorDom.addEventListener("dragover", handleDragOver);
  editorDom.addEventListener("dragleave", handleDragLeave);
  editorDom.addEventListener("drop", handleDrop);

  // Cleanup function
  return () => {
    editorDom.removeEventListener("dragover", handleDragOver);
    editorDom.removeEventListener("dragleave", handleDragLeave);
    editorDom.removeEventListener("drop", handleDrop);
  };
}

// File upload button handler
export function createFileUploadButton(
  view: EditorView, 
  options: FileUploadOptions = {}
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.style.display = "none";

  input.addEventListener("change", async (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);

    for (const file of files) {
      try {
        await handleFileUpload(view, file, options);
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    }

    // Reset input
    input.value = "";
  });

  return input;
}

export default {
  imageNode,
  fileNode,
  handleFileUpload,
  setupFileDropZone,
  createFileUploadButton,
};
