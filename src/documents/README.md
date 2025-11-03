# Document Management System - "Science du Travail"

## Overview

This document management system allows secretaries to create document templates using TipTap content, and students to fill out and save their own personalized versions of these templates.

## Features

- **Template Management**: Secretaries can create, view, and delete document templates
- **Document Instances**: Students can fill out templates and save their personalized versions
- **User Association**: Each document instance is linked to a specific user
- **JWT Authentication**: Secure API endpoints with JWT token validation
- **CRUD Operations**: Full create, read, update, delete functionality

## Database Models

### DocumentTemplate

- `id`: UUID primary key
- `title`: Template title
- `content`: TipTap JSON content
- `createdById`: Foreign key to Users table
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### DocumentInstance

- `id`: UUID primary key
- `templateId`: Foreign key to DocumentTemplate
- `userId`: Foreign key to Users table
- `filledContent`: User's filled content (JSON)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## API Endpoints

### Template Management

- `POST /documents/templates` - Create a new template (**Secretary only**)
- `GET /documents/templates` - Get all templates (Public)
- `GET /documents/templates/:id` - Get template by ID (Public)
- `DELETE /documents/templates/:id` - Delete template (**Secretary only**)

### Document Instances

- `POST /documents/instances` - Fill out a template (Authenticated users)
- `GET /documents/instances/my` - Get user's document instances (Authenticated users)
- `GET /documents/instances/:id` - Get specific document instance (Authenticated users)
- `PUT /documents/instances/:id` - Update document instance (Authenticated users)
- `DELETE /documents/instances/:id` - Delete document instance (Authenticated users)

## Usage Examples

### Creating a Template (Secretary)

```bash
POST /documents/templates
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Employee Evaluation Form",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "Employee Evaluation" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Please fill out the following evaluation form." }]
      }
    ]
  }
}
```

### Filling a Document (Student)

```bash
POST /documents/instances
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "templateId": "template-uuid-here",
  "filledContent": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "Employee Evaluation" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "I have completed my evaluation and rate my performance as excellent." }]
      }
    ]
  }
}
```

### Getting User's Documents

```bash
GET /documents/instances/my
Authorization: Bearer <jwt-token>
```

## Security

- All instance operations require JWT authentication
- Users can only access their own document instances
- **Template creation and deletion are restricted to secretaries only**
- Template viewing is public for students to see available templates
- Role-based access control using `JwtAuthGuardAsSecretary` for template management

## Integration with Frontend

The system is designed to work with TipTap editor on the frontend:

1. Secretaries create templates using TipTap editor
2. Students view available templates and select one to fill
3. Students use TipTap editor to fill out the template
4. Filled content is saved as a document instance

## Error Handling

- `404 Not Found`: Template or document instance not found
- `401 Unauthorized`: Missing or invalid JWT token
- `400 Bad Request`: Invalid request data
- `403 Forbidden`: User doesn't have permission for the operation
