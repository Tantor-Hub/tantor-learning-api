# Swagger Response Schemas

This directory contains reusable response schemas for consistent API documentation across all controllers.

## 📁 File Structure

- `swagger.responses.ts` - Common response schemas for all entities
- `swagger.config.ts` - Main swagger configuration
- Individual controller swagger files - Controller-specific configurations

## 🚀 Usage in Controllers

### Import Response Schemas

```typescript
import {
  UserResponse,
  DocumentResponse,
  LessonResponse,
  SuccessResponse,
  ErrorResponse,
} from '../swagger';
```

### Use in Controller Methods

```typescript
@ApiResponse({
  status: 200,
  description: 'List of documents for the lesson',
  schema: {
    example: {
      status: 200,
      data: [
        {
          id: 1,
          title: 'Course Material',
          description: 'PDF document',
          id_lesson: 1,
          piece_jointe: 'https://drive.google.com/file/d/...',
          type: 'pdf',
          createdAt: '2025-01-15T10:30:00.000Z',
          updatedAt: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  },
})
```

### Available Response Schemas

#### Common Schemas

- `SuccessResponse` - Standard success response
- `ErrorResponse` - Standard error response

#### Entity Schemas

- `UserResponse` - User entity response
- `DocumentResponse` - Document entity response
- `LessonResponse` - Lesson entity response
- `CourseResponse` - Course entity response
- `FormationResponse` - Formation entity response
- `SessionResponse` - Session entity response
- `SessionDocumentResponse` - Session document response
- `ModuleDeFormationResponse` - Module de formation response
- `NewsletterResponse` - Newsletter subscription response

#### Stripe Schemas

- `PaymentIntentResponse` - Payment intent response
- `PaymentConfirmationResponse` - Payment confirmation response
- `OPCOPaymentResponse` - OPCO payment response
- `OPCOProcessResponse` - OPCO process response

## 📝 Best Practices

1. **Import from swagger folder**: Always import response schemas from the swagger folder
2. **Use consistent structure**: Follow the established response format with `status`, `data`, and `message` fields
3. **Keep schemas updated**: Update response schemas when entity models change
4. **Use proper examples**: Provide realistic example data in schema examples

## 🔧 Example Controller Implementation

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { DocumentResponse } from '../swagger';

@Controller('documents')
export class DocumentController {
  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
    type: DocumentResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async findOne(@Param('id') id: string) {
    // Implementation
  }
}
```

## 📋 Response Format Standards

All API responses should follow this consistent format:

```typescript
{
  status: 200,
  message: 'Operation completed successfully',
  data: { /* entity data */ }
}
```

For error responses:

```typescript
{
  status: 400,
  message: 'Bad Request',
  error: 'Detailed error description'
}
```
