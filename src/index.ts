import "./index.css";

export { default as RTE } from "./components/textEditor";

// Export server upload utilities for advanced usage
export type { ServerUploadConfig, UploadResponse, UploadProgress } from "./components/utils/server-upload";
export { 
  getDefaultConfig, 
  uploadFileToServer, 
  createCloudStorageConfig, 
  fallbackToBase64 
} from "./components/utils/server-upload";

// Export file upload types for type safety
export type { FileUploadOptions } from "./components/utils/file-upload";
