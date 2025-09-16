# Server File Upload Configuration Guide

The Kel RTE component now supports server-side file uploads, allowing you to store files in cloud storage or your own server instead of embedding them as base64 data. This is essential for production applications and cloud storage integration.

## Quick Start

### Basic Server Upload Setup

```tsx
import { RTE, createCloudStorageConfig } from "@kel-app/rte";

// For AWS S3
const uploadConfig = createCloudStorageConfig('aws', {
  uploadUrl: 'https://your-upload-endpoint.com/upload',
  apiKey: 'your-api-key'
});

export default function MyEditor() {
  return (
    <RTE 
      themeSwitch={true}
      enableServerUpload={true}
      uploadConfig={uploadConfig}
      onFileUploadSuccess={(url, file) => {
        console.log('File uploaded:', file.name, 'at', url);
      }}
      onFileUploadError={(error, file) => {
        console.error('Upload failed:', file.name, error);
      }}
    />
  );
}
```

### Environment Variable Configuration

Create a `.env` file in your project root:

```env
# Upload endpoint
RTE_UPLOAD_URL=https://api.example.com/upload

# API authentication
RTE_API_KEY=your-secret-api-key

# File size limit (in bytes)
RTE_MAX_FILE_SIZE=10485760

# Upload timeout (in milliseconds)
RTE_UPLOAD_TIMEOUT=30000

# Enable progress tracking
RTE_ENABLE_PROGRESS=true

# Allowed file types (comma-separated)
RTE_ALLOWED_TYPES=image/*,application/pdf,text/*

# Custom headers (JSON string)
RTE_CUSTOM_HEADERS={"X-Custom-Header": "value"}
```

## Configuration Options

### ServerUploadConfig Interface

```typescript
interface ServerUploadConfig {
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
```

### RTE Component Props

```typescript
interface RTEProps {
  themeSwitch: boolean;
  defaultValue?: string;
  
  // Server upload configuration
  uploadConfig?: ServerUploadConfig;
  enableServerUpload?: boolean;
  
  // Upload event callbacks
  onFileUploadStart?: (file: File) => void;
  onFileUploadProgress?: (progress: UploadProgress) => void;
  onFileUploadSuccess?: (url: string, file: File) => void;
  onFileUploadError?: (error: Error, file: File) => void;
}
```

## Cloud Storage Providers

### AWS S3

```tsx
import { createCloudStorageConfig } from "@kel-app/rte";

const awsConfig = createCloudStorageConfig('aws', {
  uploadUrl: 'https://your-bucket.s3.amazonaws.com/upload',
  apiKey: process.env.AWS_ACCESS_KEY_ID,
  headers: {
    'x-amz-acl': 'public-read'
  }
});
```

### Google Cloud Storage

```tsx
const gcpConfig = createCloudStorageConfig('gcp', {
  uploadUrl: 'https://storage.googleapis.com/upload/storage/v1/b/your-bucket/o',
  apiKey: process.env.GCP_API_KEY
});
```

### Azure Blob Storage

```tsx
const azureConfig = createCloudStorageConfig('azure', {
  uploadUrl: 'https://youraccount.blob.core.windows.net/container',
  apiKey: process.env.AZURE_STORAGE_KEY
});
```

### Cloudinary

```tsx
const cloudinaryConfig = createCloudStorageConfig('cloudinary', {
  uploadUrl: 'https://api.cloudinary.com/v1_1/your-cloud/upload',
  apiKey: process.env.CLOUDINARY_API_KEY
});
```

### Custom Server

```tsx
const customConfig = createCloudStorageConfig('custom', {
  uploadUrl: 'https://your-api.com/files/upload',
  apiKey: 'your-custom-key',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/*', 'application/pdf'],
  headers: {
    'X-Custom-Auth': 'bearer-token'
  }
});
```

## Advanced Usage

### Progress Tracking

```tsx
function MyEditor() {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleProgress = useCallback((progress: UploadProgress) => {
    setUploadProgress(prev => ({
      ...prev,
      [file.name]: progress.progress
    }));
  }, []);

  return (
    <div>
      {/* Progress indicators */}
      {Object.entries(uploadProgress).map(([filename, progress]) => (
        <div key={filename} className="progress-bar">
          <span>{filename}</span>
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>
      ))}
      
      <RTE 
        themeSwitch={true}
        enableServerUpload={true}
        uploadConfig={uploadConfig}
        onFileUploadProgress={handleProgress}
      />
    </div>
  );
}
```

