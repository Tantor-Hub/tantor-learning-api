import { ApiProperty } from '@nestjs/swagger';

// Common Response Schemas
export class SuccessResponse {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  status: number;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Response message',
  })
  message: string;
}

export class ErrorResponse {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  status: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Detailed error description',
    required: false,
  })
  error?: string;
}

// User Response Schemas
export class UserResponse {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  id: number;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  lastName: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Address',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: 'France',
    description: 'Country',
    required: false,
  })
  country?: string;

  @ApiProperty({
    example: 'Paris',
    description: 'City',
    required: false,
  })
  city?: string;

  @ApiProperty({
    example: 123456789,
    description: 'Phone number',
    required: false,
  })
  phone?: number;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

// Document Response Schemas
export class DocumentResponse {
  @ApiProperty({
    example: 1,
    description: 'Document ID',
  })
  id: number;

  @ApiProperty({
    example: 'Course Material',
    description: 'Document title',
  })
  nom: string;

  @ApiProperty({
    example: 'https://drive.google.com/file/d/...',
    description: 'Document URL or file path',
  })
  url: string;

  @ApiProperty({
    example: 'pdf',
    description: 'Document type',
  })
  type: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the lesson this document belongs to',
  })
  id_lesson: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who created it',
    required: false,
  })
  createdBy?: number;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

// Lesson Response Schemas
export class LessonResponse {
  @ApiProperty({
    example: 1,
    description: 'Lesson ID',
  })
  id: number;

  @ApiProperty({
    example: 'Introduction to JavaScript',
    description: 'Lesson title',
  })
  title: string;

  @ApiProperty({
    example: 'Learn the basics of JavaScript programming',
    description: 'Lesson description',
  })
  description: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the course this lesson belongs to',
  })
  id_cours: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

// Course Response Schemas
export class CourseResponse {
  @ApiProperty({
    example: 1,
    description: 'Course ID',
  })
  id: number;

  @ApiProperty({
    example: 'JavaScript Fundamentals',
    description: 'Course title',
  })
  title: string;

  @ApiProperty({
    example: 'Complete JavaScript development course',
    description: 'Course description',
  })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the formation this course belongs to',
  })
  id_formation: number;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of formateur IDs',
  })
  id_formateurs: number[];

  @ApiProperty({
    example: true,
    description: 'Whether the course is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

// Formation Response Schemas
export class FormationResponse {
  @ApiProperty({
    example: 1,
    description: 'Formation ID',
  })
  id: number;

  @ApiProperty({
    example: 'JavaScript Development',
    description: 'Formation title',
  })
  title: string;

  @ApiProperty({
    example: 'Complete JavaScript development course',
    description: 'Formation description',
  })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the category this formation belongs to',
  })
  id_category: number;

  @ApiProperty({
    example: 1500,
    description: 'Formation price',
  })
  prix: number;

  @ApiProperty({
    example: 40,
    description: 'Duration in hours',
  })
  duree: number;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Start date',
  })
  date_debut: string;

  @ApiProperty({
    example: '2024-06-30',
    description: 'End date',
  })
  date_fin: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

// Session Response Schemas
export class SessionResponse {
  @ApiProperty({
    example: 1,
    description: 'Session ID',
  })
  id: number;

  @ApiProperty({
    example: 'Session Title',
    description: 'Session title',
  })
  title: string;

  @ApiProperty({
    example: 'Session Description',
    description: 'Session description',
  })
  description: string;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Session start date',
  })
  date_debut: string;

  @ApiProperty({
    example: '2024-06-30',
    description: 'Session end date',
  })
  date_fin: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the course this session belongs to',
  })
  id_cours: number;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

// Session Document Response Schemas
export class SessionDocumentResponse {
  @ApiProperty({
    example: 1,
    description: 'Session document ID',
  })
  id: number;

  @ApiProperty({
    example: 'Session Document Title',
    description: 'Session document title',
  })
  title: string;

  @ApiProperty({
    example: 'Description of the session document',
    description: 'Session document description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'Document attachment URL',
  })
  piece_jointe: string;

  @ApiProperty({
    example: 'pdf',
    description: 'Document type',
    required: false,
  })
  type?: string;

  @ApiProperty({
    example: 'pendant',
    description: 'Document category',
    enum: ['pendant', 'durant', 'apres'],
  })
  category: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the session',
  })
  id_session: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who created it',
    required: false,
  })
  createdBy?: number;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

// Module de Formation Response Schemas
export class ModuleDeFormationResponse {
  @ApiProperty({
    example: 1,
    description: 'Module de formation ID',
  })
  id: number;

  @ApiProperty({
    example: 'Advanced JavaScript',
    description: 'Module title',
  })
  title: string;

  @ApiProperty({
    example: 'Advanced concepts in JavaScript development',
    description: 'Module description',
  })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the formation this module belongs to',
  })
  id_formation: number;

  @ApiProperty({
    example: 20,
    description: 'Duration in hours',
  })
  duree: number;

  @ApiProperty({
    example: 1,
    description: 'Module order/sequence',
  })
  ordre: number;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

// Newsletter Response Schemas
export class NewsletterResponse {
  @ApiProperty({
    example: 1,
    description: 'Newsletter subscription ID',
  })
  id: number;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Subscriber email',
  })
  email: string;

  @ApiProperty({
    example: true,
    description: 'Subscription status',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Subscription timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

// Stripe Response Schemas
export class PaymentIntentResponse {
  @ApiProperty({
    example: 'pi_xxx_secret_xxx',
    description: 'Stripe payment intent client secret',
  })
  clientSecret: string;

  @ApiProperty({
    example: 'pi_xxx',
    description: 'Payment intent ID',
  })
  id: string;
}

export class PaymentConfirmationResponse {
  @ApiProperty({
    example: 'succeeded',
    description: 'Payment status',
  })
  status: string;

  @ApiProperty({
    example: 'pi_xxx',
    description: 'Payment intent ID',
  })
  id: string;
}

export class OPCOPaymentResponse {
  @ApiProperty({
    example: 'pm_opco_xxx',
    description: 'OPCO payment method ID',
  })
  id: string;

  @ApiProperty({
    example: 'OPCO001',
    description: 'OPCO identifier',
  })
  opco: string;
}

export class OPCOProcessResponse {
  @ApiProperty({
    example: 'processed',
    description: 'Payment processing status',
  })
  status: string;

  @ApiProperty({
    example: 'OPCO_REF_123',
    description: 'OPCO reference number',
  })
  reference: string;
}
