# Document Management System Implementation Guide

## 🎯 Overview

This guide covers the complete implementation of the "Science du Travail" document management system using NestJS, Sequelize ORM, and TypeScript.

## 📁 Files Created

### Models

- `src/models/model.documenttemplate.ts` - Document template model
- `src/models/model.documentinstance.ts` - Document instance model
- Updated `src/models/model.users.ts` - Added relationships

### DTOs

- `src/documents/dto/create-template.dto.ts` - Template creation validation
- `src/documents/dto/fill-document.dto.ts` - Document filling validation

### Service & Controller

- `src/documents/documents.service.ts` - Business logic
- `src/documents/documents.controller.ts` - REST API endpoints
- `src/documents/documents.module.ts` - Module configuration

### Documentation

- `src/documents/swagger.documents.ts` - Swagger API documentation
- `src/documents/README.md` - API usage guide
- `create-document-tables.sql` - Database migration script

## 🚀 Setup Instructions

### 1. Database Setup

Run the SQL migration script to create the required tables:

```bash
psql -U your_username -d your_database -f create-document-tables.sql
```

### 2. Environment Variables

Ensure your `.env` file has the required database configuration:

```env
APP_BD_HOST=localhost
APP_BD_PORT=5432
APP_BD_USERNAME=your_username
APP_BD_PASSWORD=your_password
APP_BD_NAME=your_database
```

### 3. Install Dependencies

The system uses existing dependencies from your NestJS project:

- `@nestjs/common`
- `@nestjs/sequelize`
- `sequelize-typescript`
- `class-validator`
- `@nestjs/swagger`

### 4. Start the Application

```bash
npm run start:dev
```

## 🔧 API Endpoints

### Template Management (Secretary)

- `POST /documents/templates` - Create template
- `GET /documents/templates` - List all templates
- `GET /documents/templates/:id` - Get template by ID
- `DELETE /documents/templates/:id` - Delete template

### Document Instances (Students)

- `POST /documents/instances` - Fill out template
- `GET /documents/instances/my` - Get user's documents
- `GET /documents/instances/:id` - Get specific document
- `PUT /documents/instances/:id` - Update document
- `DELETE /documents/instances/:id` - Delete document

## 🔐 Authentication

All instance operations require JWT authentication. The system uses the existing `JwtGuard` from your project.

## 📊 Database Schema

### document_templates

```sql
- id (UUID, Primary Key)
- title (VARCHAR)
- content (JSONB)
- createdById (UUID, Foreign Key to users)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### document_instances

```sql
- id (UUID, Primary Key)
- templateId (UUID, Foreign Key to document_templates)
- userId (UUID, Foreign Key to users)
- filledContent (JSONB)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

## 🎨 Frontend Integration

### TipTap Editor Integration

The system is designed to work with TipTap editor:

1. **Template Creation (Secretary)**:

   ```javascript
   // Send template content from TipTap editor
   const templateData = {
     title: 'Employee Evaluation Form',
     content: editor.getJSON(), // TipTap JSON content
   };
   ```

2. **Document Filling (Student)**:

   ```javascript
   // Load template content into TipTap editor
   const template = await fetchTemplate(templateId);
   editor.commands.setContent(template.content);

   // Save filled content
   const filledData = {
     templateId: templateId,
     filledContent: editor.getJSON(),
   };
   ```

## 🔍 Testing the API

### Create a Template

```bash
curl -X POST http://localhost:3000/documents/templates \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Employee Evaluation Form",
    "content": {
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": {"level": 1},
          "content": [{"type": "text", "text": "Employee Evaluation"}]
        }
      ]
    }
  }'
```

### Fill a Document

```bash
curl -X POST http://localhost:3000/documents/instances \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "TEMPLATE_UUID",
    "filledContent": {
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": {"level": 1},
          "content": [{"type": "text", "text": "My Evaluation"}]
        }
      ]
    }
  }'
```

## 🛡️ Security Features

- JWT authentication for all instance operations
- User isolation (users can only access their own documents)
- Template ownership validation
- Input validation using class-validator
- SQL injection protection through Sequelize ORM

## 📈 Performance Optimizations

- Database indexes on foreign keys and timestamps
- Efficient queries with proper includes
- JSONB storage for flexible content structure
- Cascade delete for data consistency

## 🔄 Error Handling

The system includes comprehensive error handling:

- 404 for not found resources
- 401 for authentication failures
- 400 for validation errors
- Proper error messages in French/English

## 📝 Next Steps

1. Run the database migration
2. Test the API endpoints
3. Integrate with your frontend TipTap editor
4. Add role-based access control if needed
5. Implement file upload for document attachments
6. Add document versioning if required

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors**: Check your environment variables
2. **JWT token issues**: Verify your authentication setup
3. **Model not found**: Ensure models are properly imported in app.module.ts
4. **Validation errors**: Check DTO validation rules

### Debug Mode

Enable Sequelize logging by setting `logging: true` in your database configuration.

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [TipTap Editor](https://tiptap.dev/)
- [Class Validator](https://github.com/typestack/class-validator)
