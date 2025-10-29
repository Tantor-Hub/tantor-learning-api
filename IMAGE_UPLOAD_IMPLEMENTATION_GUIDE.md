# Image Upload System Implementation Guide

## 🎯 Overview

Complete implementation of a secure image upload system using NestJS, Cloudinary, and Sequelize ORM with JWT authentication.

## 📁 Files Created

### Models

- `src/models/model.uploadedfile.ts` - UploadedFile model for tracking uploads

### Uploads Module

- `src/uploads/uploads.service.ts` - Cloudinary integration and business logic
- `src/uploads/uploads.controller.ts` - REST API endpoints with authentication
- `src/uploads/uploads.module.ts` - Module configuration with Multer
- `src/uploads/README.md` - Comprehensive API documentation

### Database

- `create-uploaded-files-table.sql` - Database migration script

## 🚀 Setup Instructions

### 1. Install Required Dependencies

```bash
npm install cloudinary multer @nestjs/platform-express
npm install --save-dev @types/multer
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Or use CLOUDINARY_URL (alternative)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 3. Database Setup

Run the migration script:

```bash
psql -U your_username -d your_database -f create-uploaded-files-table.sql
```

### 4. Start the Application

```bash
npm run start:dev
```

## 🔧 API Endpoints

### Upload Image

- **POST** `/uploads/image` - Upload single image file
- **Authentication**: JWT required
- **Content-Type**: `multipart/form-data`
- **Field Name**: `image`

### Manage Uploads

- **GET** `/uploads/my-uploads` - Get user's uploads
- **DELETE** `/uploads/:id` - Delete specific upload
- **Authentication**: JWT required for all

## 📊 Database Schema

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

## 🔐 Security Features

- **JWT Authentication**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own uploads
- **File Validation**: Strict type and size validation
- **Secure Storage**: Cloudinary provides secure, optimized URLs
- **Automatic Cleanup**: Files deleted from both Cloudinary and database

## 🎨 Frontend Integration

### Upload Image (JavaScript/TypeScript)

```javascript
const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/uploads/image', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
};
```

### Upload Image (React with TipTap)

```jsx
import { useEditor } from '@tiptap/react';

const ImageUpload = ({ editor }) => {
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/uploads/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const { url } = await response.json();

      // Insert image into TipTap editor
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleImageUpload(e.target.files[0])}
    />
  );
};
```

## 🔍 Testing the API

### Upload an Image

```bash
curl -X POST http://localhost:3000/uploads/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

**Expected Response:**

```json
{
  "url": "https://res.cloudinary.com/your-cloud/documents/sample.jpg",
  "publicId": "documents/sample"
}
```

### Get User Uploads

```bash
curl -X GET http://localhost:3000/uploads/my-uploads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete an Upload

```bash
curl -X DELETE http://localhost:3000/uploads/UPLOAD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛡️ Error Handling

The system includes comprehensive error handling:

- **400 Bad Request**: Invalid file type, missing file, or file too large
- **401 Unauthorized**: Missing or invalid JWT token
- **500 Internal Server Error**: Cloudinary upload failure or database error

## 📈 Performance Optimizations

- **Streaming Uploads**: Uses Node.js streams for efficient memory usage
- **Automatic Compression**: Cloudinary optimizes images automatically
- **Format Optimization**: Delivers WebP when supported by browser
- **Quality Optimization**: Adjusts quality based on content
- **CDN Delivery**: Global content delivery network

## 🔄 Integration with Document System

This upload system integrates seamlessly with the document management system:

1. **Upload images** using the uploads API
2. **Use returned URLs** in TipTap editor content
3. **Images are automatically optimized** by Cloudinary
4. **Track usage** through database records
5. **Clean up unused images** when documents are deleted

## 📝 File Requirements

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Size Limits

- Maximum file size: 10MB
- Automatic compression and optimization by Cloudinary

## 🆘 Troubleshooting

### Common Issues

1. **Cloudinary Configuration Error**:

   - Check environment variables
   - Verify Cloudinary credentials
   - Ensure CLOUDINARY_URL format is correct

2. **File Upload Fails**:

   - Check file size (max 10MB)
   - Verify file type is supported
   - Ensure JWT token is valid

3. **Database Errors**:
   - Run the migration script
   - Check database connection
   - Verify model relationships

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Multer Documentation](https://github.com/expressjs/multer)
- [TipTap Image Extension](https://tiptap.dev/api/nodes/image)

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] Database migration run
- [ ] Cloudinary account set up
- [ ] File size limits appropriate for your use case
- [ ] Error handling implemented in frontend
- [ ] Image cleanup strategy in place
- [ ] CDN configuration optimized
- [ ] Security headers configured
- [ ] Rate limiting implemented (if needed)
- [ ] Monitoring and logging set up
