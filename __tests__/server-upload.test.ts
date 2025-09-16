/**
 * Server Upload Utility Tests
 * Tests for the new server-side file upload functionality
 */

import {
  getDefaultConfig,
  uploadFileToServer,
  createCloudStorageConfig,
  fallbackToBase64,
  ServerUploadConfig,
  UploadResponse,
  UploadProgress,
} from "../src/components/utils/server-upload";

// Mock XMLHttpRequest
const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  addEventListener: jest.fn(),
  upload: {
    addEventListener: jest.fn(),
  },
  timeout: 0,
  status: 200,
  statusText: 'OK',
  responseText: '{"url": "https://example.com/file.jpg", "id": "123"}',
};

global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

// Mock FormData
global.FormData = jest.fn(() => ({
  append: jest.fn(),
})) as any;

// Mock File
global.File = jest.fn((content, name, options) => ({
  name,
  size: content.length,
  type: options?.type || 'text/plain',
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(content.length)),
})) as any;

// Mock FileReader for fallback tests
global.FileReader = jest.fn(() => ({
  readAsDataURL: jest.fn(),
  result: 'data:image/png;base64,mockdata',
  onload: null,
  onerror: null,
})) as any;

describe('Server Upload Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear environment variables
    delete process.env.RTE_UPLOAD_URL;
    delete process.env.RTE_API_KEY;
    delete process.env.RTE_MAX_FILE_SIZE;
    delete process.env.RTE_UPLOAD_TIMEOUT;
    delete process.env.RTE_ENABLE_PROGRESS;
    delete process.env.RTE_ALLOWED_TYPES;
    delete process.env.RTE_CUSTOM_HEADERS;
  });

  describe('getDefaultConfig', () => {
    it('should return config with default values when no environment variables are set', () => {
      const config = getDefaultConfig();
      expect(config).toEqual({
        apiKey: undefined,
        enableProgress: false,
        maxFileSize: 10485760,
        timeout: 30000,
        uploadUrl: undefined,
      });
    });

    it('should load configuration from environment variables', () => {
      process.env.RTE_UPLOAD_URL = 'https://api.example.com/upload';
      process.env.RTE_API_KEY = 'test-api-key';
      process.env.RTE_MAX_FILE_SIZE = '5242880'; // 5MB
      process.env.RTE_UPLOAD_TIMEOUT = '60000'; // 60s
      process.env.RTE_ENABLE_PROGRESS = 'true';
      process.env.RTE_ALLOWED_TYPES = 'image/*,application/pdf';
      process.env.RTE_CUSTOM_HEADERS = '{"X-Custom-Header": "value"}';

      const config = getDefaultConfig();

      expect(config).toEqual({
        uploadUrl: 'https://api.example.com/upload',
        apiKey: 'test-api-key',
        maxFileSize: 5242880,
        timeout: 60000,
        enableProgress: true,
        allowedTypes: ['image/*', 'application/pdf'],
        headers: { 'X-Custom-Header': 'value' },
      });
    });

    it('should handle invalid JSON in custom headers gracefully', () => {
      process.env.RTE_CUSTOM_HEADERS = 'invalid-json';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const config = getDefaultConfig();

      expect(config.headers).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse RTE_CUSTOM_HEADERS:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('uploadFileToServer', () => {
    let mockFile: File;

    beforeEach(() => {
      mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' }) as any;
    });

    it('should throw error if no upload URL is provided', async () => {
      await expect(uploadFileToServer(mockFile, {})).rejects.toThrow(
        'Upload URL is required. Set RTE_UPLOAD_URL environment variable or pass uploadUrl in config.'
      );
    });

    it('should validate file size', async () => {
      const config: ServerUploadConfig = {
        uploadUrl: 'https://api.example.com/upload',
        maxFileSize: 5, // Very small limit
      };

      await expect(uploadFileToServer(mockFile, config)).rejects.toThrow(
        'File size (12 bytes) exceeds maximum allowed size (5 bytes)'
      );
    }, 10000); // Increase timeout

    it('should validate file type', async () => {
      const config: ServerUploadConfig = {
        uploadUrl: 'https://api.example.com/upload',
        allowedTypes: ['image/*'],
      };

      await expect(uploadFileToServer(mockFile, config)).rejects.toThrow(
        'File type (text/plain) is not allowed. Allowed types: image/*'
      );
    });

    it('should allow wildcard file types', async () => {
      const config: ServerUploadConfig = {
        uploadUrl: 'https://api.example.com/upload',
        allowedTypes: ['text/*'],
      };

      // Mock successful upload
      setTimeout(() => {
        const loadHandler = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'load'
        )?.[1];
        if (loadHandler) loadHandler();
      }, 0);

      await expect(uploadFileToServer(mockFile, config)).resolves.toEqual({
        url: 'https://example.com/file.jpg',
        id: '123',
      });
    });

    it('should successfully upload file', async () => {
      const config: ServerUploadConfig = {
        uploadUrl: 'https://api.example.com/upload',
        apiKey: 'test-key',
        timeout: 30000,
        headers: { 'X-Custom': 'header' },
      };

      // Mock successful upload
      setTimeout(() => {
        const loadHandler = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'load'
        )?.[1];
        if (loadHandler) loadHandler();
      }, 0);

      const result = await uploadFileToServer(mockFile, config);

      expect(mockXHR.open).toHaveBeenCalledWith('POST', 'https://api.example.com/upload');
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer test-key');
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('X-Custom', 'header');
      expect(mockXHR.timeout).toBe(30000);
      expect(result).toEqual({
        url: 'https://example.com/file.jpg',
        id: '123',
      });
    });

    it('should track upload progress', async () => {
      const config: ServerUploadConfig = {
        uploadUrl: 'https://api.example.com/upload',
        enableProgress: true,
      };

      const onProgress = jest.fn();

      // Mock progress event
      setTimeout(() => {
        const progressHandler = mockXHR.upload.addEventListener.mock.calls.find(
          call => call[0] === 'progress'
        )?.[1];
        if (progressHandler) {
          progressHandler({
            lengthComputable: true,
            loaded: 50,
            total: 100,
          });
        }

        // Mock completion
        const loadHandler = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'load'
        )?.[1];
        if (loadHandler) loadHandler();
      }, 0);

      await uploadFileToServer(mockFile, config, onProgress);

      expect(onProgress).toHaveBeenCalledWith({
        progress: 50,
        loaded: 50,
        total: 100,
      });
    });

    it('should handle upload errors', async () => {
      const config: ServerUploadConfig = {
        uploadUrl: 'https://api.example.com/upload',
      };

      // Mock error
      mockXHR.status = 500;
      mockXHR.statusText = 'Internal Server Error';
      setTimeout(() => {
        const loadHandler = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'load'
        )?.[1];
        if (loadHandler) loadHandler();
      }, 0);

      await expect(uploadFileToServer(mockFile, config)).rejects.toThrow(
        'Upload failed with status 500: Internal Server Error'
      );
    });

    it('should handle network errors', async () => {
      const config: ServerUploadConfig = {
        uploadUrl: 'https://api.example.com/upload',
      };

      // Mock network error
      setTimeout(() => {
        const errorHandler = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'error'
        )?.[1];
        if (errorHandler) errorHandler();
      }, 0);

      await expect(uploadFileToServer(mockFile, config)).rejects.toThrow(
        'Network error during upload'
      );
    });

    it('should handle timeout', async () => {
      const config: ServerUploadConfig = {
        uploadUrl: 'https://api.example.com/upload',
      };

      // Mock timeout
      setTimeout(() => {
        const timeoutHandler = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'timeout'
        )?.[1];
        if (timeoutHandler) timeoutHandler();
      }, 0);

      await expect(uploadFileToServer(mockFile, config)).rejects.toThrow(
        'Upload timeout'
      );
    });

    it('should handle invalid JSON response', async () => {
      const config: ServerUploadConfig = {
        uploadUrl: 'https://api.example.com/upload',
      };

      // Reset mock status to success
      mockXHR.status = 200;
      mockXHR.statusText = 'OK';
      // Mock invalid response
      mockXHR.responseText = 'invalid json';
      setTimeout(() => {
        const loadHandler = mockXHR.addEventListener.mock.calls.find(
          call => call[0] === 'load'
        )?.[1];
        if (loadHandler) loadHandler();
      }, 0);

      await expect(uploadFileToServer(mockFile, config)).rejects.toThrow(
        'Invalid response format from server'
      );
    });
  });

  describe('createCloudStorageConfig', () => {
    it('should create AWS config', () => {
      process.env.RTE_AWS_UPLOAD_URL = 'https://s3.amazonaws.com/upload';
      process.env.RTE_AWS_ACCESS_KEY = 'aws-key';

      const config = createCloudStorageConfig('aws');

      expect(config).toEqual({
        uploadUrl: 'https://s3.amazonaws.com/upload',
        apiKey: 'aws-key',
        headers: {
          'x-amz-acl': 'public-read',
        },
      });
    });

    it('should create GCP config', () => {
      const config = createCloudStorageConfig('gcp', {
        uploadUrl: 'https://storage.googleapis.com/upload',
        apiKey: 'gcp-key',
      });

      expect(config).toEqual({
        uploadUrl: 'https://storage.googleapis.com/upload',
        apiKey: 'gcp-key',
        headers: {
          'x-goog-meta-uploaded-by': 'kel-rte',
        },
      });
    });

    it('should create Azure config', () => {
      const config = createCloudStorageConfig('azure', {
        uploadUrl: 'https://storage.azure.com/upload',
        apiKey: 'azure-key',
      });

      expect(config).toEqual({
        uploadUrl: 'https://storage.azure.com/upload',
        apiKey: 'azure-key',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
        },
      });
    });

    it('should create Cloudinary config', () => {
      const config = createCloudStorageConfig('cloudinary', {
        uploadUrl: 'https://api.cloudinary.com/v1_1/upload',
        apiKey: 'cloudinary-key',
      });

      expect(config).toEqual({
        uploadUrl: 'https://api.cloudinary.com/v1_1/upload',
        apiKey: 'cloudinary-key',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    });

    it('should create custom config', () => {
      const config = createCloudStorageConfig('custom', {
        uploadUrl: 'https://custom.example.com/upload',
        apiKey: 'custom-key',
        customOption: 'value',
      });

      expect(config).toEqual({
        uploadUrl: 'https://custom.example.com/upload',
        apiKey: 'custom-key',
        customOption: 'value',
      });
    });

    it('should allow custom headers override', () => {
      const config = createCloudStorageConfig('aws', {
        headers: {
          'x-amz-acl': 'private',
          'x-custom': 'value',
        },
      });

      expect(config.headers).toEqual({
        'x-amz-acl': 'private',
        'x-custom': 'value',
      });
    });
  });

  describe('fallbackToBase64', () => {
    it('should convert file to base64', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' }) as any;
      const mockReader = {
        readAsDataURL: jest.fn(),
        result: 'data:text/plain;base64,dGVzdCBjb250ZW50',
        onload: null,
        onerror: null,
      };

      (global.FileReader as any).mockImplementation(() => mockReader);

      // Mock successful read
      setTimeout(() => {
        if (mockReader.onload) mockReader.onload({ target: mockReader } as any);
      }, 0);

      const result = await fallbackToBase64(mockFile);

      expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
      expect(result).toBe('data:text/plain;base64,dGVzdCBjb250ZW50');
    });

    it('should handle read errors', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' }) as any;
      const mockReader = {
        readAsDataURL: jest.fn(),
        result: null,
        onload: null,
        onerror: null,
      };

      (global.FileReader as any).mockImplementation(() => mockReader);

      // Mock error
      setTimeout(() => {
        if (mockReader.onerror) mockReader.onerror();
      }, 0);

      await expect(fallbackToBase64(mockFile)).rejects.toThrow(
        'Failed to read file as base64'
      );
    });
  });
});