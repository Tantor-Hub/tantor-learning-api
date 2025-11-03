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
    example: '60h',
    description: 'Duration of the lesson',
    required: false,
  })
  duree?: string;

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

// Training Session Response Schemas
export class TrainingSessionResponse {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Training session ID',
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Training ID that this session belongs to',
  })
  id_trainings: string;

  @ApiProperty({
    example: 'Advanced React Development Session',
    description: 'Title of the training session',
  })
  title: string;

  @ApiProperty({
    example: 30,
    description: 'Total number of places available',
  })
  nb_places: number;

  @ApiProperty({
    example: 25,
    description: 'Number of available places',
  })
  available_places: number;

  @ApiProperty({
    example: ['CV', 'Diploma', 'ID Card'],
    description: 'List of required documents',
    required: false,
    type: [String],
  })
  required_document?: string[];

  @ApiProperty({
    example: ['Credit Card', 'Bank Transfer', 'OPCO'],
    description: 'List of accepted payment methods',
    required: false,
    type: [String],
  })
  payment_method?: string[];

  @ApiProperty({
    example: ['Experience Level', 'Learning Goals', 'Availability'],
    description: 'List of survey questions',
    required: false,
    type: [String],
  })
  survey?: string[];

  @ApiProperty({
    example:
      'This training session follows our standard regulations and policies.',
    description: 'Regulation text for the training session',
  })
  regulation_text: string;

  @ApiProperty({
    example: '2024-03-15T09:00:00.000Z',
    description: 'Beginning date and time of the training session',
  })
  begining_date: string;

  @ApiProperty({
    example: '2024-03-20T17:00:00.000Z',
    description: 'Ending date and time of the training session',
  })
  ending_date: string;

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

  @ApiProperty({
    description: 'Associated training information',
    type: 'object',
    properties: {
      title: { type: 'string', example: 'Advanced React Development' },
      subtitle: { type: 'string', example: 'Learn advanced React concepts' },
      description: {
        type: 'string',
        example:
          'This comprehensive training covers advanced React concepts including hooks, context, performance optimization, and modern development practices.',
      },
    },
  })
  trainings: {
    title: string;
    subtitle: string;
    description: string;
  };
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
