# Image Upload System with Cloudinary

## Overview

This module provides secure image upload functionality using Cloudinary as the storage backend. It includes proper authentication, file validation, and database tracking.

## Features

- **Secure Upload**: JWT authentication required for all upload operations
- **File Validation**: Type and size validation for uploaded images
- **Cloudinary Integration**: Efficient streaming uploads to Cloudinary
- **Database Tracking**: Stores upload metadata in the database
- **User Isolation**: Users can only access their own uploads
- **Automatic Optimization**: Cloudinary auto-optimization for performance

## API Endpoints

### Upload Image

- `POST /uploads/image` - Upload a single image file (Authenticated users only)

### Manage Uploads

- `GET /uploads/my-uploads` - Get user's uploaded files (Authenticated users only)
- `DELETE /uploads/:id` - Delete an uploaded file (Authenticated users only)

## File Requirements

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Size Limits

- Maximum file size: 10MB
- Automatic compression and optimization by Cloudinary

## Usage Examples

### Upload an Image

```bash
curl -X POST http://localhost:3000/uploads/image \
  -H "Authorization: Bearer <jwt-token>" \
  -F "image=@/path/to/your/image.jpg"
```

**Response:**

```json
{
  "url": "https://res.cloudinary.com/your-cloud/documents/sample.jpg",
  "publicId": "documents/sample"
}
```

### Get User Uploads

```bash
curl -X GET http://localhost:3000/uploads/my-uploads \
  -H "Authorization: Bearer <jwt-token>"
```

**Response:**

```json
[
  {
    "id": "uuid-here",
    "url": "https://res.cloudinary.com/your-cloud/documents/sample.jpg",
    "publicId": "documents/sample",
    "originalName": "sample.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "uploadedBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Delete an Upload

```bash
curl -X DELETE http://localhost:3000/uploads/uuid-here \
  -H "Authorization: Bearer <jwt-token>"
```

**Response:**

```json
{
  "message": "File deleted successfully"
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Or use CLOUDINARY_URL (alternative)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

## Database Schema

### uploaded_files Table

```sql
- id (UUID, Primary Key)
- url (VARCHAR) - Cloudinary secure URL
- publicId (VARCHAR) - Cloudinary public ID
- originalName (VARCHAR) - Original filename
- size (INTEGER) - File size in bytes
- mimeType (VARCHAR) - MIME type
- uploadedBy (UUID, Foreign Key to users)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

## Security Features

- **JWT Authentication**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own uploads
- **File Validation**: Strict file type and size validation
- **Secure URLs**: Cloudinary provides secure, optimized URLs
- **Automatic Cleanup**: Files are deleted from both Cloudinary and database

## Error Handling

- `400 Bad Request`: Invalid file type, missing file, or file too large
- `401 Unauthorized`: Missing or invalid JWT token
- `500 Internal Server Error`: Cloudinary upload failure or database error

## Integration with Documents

This upload system is designed to work seamlessly with the document management system:

1. **Upload images** using this module
2. **Use the returned URL** in TipTap editor content
3. **Images are automatically optimized** by Cloudinary
4. **Track usage** through the database records

## Best Practices

1. **Always validate files** on the frontend before upload
2. **Use appropriate image sizes** for your use case
3. **Implement proper error handling** in your frontend
4. **Clean up unused uploads** periodically
5. **Monitor Cloudinary usage** to avoid unexpected costs

## Performance Optimizations

- **Streaming uploads** for efficient memory usage
- **Automatic compression** by Cloudinary
- **Format optimization** (WebP when supported)
- **Quality optimization** based on content
- **CDN delivery** through Cloudinary's global network
