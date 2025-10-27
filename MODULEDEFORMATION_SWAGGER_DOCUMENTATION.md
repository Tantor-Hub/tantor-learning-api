# ModuleDeFormation Swagger Documentation

## Overview

The ModuleDeFormation API provides endpoints for managing training modules. Each module can have a description and an attached file (piece_jointe) stored on Google Drive.

## API Endpoints

### Base URL

```
/api/moduledeformation
```

## Endpoints

### 1. Create Training Module

**POST** `/api/moduledeformation`

Creates a new training module with optional description and required attachment file.

#### Authentication

- **Required**: Admin role only
- **Guard**: `JwtAuthGuardAsManagerSystem`

#### Request

- **Content-Type**: `multipart/form-data`
- **Body**:
  - `description` (optional): String, max 500 characters
  - `piece_jointe` (required): File upload, max 10MB

#### Request Example

```bash
curl -X POST "http://localhost:3000/api/moduledeformation" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -F "description=Introduction to Web Development" \
  -F "piece_jointe=@/path/to/file.pdf"
```

#### Response Examples

**Success (201)**

```json
{
  "status": 201,
  "message": "Training module created successfully",
  "data": {
    "description": "Introduction to Web Development",
    "piece_jointe": "https://drive.google.com/file/d/example/view"
  }
}
```

**Error Responses**

- **400**: Bad request - Invalid input data
- **401**: Unauthorized - Admin access required
- **413**: File too large - Maximum file size is 10MB
- **500**: Internal server error

### 2. Get All Training Modules

**GET** `/api/moduledeformation`

Retrieves all training modules with their descriptions and attachment links.

#### Authentication

- **Required**: None (publicly accessible)

#### Response Example

```json
{
  "status": 200,
  "message": "Training modules retrieved successfully",
  "data": {
    "length": 3,
    "rows": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "description": "Introduction to Web Development",
        "piece_jointe": "https://drive.google.com/file/d/example1/view"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "description": "Advanced React Development",
        "piece_jointe": "https://drive.google.com/file/d/example2/view"
      }
    ]
  }
}
```

### 3. Update Training Module

**PATCH** `/api/moduledeformation/:id`

Updates an existing training module's description and/or attachment file.

#### Authentication

- **Required**: Admin role only
- **Guard**: `JwtAuthGuardAsManagerSystem`

#### Parameters

- `id` (path): Training module UUID

#### Request

- **Content-Type**: `multipart/form-data`
- **Body**:
  - `description` (optional): String, max 500 characters
  - `piece_jointe` (optional): File upload, max 10MB

#### Request Example

```bash
curl -X PATCH "http://localhost:3000/api/moduledeformation/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -F "description=Updated Introduction to Web Development" \
  -F "piece_jointe=@/path/to/updated-file.pdf"
```

#### Response Examples

**Success (200)**

```json
{
  "status": 200,
  "message": "Training module updated successfully",
  "data": {
    "description": "Updated Introduction to Web Development",
    "piece_jointe": "https://drive.google.com/file/d/updated-example/view"
  }
}
```

**Error Responses**

- **400**: Bad request - Invalid input data
- **401**: Unauthorized - Admin access required
- **404**: Training module not found
- **413**: File too large - Maximum file size is 10MB
- **500**: Internal server error

## Data Models

### ModuleDeFormation

```typescript
interface ModuleDeFormation {
  id: string; // UUID primary key
  description?: string; // Optional description (max 500 chars)
  piece_jointe: string; // Google Drive file URL
}
```

### CreateModuleDeFormationDto

```typescript
interface CreateModuleDeFormationDto {
  description?: string; // Optional description (max 500 chars)
}
```

### UpdateModuleDeFormationDto

```typescript
interface UpdateModuleDeFormationDto {
  description?: string; // Optional description (max 500 chars)
  piece_jointe?: string; // Optional Google Drive file URL
}
```

### ModuleDeFormationUpdateResponseDto

```typescript
interface ModuleDeFormationUpdateResponseDto {
  description?: string; // Optional description (max 500 chars)
  piece_jointe: string; // Google Drive file URL
}
```

