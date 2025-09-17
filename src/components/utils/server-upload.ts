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
  /** HTTP method for upload (default: POST) */
  method?: string;
  /** Field name for file in form data (default: file) */
  fieldName?: string;
  /** Additional form fields */
  additionalFields?: Record<string, string>;
  /** Response format parsing (default: json) */
  responseFormat?: 'json' | 'text' | 'custom';
  /** Field name for URL in response (default: url) */
  urlField?: string;
  /** Authentication method (default: bearer) */
  authMethod?: 'bearer' | 'apikey' | 'basic' | 'custom';
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
          const responseFormat = finalConfig.responseFormat || 'json';
          const urlField = finalConfig.urlField || 'url';
          
          let response: UploadResponse;
          
          switch (responseFormat) {
            case 'json':
              response = JSON.parse(xhr.responseText);
              break;
            case 'text':
              // Assume the response text is the URL directly
              response = { url: xhr.responseText.trim() };
              break;
            case 'custom':
              // Custom parsing will be handled by the wrapper function
              response = JSON.parse(xhr.responseText);
              break;
            default:
              response = JSON.parse(xhr.responseText);
          }
          
          // Ensure the response has a URL field using the configured field name
          if (responseFormat === 'json' && urlField !== 'url' && response[urlField as keyof UploadResponse]) {
            response.url = response[urlField as keyof UploadResponse] as string;
          }
          
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
    const method = finalConfig.method || 'POST';
    xhr.open(method, finalConfig.uploadUrl);
    
    // Set timeout
    if (finalConfig.timeout) {
      xhr.timeout = finalConfig.timeout;
    }
    
    // Set headers with enhanced auth method support
    if (finalConfig.apiKey) {
      const authMethod = finalConfig.authMethod || 'bearer';
      switch (authMethod) {
        case 'bearer':
          xhr.setRequestHeader('Authorization', `Bearer ${finalConfig.apiKey}`);
          break;
        case 'apikey':
          xhr.setRequestHeader('X-API-Key', finalConfig.apiKey);
          break;
        case 'basic':
          xhr.setRequestHeader('Authorization', `Basic ${btoa(finalConfig.apiKey)}`);
          break;
        case 'custom':
          // Custom auth handled via headers
          break;
        default:
          xhr.setRequestHeader('Authorization', `Bearer ${finalConfig.apiKey}`);
      }
    }
    
    if (finalConfig.headers) {
      Object.entries(finalConfig.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }
    
    // Prepare form data with configurable field names
    const formData = new FormData();
    const fieldName = finalConfig.fieldName || 'file';
    formData.append(fieldName, file);
    formData.append('filename', file.name);
    formData.append('type', file.type);
    formData.append('size', file.size.toString());
    
    // Add additional fields for custom servers
    const additionalFields = finalConfig.additionalFields || {};
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    // Send request
    xhr.send(formData);
  });
};

/**
 * Utility function to create common cloud storage configurations
 */
