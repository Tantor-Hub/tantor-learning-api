# Cloudflare 524 Timeout Fix - Implementation Guide

## Problem
Cloudflare error 524 occurs when the backend takes longer than Cloudflare's timeout limit (100 seconds for free plans, 600 seconds for paid plans) to respond. This commonly happens with large file uploads.

## Backend Solutions Implemented

### 1. Automatic Async Uploads
- Files > 50MB automatically use Cloudinary's async upload mode
- This prevents blocking the request and avoids Cloudflare timeout
- The upload continues in the background on Cloudinary's servers

### 2. Keep-Alive Headers
- Added keep-alive headers to maintain connection during long uploads
- Extended timeout to 10 minutes (600 seconds) for upload endpoints
- Connection is kept alive to prevent premature disconnection

### 3. Chunked Uploads
- Files > 30MB use chunked uploads (20MB chunks)
- Improves reliability and allows progress tracking

## Frontend Solutions

### Option 1: Direct Cloudinary Upload (Recommended)
Upload files directly from the frontend to Cloudinary, bypassing your backend entirely. This completely avoids Cloudflare timeout issues.

```typescript
// Install: npm install cloudinary
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary in your frontend
cloudinary.config({
  cloud_name: 'YOUR_CLOUD_NAME',
  upload_preset: 'YOUR_UPLOAD_PRESET', // Create unsigned preset in Cloudinary dashboard
});

// Upload file directly from frontend
async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'YOUR_UPLOAD_PRESET');
  formData.append('folder', '__tantorLearning/documents');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const result = await response.json();
  return result.secure_url; // Use this URL as piece_jointe
}

// Then send only the URL to your backend
async function createLessonDocument(fileUrl: string, lessonId: string) {
  const response = await fetch('/api/lessondocument/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_lesson: lessonId,
      piece_jointe: fileUrl, // URL from Cloudinary
      title: 'Document Title',
      description: 'Document Description',
    }),
  });
  return response.json();
}
```

### Option 2: Chunked Upload with Progress
Implement chunked uploads on the frontend for better control and progress tracking.

```typescript
async function uploadFileInChunks(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = generateUploadId();

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('uploadId', uploadId);
    formData.append('fileName', file.name);

    const response = await fetch('/api/lessondocument/upload-chunk', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Chunk ${chunkIndex} upload failed`);
    }

    const progress = ((chunkIndex + 1) / totalChunks) * 100;
    onProgress?.(progress);
  }

  // Finalize upload
  const finalizeResponse = await fetch('/api/lessondocument/finalize-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ uploadId }),
  });

  const result = await finalizeResponse.json();
  return result.piece_jointe;
}
```

### Option 3: Handle Timeout Gracefully
Add timeout handling and retry logic in your frontend.

```typescript
async function uploadWithRetry(
  file: File,
  maxRetries = 3
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 95000); // 95 seconds (before Cloudflare timeout)

  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('id_lesson', lessonId);

    const response = await fetch('/api/lessondocument/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      // Timeout occurred, show user-friendly message
      throw new Error('Upload is taking longer than expected. Please wait or try again.');
    }
    
    throw error;
  }
}
```

### Option 4: Show Upload Progress
Display progress to users so they know the upload is working.

```typescript
async function uploadWithProgress(
  file: File,
  onProgress: (progress: number) => void
): Promise<any> {
  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'));
    });

    xhr.timeout = 600000; // 10 minutes
    xhr.open('POST', '/api/lessondocument/create');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('id_lesson', lessonId);
    
    xhr.send(formData);
  });
}

// Usage
uploadWithProgress(file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
  // Update UI progress bar
});
```

## Recommended Approach

**For production, use Option 1 (Direct Cloudinary Upload)** because:
1. ✅ Completely bypasses Cloudflare timeout
2. ✅ Faster uploads (direct to Cloudinary)
3. ✅ Less server load
4. ✅ Better user experience
5. ✅ Built-in progress tracking

Then send only the Cloudinary URL to your backend to create the lesson document record.

## Cloudflare Configuration (If you have access)

If you have Cloudflare Pro or higher:
1. Go to Cloudflare Dashboard → Speed → Optimization
2. Increase "Origin Timeout" to 600 seconds
3. Enable "Keep-Alive Connections"

## Testing

Test with files of different sizes:
- Small files (< 30MB): Should work normally
- Medium files (30-50MB): Uses chunked upload
- Large files (> 50MB): Uses async upload + keep-alive headers

