/**
 * Server File Upload Utility
 * Provides server-side file upload functionality with environment variable configuration
 * Supports various cloud storage providers and custom upload endpoints
 */

export interface ServerUploadConfig {
  /** Upload endpoint URL */
  uploadUrl?: string;
  /** API key for authentication */
  apiKey?: string;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Allowed file types */
  allowedTypes?: string[];
  /** Upload timeout in milliseconds */
  timeout?: number;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Enable progress tracking */
  enableProgress?: boolean;
}

export interface UploadResponse {
  /** Public URL of uploaded file */
  url: string;
  /** File ID or identifier */
  id?: string;
  /** File metadata */
  metadata?: {
    filename: string;
    size: number;
    type: string;
    uploadedAt: string;
  };
}

export interface UploadProgress {
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Bytes uploaded */
  loaded: number;
  /** Total bytes to upload */
  total: number;
}

/**
 * Default configuration loaded from environment variables
 * Allows easy configuration via .env files
 */
export const getDefaultConfig = (): ServerUploadConfig => {
  // Check for environment variables (works in Node.js and browser with build-time injection)
  const config: ServerUploadConfig = {};
  
  if (typeof process !== 'undefined' && process.env) {
    config.uploadUrl = process.env.RTE_UPLOAD_URL;
    config.apiKey = process.env.RTE_API_KEY;
    config.maxFileSize = process.env.RTE_MAX_FILE_SIZE 
      ? parseInt(process.env.RTE_MAX_FILE_SIZE) 
      : 10 * 1024 * 1024; // 10MB default
    config.timeout = process.env.RTE_UPLOAD_TIMEOUT 
      ? parseInt(process.env.RTE_UPLOAD_TIMEOUT) 
      : 30000; // 30s default
    config.enableProgress = process.env.RTE_ENABLE_PROGRESS === 'true';
    
    // Parse allowed types from comma-separated string
    if (process.env.RTE_ALLOWED_TYPES) {
      config.allowedTypes = process.env.RTE_ALLOWED_TYPES.split(',').map(type => type.trim());
    }
    
    // Parse custom headers from JSON string
    if (process.env.RTE_CUSTOM_HEADERS) {
      try {
        config.headers = JSON.parse(process.env.RTE_CUSTOM_HEADERS);
      } catch (error) {
        console.warn('Failed to parse RTE_CUSTOM_HEADERS:', error);
      }
    }
  }
  
  return config;
};

/**
 * Upload file to server using configuration
 */
export const uploadFileToServer = async (
  file: File,
  config: ServerUploadConfig = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  const finalConfig = { ...getDefaultConfig(), ...config };
  
  // Validate configuration
  if (!finalConfig.uploadUrl) {
    throw new Error('Upload URL is required. Set RTE_UPLOAD_URL environment variable or pass uploadUrl in config.');
  }
  
  // Validate file size
  if (finalConfig.maxFileSize && file.size > finalConfig.maxFileSize) {
    throw new Error(`File size (${file.size} bytes) exceeds maximum allowed size (${finalConfig.maxFileSize} bytes)`);
  }
  
  // Validate file type
  if (finalConfig.allowedTypes && finalConfig.allowedTypes.length > 0) {
    const isAllowed = finalConfig.allowedTypes.some(allowedType => {
      if (allowedType.endsWith('/*')) {
        return file.type.startsWith(allowedType.slice(0, -1));
      }
      return file.type === allowedType;
    });
    
    if (!isAllowed) {
      throw new Error(`File type (${file.type}) is not allowed. Allowed types: ${finalConfig.allowedTypes.join(', ')}`);
    }
  }
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Setup progress tracking
    if (onProgress && finalConfig.enableProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress({
            progress: Math.round((event.loaded / event.total) * 100),
            loaded: event.loaded,
            total: event.total
          });
        }
      });
    }
    
    // Setup response handlers
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format from server'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'));
    });
    
    // Setup request
    xhr.open('POST', finalConfig.uploadUrl);
    
    // Set timeout
    if (finalConfig.timeout) {
      xhr.timeout = finalConfig.timeout;
    }
    
    // Set headers
    if (finalConfig.apiKey) {
      xhr.setRequestHeader('Authorization', `Bearer ${finalConfig.apiKey}`);
    }
    
    if (finalConfig.headers) {
      Object.entries(finalConfig.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('type', file.type);
    formData.append('size', file.size.toString());
    
    // Send request
    xhr.send(formData);
  });
};

/**
 * Utility function to create common cloud storage configurations
 */
export const createCloudStorageConfig = (
  provider: 'aws' | 'gcp' | 'azure' | 'cloudinary' | 'custom',
  options: Record<string, any> = {}
): ServerUploadConfig => {
  switch (provider) {
    case 'aws':
      return {
        uploadUrl: options.uploadUrl || process.env.RTE_AWS_UPLOAD_URL,
        apiKey: options.apiKey || process.env.RTE_AWS_ACCESS_KEY,
        headers: {
          'x-amz-acl': 'public-read',
          ...options.headers
        },
        ...options
      };
      
    case 'gcp':
      return {
        uploadUrl: options.uploadUrl || process.env.RTE_GCP_UPLOAD_URL,
        apiKey: options.apiKey || process.env.RTE_GCP_API_KEY,
        headers: {
          'x-goog-meta-uploaded-by': 'kel-rte',
          ...options.headers
        },
        ...options
      };
      
    case 'azure':
      return {
        uploadUrl: options.uploadUrl || process.env.RTE_AZURE_UPLOAD_URL,
        apiKey: options.apiKey || process.env.RTE_AZURE_ACCESS_KEY,
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          ...options.headers
        },
        ...options
      };
      
    case 'cloudinary':
      return {
        uploadUrl: options.uploadUrl || process.env.RTE_CLOUDINARY_UPLOAD_URL,
        apiKey: options.apiKey || process.env.RTE_CLOUDINARY_API_KEY,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          ...options.headers
        },
        ...options
      };
      
    case 'custom':
    default:
      return {
        uploadUrl: options.uploadUrl || process.env.RTE_UPLOAD_URL,
        apiKey: options.apiKey || process.env.RTE_API_KEY,
        ...options
      };
  }
};

/**
 * Fallback function for when server upload fails
 * Converts file to base64 as backup
 */
export const fallbackToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file as base64'));
    };
    
    reader.readAsDataURL(file);
  });
};

export default {
  getDefaultConfig,
  uploadFileToServer,
  createCloudStorageConfig,
  fallbackToBase64
};