## File Upload Specifications

### Supported File Types

- Any file type is supported
- Files are uploaded to Google Drive
- Maximum file size: 10MB

### File Processing

1. File is uploaded via multipart/form-data
2. File is processed and uploaded to Google Drive
3. Google Drive URL is stored in the database
4. Original file name and metadata are preserved

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "status": 400,
  "message": "Validation failed",
  "data": {
    "message": ["description must be a string"]
  }
}
```

#### 401 Unauthorized

```json
{
  "status": 401,
  "message": "La clé d'authentification fournie n'a pas les droits requis pour accéder à ces ressources"
}
```

#### 404 Not Found

```json
{
  "status": 404,
  "message": "Training module not found",
  "data": "ModuleDeFormation not found"
}
```

#### 413 Payload Too Large

```json
{
  "status": 413,
  "message": "File too large",
  "data": "Maximum file size allowed is 10MB"
}
```

#### 500 Internal Server Error

```json
{
  "status": 500,
  "message": "Internal server error while creating training module",
  "data": {
    "errorType": "SequelizeDatabaseError",
    "errorMessage": "Error message",
    "timestamp": "2025-01-25T10:00:00.000Z"
  }
}
```

## Security Considerations

### Authentication

- Create operations require admin authentication
- Read operations are publicly accessible
- JWT tokens are required for protected endpoints

### File Upload Security

- File size limit: 10MB
- Files are stored on Google Drive (secure cloud storage)
- No direct file access to server filesystem

### Data Validation

- Description field has a maximum length of 500 characters
- UUID validation for ID parameters
- File type validation (any type allowed)

## Usage Examples

### Frontend Integration

#### React/JavaScript Example

```javascript
// Create a new training module
const createModule = async (description, file) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('piece_jointe', file);

  const response = await fetch('/api/moduledeformation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: formData,
  });

  return response.json();
};

// Get all training modules
const getAllModules = async () => {
  const response = await fetch('/api/moduledeformation');
  return response.json();
};

// Update a training module
const updateModule = async (id, description, file) => {
  const formData = new FormData();
  if (description) formData.append('description', description);
  if (file) formData.append('piece_jointe', file);

  const response = await fetch(`/api/moduledeformation/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: formData,
  });

  return response.json();
};
```

### cURL Examples

#### Create Module

```bash
curl -X POST "http://localhost:3000/api/moduledeformation" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -F "description=Introduction to Web Development" \
  -F "piece_jointe=@/path/to/training-material.pdf"
```

#### Get All Modules

```bash
curl -X GET "http://localhost:3000/api/moduledeformation"
```

#### Update Module

```bash
curl -X PATCH "http://localhost:3000/api/moduledeformation/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -F "description=Updated Introduction to Web Development" \
  -F "piece_jointe=@/path/to/updated-training-material.pdf"
```

## Testing

### Test Cases

1. **Create Module (Admin)**

   - Valid description and file
   - Empty description with file
   - File too large (>10MB)
   - No authentication
   - Non-admin authentication

2. **Get All Modules**

   - Empty database
   - Multiple modules
   - Database error

3. **Update Module (Admin)**
   - Update description only
   - Update file only
   - Update both description and file
   - No authentication
   - Non-admin authentication
   - Non-existent module ID
   - File too large (>10MB)
   - Invalid UUID format

### Postman Collection

Import the following collection for testing:

```json
{
  "info": {
    "name": "ModuleDeFormation API",
    "description": "Training module management API"
  },
  "item": [
    {
      "name": "Create Training Module",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{adminToken}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "description",
              "value": "Test Training Module",
              "type": "text"
            },
            {
              "key": "piece_jointe",
              "type": "file",
              "src": "/path/to/test-file.pdf"
            }
          ]
        },
        "url": {
          "raw": "{{baseUrl}}/api/moduledeformation",
          "host": ["{{baseUrl}}"],
          "path": ["api", "moduledeformation"]
        }
      }
    }
  ]
}
```

## Swagger UI

Access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

The ModuleDeFormation endpoints will be available under the "Module De Formation" tag.