### Error Handling

```tsx
function MyEditor() {
  const handleUploadError = useCallback((error: Error, file: File) => {
    if (error.message.includes('File size')) {
      toast.error(`File "${file.name}" is too large`);
    } else if (error.message.includes('not allowed')) {
      toast.error(`File type "${file.type}" is not supported`);
    } else {
      toast.error(`Upload failed: ${error.message}`);
    }
  }, []);

  return (
    <RTE 
      themeSwitch={true}
      enableServerUpload={true}
      uploadConfig={uploadConfig}
      onFileUploadError={handleUploadError}
    />
  );
}
```

### Conditional Upload Strategy

```tsx
function MyEditor() {
  const [useServerUpload, setUseServerUpload] = useState(true);
  
  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={useServerUpload}
          onChange={(e) => setUseServerUpload(e.target.checked)}
        />
        Enable cloud storage
      </label>
      
      <RTE 
        themeSwitch={true}
        enableServerUpload={useServerUpload}
        uploadConfig={useServerUpload ? uploadConfig : undefined}
      />
    </div>
  );
}
```

## Server Implementation Examples

### Node.js/Express Example

```javascript
const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const upload = multer({ memory: true });
const s3 = new S3Client({ region: 'us-east-1' });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const key = `uploads/${Date.now()}-${file.originalname}`;
    
    await s3.send(new PutObjectCommand({
      Bucket: 'your-bucket',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }));
    
    const url = `https://your-bucket.s3.amazonaws.com/${key}`;
    
    res.json({
      url,
      id: key,
      metadata: {
        filename: file.originalname,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Next.js API Route Example

```typescript
// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3Client({ region: process.env.AWS_REGION });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const buffer = await fs.readFile(file.filepath);
    const key = `uploads/${Date.now()}-${file.originalFilename}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
    }));

    const url = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${key}`;

    res.json({
      url,
      id: key,
      metadata: {
        filename: file.originalFilename,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## Backward Compatibility

The server upload feature is fully backward compatible:

- **Default behavior**: Files are still stored as base64 by default
- **Existing code**: No changes required to existing implementations
- **Graceful fallback**: If server upload fails, it automatically falls back to base64 (configurable)

```tsx
// This still works exactly as before
<RTE themeSwitch={true} />

// This enables server upload with fallback
<RTE 
  themeSwitch={true} 
  enableServerUpload={true}
  uploadConfig={uploadConfig}
/>
```

## Security Considerations

1. **API Key Protection**: Never expose API keys in client-side code
2. **File Type Validation**: Always validate file types on both client and server
3. **Size Limits**: Set reasonable file size limits
4. **Rate Limiting**: Implement rate limiting on your upload endpoint
5. **Authentication**: Secure your upload endpoint with proper authentication
6. **Virus Scanning**: Consider implementing virus scanning for uploaded files

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your upload endpoint has proper CORS headers
2. **File Size Limits**: Check both client and server size limits
3. **Timeout Issues**: Increase timeout for large file uploads
4. **Authentication Errors**: Verify API keys and headers

### Debug Mode

Enable debug logging:

```tsx
const uploadConfig = {
  uploadUrl: 'https://api.example.com/upload',
  apiKey: 'your-key',
  // Add debug header
  headers: {
    'X-Debug': 'true'
  }
};
```

Monitor browser network tab and server logs for detailed error information.

## Migration Guide

### From Base64 to Server Upload

1. **Set up your upload endpoint** (see server examples above)
2. **Configure environment variables**
3. **Update your RTE component**:

```tsx
// Before
<RTE themeSwitch={true} />

// After
<RTE 
  themeSwitch={true}
  enableServerUpload={true}
  uploadConfig={{
    uploadUrl: process.env.NEXT_PUBLIC_UPLOAD_URL,
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
  }}
/>
```

4. **Test thoroughly** with various file types and sizes
5. **Monitor upload performance** and adjust configuration as needed

The RTE component will automatically handle the transition, with base64 fallback ensuring no functionality is lost during migration.