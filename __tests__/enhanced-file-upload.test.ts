/**
 * Enhanced File Upload Tests
 * Tests for the updated file upload functionality with server upload support
 */

import { handleFileUpload, FileUploadOptions } from "../src/components/utils/file-upload";
import * as serverUpload from "../src/components/utils/server-upload";

// Mock the server upload module
jest.mock("../src/components/utils/server-upload", () => ({
  uploadFileToServer: jest.fn(),
  fallbackToBase64: jest.fn(),
}));

// Mock EditorView for testing
const mockEditorView = {
  state: {
    tr: {
      insert: jest.fn().mockReturnThis(),
      scrollIntoView: jest.fn().mockReturnThis(),
    },
    selection: {
      from: 0,
    },
    schema: {
      nodes: {
        image: {
          create: jest.fn().mockReturnValue({ type: 'image' }),
        },
        file: {
          create: jest.fn().mockReturnValue({ type: 'file' }),
        },
      },
    },
  },
  dispatch: jest.fn(),
};

describe("Enhanced File Upload Utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleFileUpload with server upload", () => {
    it("should use server upload when enabled and configured", async () => {
      const mockFile = new File(["image content"], "test.png", {
        type: "image/png",
      });

      const uploadResponse = {
        url: "https://cdn.example.com/test.png",
        id: "file-123",
        metadata: {
          filename: "test.png",
          size: 12,
          type: "image/png",
          uploadedAt: "2023-01-01T00:00:00Z",
        },
      };

      (serverUpload.uploadFileToServer as jest.Mock).mockResolvedValue(uploadResponse);

      const onUploadSuccess = jest.fn();
      const onProgress = jest.fn();

      const options: FileUploadOptions = {
        enableServerUpload: true,
        serverConfig: {
          uploadUrl: "https://api.example.com/upload",
          apiKey: "test-key",
        },
        onUploadSuccess,
        onProgress,
      };

      await handleFileUpload(mockEditorView as any, mockFile, options);

      expect(serverUpload.uploadFileToServer).toHaveBeenCalledWith(
        mockFile,
        options.serverConfig,
        onProgress
      );
      expect(onUploadSuccess).toHaveBeenCalledWith(uploadResponse.url, mockFile);
      expect(mockEditorView.state.schema.nodes.image.create).toHaveBeenCalledWith({
        src: uploadResponse.url,
        alt: "test.png",
      });
    });

    it("should fallback to base64 when server upload fails", async () => {
      const mockFile = new File(["image content"], "test.png", {
        type: "image/png",
      });

      const uploadError = new Error("Server error");
      (serverUpload.uploadFileToServer as jest.Mock).mockRejectedValue(uploadError);
      (serverUpload.fallbackToBase64 as jest.Mock).mockResolvedValue(
        "data:image/png;base64,mockdata"
      );

      const onUploadError = jest.fn();
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const options: FileUploadOptions = {
        enableServerUpload: true,
        serverConfig: {
          uploadUrl: "https://api.example.com/upload",
        },
        onUploadError,
        fallbackToBase64OnError: true,
      };

      await handleFileUpload(mockEditorView as any, mockFile, options);

      expect(serverUpload.uploadFileToServer).toHaveBeenCalled();
      expect(onUploadError).toHaveBeenCalledWith(uploadError, mockFile);
      expect(consoleSpy).toHaveBeenCalledWith("Server upload failed:", uploadError);
      expect(serverUpload.fallbackToBase64).toHaveBeenCalledWith(mockFile);
      expect(mockEditorView.state.schema.nodes.image.create).toHaveBeenCalledWith({
        src: "data:image/png;base64,mockdata",
        alt: "test.png",
      });

      consoleSpy.mockRestore();
    });

    it("should throw error when server upload fails and fallback is disabled", async () => {
      const mockFile = new File(["image content"], "test.png", {
        type: "image/png",
      });

      const uploadError = new Error("Server error");
      (serverUpload.uploadFileToServer as jest.Mock).mockRejectedValue(uploadError);

      const onUploadError = jest.fn();
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const options: FileUploadOptions = {
        enableServerUpload: true,
        serverConfig: {
          uploadUrl: "https://api.example.com/upload",
        },
        onUploadError,
        fallbackToBase64OnError: false,
      };

      await expect(
        handleFileUpload(mockEditorView as any, mockFile, options)
      ).rejects.toThrow("Server error");

      expect(serverUpload.uploadFileToServer).toHaveBeenCalled();
      expect(onUploadError).toHaveBeenCalledWith(uploadError, mockFile);
      expect(consoleSpy).toHaveBeenCalledWith("Server upload failed:", uploadError);
      expect(serverUpload.fallbackToBase64).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should use base64 when server upload is disabled", async () => {
      const mockFile = new File(["image content"], "test.png", {
        type: "image/png",
      });

      (serverUpload.fallbackToBase64 as jest.Mock).mockResolvedValue(
        "data:image/png;base64,mockdata"
      );

      const options: FileUploadOptions = {
        enableServerUpload: false,
      };

      await handleFileUpload(mockEditorView as any, mockFile, options);

      expect(serverUpload.uploadFileToServer).not.toHaveBeenCalled();
      expect(serverUpload.fallbackToBase64).toHaveBeenCalledWith(mockFile);
      expect(mockEditorView.state.schema.nodes.image.create).toHaveBeenCalledWith({
        src: "data:image/png;base64,mockdata",
        alt: "test.png",
      });
    });

    it("should handle file attachments (non-images)", async () => {
      const mockFile = new File(["pdf content"], "document.pdf", {
        type: "application/pdf",
      });

      const uploadResponse = {
        url: "https://cdn.example.com/document.pdf",
        id: "file-456",
      };

      (serverUpload.uploadFileToServer as jest.Mock).mockResolvedValue(uploadResponse);

      const options: FileUploadOptions = {
        enableServerUpload: true,
        serverConfig: {
          uploadUrl: "https://api.example.com/upload",
        },
      };

      await handleFileUpload(mockEditorView as any, mockFile, options);

      expect(mockEditorView.state.schema.nodes.file.create).toHaveBeenCalledWith({
        src: uploadResponse.url,
        filename: "document.pdf",
        size: 11,
        type: "application/pdf",
      });
    });

    it("should handle missing server config gracefully", async () => {
      const mockFile = new File(["image content"], "test.png", {
        type: "image/png",
      });

      (serverUpload.fallbackToBase64 as jest.Mock).mockResolvedValue(
        "data:image/png;base64,mockdata"
      );

      const options: FileUploadOptions = {
        enableServerUpload: true,
        // serverConfig is missing
      };

      await handleFileUpload(mockEditorView as any, mockFile, options);

      expect(serverUpload.uploadFileToServer).not.toHaveBeenCalled();
      expect(serverUpload.fallbackToBase64).toHaveBeenCalledWith(mockFile);
    });

    it("should work with default options (backward compatibility)", async () => {
      const mockFile = new File(["image content"], "test.png", {
        type: "image/png",
      });

      (serverUpload.fallbackToBase64 as jest.Mock).mockResolvedValue(
        "data:image/png;base64,mockdata"
      );

      // No options provided - should default to base64 behavior
      await handleFileUpload(mockEditorView as any, mockFile);

      expect(serverUpload.uploadFileToServer).not.toHaveBeenCalled();
      expect(serverUpload.fallbackToBase64).toHaveBeenCalledWith(mockFile);
      expect(mockEditorView.state.schema.nodes.image.create).toHaveBeenCalledWith({
        src: "data:image/png;base64,mockdata",
        alt: "test.png",
      });
    });

    it("should handle editor view validation", async () => {
      const mockFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });

      await expect(
        handleFileUpload(null as any, mockFile, {})
      ).rejects.toThrow("No editor view provided");
    });

    it("should handle progress callbacks", async () => {
      const mockFile = new File(["image content"], "test.png", {
        type: "image/png",
      });

      const uploadResponse = {
        url: "https://cdn.example.com/test.png",
      };

      (serverUpload.uploadFileToServer as jest.Mock).mockImplementation(
        async (file, config, onProgress) => {
          // Simulate progress
          if (onProgress) {
            onProgress({ progress: 50, loaded: 50, total: 100 });
            onProgress({ progress: 100, loaded: 100, total: 100 });
          }
          return uploadResponse;
        }
      );

      const onProgress = jest.fn();
      const onUploadSuccess = jest.fn();

      const options: FileUploadOptions = {
        enableServerUpload: true,
        serverConfig: {
          uploadUrl: "https://api.example.com/upload",
        },
        onProgress,
        onUploadSuccess,
      };

      await handleFileUpload(mockEditorView as any, mockFile, options);

      expect(onProgress).toHaveBeenCalledWith({ progress: 50, loaded: 50, total: 100 });
      expect(onProgress).toHaveBeenCalledWith({ progress: 100, loaded: 100, total: 100 });
      expect(onUploadSuccess).toHaveBeenCalledWith(uploadResponse.url, mockFile);
    });
  });
});