export const createCloudStorageConfig = (
  provider: 'aws' | 'gcp' | 'azure' | 'cloudinary' | 'googledrive' | 'dropbox' | 'icloud' | 'custom',
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

    case 'googledrive':
      return {
        uploadUrl: options.uploadUrl || process.env.RTE_GOOGLEDRIVE_UPLOAD_URL || 'https://www.googleapis.com/upload/drive/v3/files',
        apiKey: options.apiKey || process.env.RTE_GOOGLEDRIVE_API_KEY,
        headers: {
          'Authorization': `Bearer ${options.apiKey || process.env.RTE_GOOGLEDRIVE_API_KEY}`,
          'Content-Type': 'multipart/related',
          ...options.headers
        },
        maxFileSize: options.maxFileSize || 15 * 1024 * 1024 * 1024, // 15GB default for Google Drive
        ...options
      };

    case 'dropbox':
      return {
        uploadUrl: options.uploadUrl || process.env.RTE_DROPBOX_UPLOAD_URL || 'https://content.dropboxapi.com/2/files/upload',
        apiKey: options.apiKey || process.env.RTE_DROPBOX_ACCESS_TOKEN,
        headers: {
          'Authorization': `Bearer ${options.apiKey || process.env.RTE_DROPBOX_ACCESS_TOKEN}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: options.path || '/rte-uploads/' + Date.now(),
            mode: 'add',
            autorename: true
          }),
          ...options.headers
        },
        maxFileSize: options.maxFileSize || 150 * 1024 * 1024, // 150MB default for Dropbox API
        ...options
      };

    case 'icloud':
      return {
        uploadUrl: options.uploadUrl || process.env.RTE_ICLOUD_UPLOAD_URL,
        apiKey: options.apiKey || process.env.RTE_ICLOUD_API_KEY,
        headers: {
          'Authorization': `Bearer ${options.apiKey || process.env.RTE_ICLOUD_API_KEY}`,
          'X-Apple-CloudKit-Request-KeyID': options.keyId || process.env.RTE_ICLOUD_KEY_ID,
          'X-Apple-CloudKit-Request-ISO8601Date': new Date().toISOString(),
          'Content-Type': 'multipart/form-data',
          ...options.headers
        },
        maxFileSize: options.maxFileSize || 50 * 1024 * 1024, // 50MB typical limit for iCloud
        ...options
      };
      
    case 'custom':
    default:
      return {
        uploadUrl: options.uploadUrl || process.env.RTE_UPLOAD_URL,
        apiKey: options.apiKey || process.env.RTE_API_KEY,
        // Enhanced custom server support
        method: options.method || 'POST',
        fieldName: options.fieldName || 'file', // Configurable field name for file upload
        additionalFields: options.additionalFields || {}, // Additional form fields
        responseFormat: options.responseFormat || 'json', // json, text, or custom parser
        urlField: options.urlField || 'url', // Field name for URL in response
        authMethod: options.authMethod || 'bearer', // bearer, apikey, basic, custom
        ...options
      };
  }
};

/**
 * Specialized upload function for Google Drive
 */
export const uploadToGoogleDrive = async (
  file: File,
  accessToken: string,
  options: {
    folderId?: string;
    fileName?: string;
    description?: string;
  } = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  const metadata = {
    name: options.fileName || file.name,
    description: options.description || `Uploaded from Kel RTE on ${new Date().toISOString()}`,
    ...(options.folderId && { parents: [options.folderId] })
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const config = createCloudStorageConfig('googledrive', {
    apiKey: accessToken,
    uploadUrl: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    ...options
  });

  const response = await uploadFileToServer(file, config, onProgress);
  
  // Google Drive returns the file ID, construct the public URL
  return {
    ...response,
    url: response.url || `https://drive.google.com/file/d/${response.id}/view`,
  };
};

/**
 * Specialized upload function for Dropbox
 */
export const uploadToDropbox = async (
  file: File,
  accessToken: string,
  options: {
    path?: string;
    autorename?: boolean;
    mode?: 'add' | 'overwrite';
  } = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  const config = createCloudStorageConfig('dropbox', {
    apiKey: accessToken,
    path: options.path || `/rte-uploads/${Date.now()}-${file.name}`,
    ...options
  });

  const response = await uploadFileToServer(file, config, onProgress);
  
  // Generate a shareable link for Dropbox
  return {
    ...response,
    url: response.url || `https://www.dropbox.com/s/${response.id}/${file.name}`,
  };
};

/**
 * Specialized upload function for iCloud Drive
 */
export const uploadToiCloud = async (
  file: File,
  apiKey: string,
  options: {
    containerId?: string;
    zoneName?: string;
    recordType?: string;
  } = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  const config = createCloudStorageConfig('icloud', {
    apiKey,
    containerId: options.containerId || process.env.RTE_ICLOUD_CONTAINER_ID,
    zoneName: options.zoneName || '_defaultZone',
    recordType: options.recordType || 'RTE_Upload',
    ...options
  });

  return uploadFileToServer(file, config, onProgress);
};

/**
 * Enhanced custom server upload with flexible configuration
 */
export const uploadToCustomServer = async (
  file: File,
  config: ServerUploadConfig & {
    method?: string;
    fieldName?: string;
    additionalFields?: Record<string, string>;
    responseFormat?: 'json' | 'text' | 'custom';
    urlField?: string;
    authMethod?: 'bearer' | 'apikey' | 'basic' | 'custom';
    customParser?: (response: string) => UploadResponse;
  },
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  const enhancedConfig = createCloudStorageConfig('custom', config);
  
  // Use custom parser if provided for response format
  if (config.customParser && config.responseFormat === 'custom') {
    const originalUpload = uploadFileToServer(file, enhancedConfig, onProgress);
    return originalUpload.then(response => {
      if (config.customParser) {
        return config.customParser(JSON.stringify(response));
      }
      return response;
    });
  }

  return uploadFileToServer(file, enhancedConfig, onProgress);
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
  fallbackToBase64,
  uploadToGoogleDrive,
  uploadToDropbox,
  uploadToiCloud,
  uploadToCustomServer
};