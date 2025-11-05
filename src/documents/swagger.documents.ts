import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

export const DocumentSwagger = {
  // API Overview
  apiOverview: {
    title: 'Document Management API',
    description: `
# Document Management System

This API provides comprehensive document template management functionality for the Tantor Learning platform.

## Key Features
- **Template Management**: Create, read, update (PATCH), and delete document templates
- **Session Integration**: Associate templates with specific training sessions
- **Role-Based Access**: Secretary-only operations with ownership verification
- **Rich Content**: Support for TipTap JSON content with variables
- **Image Support**: Cloudinary integration for template images
- **Partial Updates**: PATCH method for updating only specific fields

## Authentication
All endpoints require JWT Bearer token authentication. Include the token in the Authorization header:
\`Authorization: Bearer YOUR_JWT_TOKEN\`

## Response Format
All successful responses follow this structure:
\`\`\`json
{
  "status": 200,
  "message": "Operation successful",
  "data": { /* response data */ }
}
\`\`\`

## Error Handling
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Missing or invalid JWT token
- **403**: Forbidden - Insufficient permissions (Secretary role required)
- **404**: Not Found - Resource doesn't exist
- **500**: Internal Server Error - Server-side error

## Template Types
- **before**: Pre-training documents (assessments, prerequisites)
- **during**: In-training documents (worksheets, exercises)
- **after**: Post-training documents (evaluations, feedback forms)

## TipTap Content Structure
The \`content\` field must be a valid TipTap JSON document. Here's a basic example:
\`\`\`json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Document Title" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "This is a paragraph with " },
        { "type": "text", "text": "{{variableName}}", "marks": [{ "type": "bold" }] },
        { "type": "text", "text": " placeholder." }
      ]
    }
  ]
}
\`\`\`

## Variables
Variables are placeholder names that can be used in the TipTap content. They should be wrapped in double curly braces: \`{{variableName}}\`
    `,
  },

  // Template endpoints
  createTemplate: {
    summary: 'Create a new document template (Secretary only)',
    description:
      'Allows only secretaries to create document templates with TipTap content and optional variables. The frontend should send a JSON body with the following required fields: title (string), content (TipTap JSON object from the editor), sessionId (UUID of the training session), and type (enum: "before", "during", or "after"). Variables are optional string array of placeholder names that appear in the TipTap content. All required fields are mandatory. The content field must be a valid TipTap JSON structure starting with {"type": "doc", "content": [...]}',
    operationId: 'createTemplate',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      description:
        'The frontend must send a JSON body with all required fields. All fields are mandatory: title (string, non-empty), content (TipTap JSON object starting with {"type": "doc", "content": [...] }), sessionId (valid UUID of the training session), and type (one of: "before", "during", "after"). The content must be a valid TipTap document structure.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description:
                  'Title of the document template (required, non-empty string)',
                example: 'Employee Evaluation Form',
              },
              content: {
                type: 'object',
                description:
                  'TipTap JSON content of the template (required, must be a valid TipTap document structure starting with {"type": "doc"})',
                example: {
                  type: 'doc',
                  content: [
                    {
                      type: 'heading',
                      attrs: { level: 1 },
                      content: [
                        { type: 'text', text: 'Pre-Training Assessment Form' },
                      ],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Please fill out this form before attending the training session. This will help us understand your current knowledge level.',
                        },
                      ],
                    },
                  ],
                },
              },
              sessionId: {
                type: 'string',
                format: 'uuid',
                description:
                  'ID of the training session this template belongs to (required, valid UUID)',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              type: {
                type: 'string',
                enum: ['before', 'during', 'after'],
                description:
                  'Type of document template (required, one of: "before", "during", "after")',
                example: 'before',
                examples: {
                  before: {
                    summary: 'Pre-Training Assessment',
                    description:
                      'Document filled before the training session starts',
                    value: 'before',
                  },
                  during: {
                    summary: 'Training Exercise',
                    description: 'Document filled during the training session',
                    value: 'during',
                  },
                  after: {
                    summary: 'Post-Training Evaluation',
                    description:
                      'Document filled after the training session ends',
                    value: 'after',
                  },
                },
              },
              imageUrl: {
                type: 'string',
                description:
                  'Cloudinary URL of the image associated with the template (optional)',
                example:
                  'https://res.cloudinary.com/example/image/upload/v1234567890/template-image.jpg',
              },
            },
            required: ['title', 'content', 'sessionId', 'type'],
            example: {
              title: 'Pre-Training Assessment Form',
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [
                      { type: 'text', text: 'Pre-Training Assessment Form' },
                    ],
                  },
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Please fill out this form before attending the training session.',
                      },
                    ],
                  },
                ],
              },
              sessionId: '123e4567-e89b-12d3-a456-426614174000',
              type: 'before',
            },
          },
          examples: {
            simpleAssessment: {
              summary: 'Simple Pre-Training Assessment',
              description:
                'Minimal example for creating a basic assessment form',
              value: {
                title: 'Basic Assessment',
                content: {
                  type: 'doc',
                  content: [
                    {
                      type: 'heading',
                      attrs: { level: 1 },
                      content: [{ type: 'text', text: 'Assessment Form' }],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Please answer the following questions.',
                        },
                      ],
                    },
                  ],
                },
                sessionId: '123e4567-e89b-12d3-a456-426614174000',
                type: 'before',
              },
            },
            detailedExercise: {
              summary: 'Detailed Training Exercise',
              description:
                'Complete example with various TipTap elements for a training exercise',
              value: {
                title: 'React Component Development Exercise',
                content: {
                  type: 'doc',
                  content: [
                    {
                      type: 'heading',
                      attrs: { level: 1 },
                      content: [
                        {
                          type: 'text',
                          text: 'React Component Development Exercise',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'In this exercise, you will create a reusable React component.',
                        },
                      ],
                    },
                    {
                      type: 'heading',
                      attrs: { level: 2 },
                      content: [{ type: 'text', text: 'Requirements' }],
                    },
                    {
                      type: 'bulletList',
                      content: [
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [
                                {
                                  type: 'text',
                                  text: 'Create a functional component using React hooks',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [
                                {
                                  type: 'text',
                                  text: 'Accept props for name, email, and avatar URL',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [
                                {
                                  type: 'text',
                                  text: 'Include proper TypeScript types',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'heading',
                      attrs: { level: 2 },
                      content: [{ type: 'text', text: 'Your Code' }],
                    },
                    {
                      type: 'codeBlock',
                      attrs: { language: 'typescript' },
                      content: [
                        {
                          type: 'text',
                          text: "// Write your React component code here\n\nimport React from 'react';\n\ninterface UserCardProps {\n  name: string;\n  email: string;\n  avatar?: string;\n}\n\nconst UserCard: React.FC<UserCardProps> = ({ name, email, avatar }) => {\n  return (\n    <div>\n      {/* Your component JSX here */}\n    </div>\n  );\n};\n\nexport default UserCard;",
                        },
                      ],
                    },
                  ],
                },
                sessionId: '123e4567-e89b-12d3-a456-426614174000',
                type: 'during',
              },
            },
            evaluationForm: {
              summary: 'Post-Training Evaluation Form',
              description:
                'Example of a comprehensive evaluation form with multiple question types',
              value: {
                title: 'Training Session Evaluation',
                content: {
                  type: 'doc',
                  content: [
                    {
                      type: 'heading',
                      attrs: { level: 1 },
                      content: [
                        { type: 'text', text: 'Training Session Evaluation' },
                      ],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Please provide honest feedback about your training experience.',
                        },
                      ],
                    },
                    {
                      type: 'heading',
                      attrs: { level: 2 },
                      content: [{ type: 'text', text: 'Overall Satisfaction' }],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Rate your overall satisfaction with the training (1-5):',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Comments: ______________________________',
                        },
                      ],
                    },
                    {
                      type: 'heading',
                      attrs: { level: 2 },
                      content: [{ type: 'text', text: 'Content Quality' }],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'How would you rate the quality of the training content?',
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Suggestions for improvement: ______________________________',
                        },
                      ],
                    },
                  ],
                },
                sessionId: '123e4567-e89b-12d3-a456-426614174000',
                type: 'after',
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Template created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                content: { type: 'object' },
                sessionId: { type: 'string', format: 'uuid' },
                type: { type: 'string', enum: ['before', 'during', 'after'] },
                imageUrl: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden - Secretary role required' },
      400: { description: 'Bad Request' },
    },
  },

  updateTemplate: {
    summary: 'Update a document template (Secretary only)',
    description:
      'Allows only secretaries to update their own document templates using PATCH method. All fields are optional - only provided fields will be updated. The secretary can only update templates they created. This is a partial update operation. Note: sessionId cannot be changed after template creation.',
    operationId: 'updateTemplate',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Template ID to update',
      },
    ],
    requestBody: {
      required: true,
      description:
        'Updated template data. All fields are optional. Note: sessionId cannot be changed after template creation. To delete all existing variables, send variables: []',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Updated title of the document template',
                example: 'Updated Employee Evaluation Form',
              },
              content: {
                type: 'object',
                description: 'Updated TipTap JSON content',
                example: {
                  type: 'doc',
                  content: [
                    {
                      type: 'heading',
                      attrs: { level: 1 },
                      content: [
                        { type: 'text', text: 'Updated Employee Evaluation' },
                      ],
                    },
                  ],
                },
              },
              type: {
                type: 'string',
                enum: ['before', 'during', 'after'],
                description: 'Updated document type',
                example: 'before',
              },
              variables: {
                type: 'array',
                items: { type: 'string' },
                minItems: 0,
                description:
                  'Variable names used as placeholders in content. Optional and can be an empty array. Sending [] will clear existing variables.',
                example: [],
              },
              imageUrl: {
                type: 'string',
                description: 'Updated image URL',
                example:
                  'https://res.cloudinary.com/your-cloud/documents/updated-image.jpg',
              },
            },
          },
          examples: {
            clearVariables: {
              summary: 'Clear all variables',
              value: {
                title: 'No variables case',
                variables: [],
              },
            },
            updateSomeFields: {
              summary: 'Update title and type without variables',
              value: {
                title: 'Updated Title',
                type: 'during',
              },
            },
            updateWithVariables: {
              summary: 'Set variables to a non-empty list',
              value: {
                variables: ['employeeName', 'department'],
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Template updated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'number', example: 200 },
                message: {
                  type: 'string',
                  example: 'Template updated successfully',
                },
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    content: { type: 'object' },
                    createdById: { type: 'string', format: 'uuid' },
                    sessionId: { type: 'string', format: 'uuid' },
                    type: {
                      type: 'string',
                      enum: ['before', 'during', 'after'],
                    },
                    variables: { type: 'array', items: { type: 'string' } },
                    imageUrl: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    createdBy: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                    trainingSession: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        regulation_text: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: 'Bad request - Invalid data',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: 'Validation failed' },
                error: { type: 'string', example: 'Bad Request' },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Invalid or missing JWT token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' },
              },
            },
          },
        },
      },
      403: {
        description: 'Forbidden - Not a secretary or not template owner',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 403 },
                message: {
                  type: 'string',
                  example:
                    'Access denied. Only secretaries can perform this action.',
                },
              },
            },
          },
        },
      },
      404: {
        description: 'Template not found or no permission to update',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 404 },
                message: {
                  type: 'string',
                  example:
                    'Template not found or you do not have permission to update it',
                },
              },
            },
          },
        },
      },
    },
  },

  getAllTemplates: {
    summary: 'Get all document templates (Secretary only)',
    description:
      'Retrieves all available document templates. Only secretaries can access this endpoint.',
    operationId: 'getAllTemplates',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Templates retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'number', example: 200 },
                message: {
                  type: 'string',
                  example: 'Templates retrieved successfully',
                },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      title: { type: 'string' },
                      content: { type: 'object' },
                      createdById: { type: 'string', format: 'uuid' },
                      sessionId: { type: 'string', format: 'uuid' },
                      type: {
                        type: 'string',
                        enum: ['before', 'during', 'after'],
                      },
                      variables: { type: 'array', items: { type: 'string' } },
                      imageUrl: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                      createdBy: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          firstName: { type: 'string' },
                          lastName: { type: 'string' },
                          email: { type: 'string' },
                        },
                      },
                      trainingSession: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          title: { type: 'string' },
                          regulation_text: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Invalid or missing JWT token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' },
              },
            },
          },
        },
      },
      403: {
        description: 'Forbidden - Secretary role required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 403 },
                message: {
                  type: 'string',
                  example:
                    'Access denied. Only secretaries can perform this action.',
                },
              },
            },
          },
        },
      },
    },
  },

  getTemplateById: {
    summary: 'Get template by ID',
    description: 'Retrieves a specific document template by its ID',
    operationId: 'getTemplateById',
    tags: ['Documents'],
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Template ID',
      },
    ],
    responses: {
      200: {
        description: 'Template retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'number', example: 200 },
                message: {
                  type: 'string',
                  example: 'Template retrieved successfully',
                },
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    content: { type: 'object' },
                    createdById: { type: 'string', format: 'uuid' },
                    sessionId: { type: 'string', format: 'uuid' },
                    type: {
                      type: 'string',
                      enum: ['before', 'during', 'after'],
                    },
                    variables: { type: 'array', items: { type: 'string' } },
                    imageUrl: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    createdBy: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                    trainingSession: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        regulation_text: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      404: {
        description: 'Template not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Template not found' },
              },
            },
          },
        },
      },
    },
  },

  getTemplatesBySessionId: {
    summary: 'Get templates by session ID',
    description:
      'Retrieves all document templates for a specific training session',
    operationId: 'getTemplatesBySessionId',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'sessionId',
        in: 'path' as const,
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Training session ID',
      },
    ],
    responses: {
      200: {
        description: 'Templates retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'number', example: 200 },
                message: {
                  type: 'string',
                  example: 'Templates retrieved successfully',
                },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      title: { type: 'string' },
                      content: { type: 'object' },
                      createdById: { type: 'string', format: 'uuid' },
                      sessionId: { type: 'string', format: 'uuid' },
                      type: {
                        type: 'string',
                        enum: ['before', 'during', 'after'],
                      },
                      variables: { type: 'array', items: { type: 'string' } },
                      imageUrl: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                      createdBy: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          firstName: { type: 'string' },
                          lastName: { type: 'string' },
                          email: { type: 'string' },
                        },
                      },
                      trainingSession: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          title: { type: 'string' },
                          regulation_text: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Invalid or missing JWT token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' },
              },
            },
          },
        },
      },
      403: {
        description: 'Forbidden - Secretary role required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 403 },
                message: {
                  type: 'string',
                  example:
                    'Access denied. Only secretaries can perform this action.',
                },
              },
            },
          },
        },
      },
      404: {
        description: 'Session not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Session not found' },
              },
            },
          },
        },
      },
    },
  },

  deleteTemplate: {
    summary: 'Delete template (Secretary only)',
    description:
      'Allows only secretaries to delete a document template and all its instances',
    operationId: 'deleteTemplate',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Template ID',
      },
    ],
    responses: {
      200: {
        description: 'Template deleted successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Template deleted successfully',
                },
              },
            },
          },
        },
      },
      404: { description: 'Template not found' },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden - Secretary role required' },
    },
  },

  // Instance endpoints
  fillDocument: {
    summary: 'Create a document instance (student fills variables only)',
    description:
      'Creates a new document instance. The server generates the filled content from the template and provided variableValues. Students should only send variableValues. Do NOT send filledContent—this will be generated by the backend.',
    operationId: 'fillDocument',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              templateId: {
                type: 'string',
                format: 'uuid',
                description: 'ID of the template to fill out',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              variableValues: {
                type: 'object',
                description:
                  'Values for the template variables. Only these may be modified by the student. The server will generate the TipTap content.',
                example: {
                  employeeName: 'Alice',
                  department: 'Sales',
                  evaluationDate: '2025-11-01',
                },
              },
            },
            required: ['templateId'],
            example: {
              templateId: '123e4567-e89b-12d3-a456-426614174000',
              variableValues: {
                employeeName: 'Alice',
                department: 'Sales',
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Document instance created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                templateId: { type: 'string', format: 'uuid' },
                userId: { type: 'string', format: 'uuid' },
                filledContent: { type: 'object' },
                variableValues: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                template: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    content: { type: 'object' },
                  },
                },
              },
              example: {
                id: 'instance-uuid',
                templateId: 'template-uuid',
                userId: 'student-uuid',
                filledContent: {
                  type: 'doc',
                  content: [
                    /* ... personalized content ... */
                  ],
                },
                variableValues: { score: 95, name: 'Alice' },
                createdAt: '2025-11-01T10:00:00.000Z',
                updatedAt: '2025-11-01T10:01:00.000Z',
                template: {
                  id: 'template-uuid',
                  title: 'Quiz 1',
                  content: {
                    type: 'doc',
                    content: [
                      /* ... template content ... */
                    ],
                  },
                },
              },
            },
          },
        },
      },
      404: { description: 'Template not found' },
      401: { description: 'Unauthorized' },
      400: { description: 'Bad Request' },
    },
  },

  getUserDocuments: {
    summary: 'Get user documents',
    description: 'Retrieves all document instances for the authenticated user',
    operationId: 'getUserDocuments',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User documents retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  templateId: { type: 'string', format: 'uuid' },
                  userId: { type: 'string', format: 'uuid' },
                  filledContent: { type: 'object' },
                  variableValues: { type: 'object' },
                  is_published: { type: 'boolean' },
                  status: {
                    type: 'string',
                    enum: ['pending', 'validated', 'rejected'],
                    description: 'Status of the document instance',
                  },
                  comment: {
                    type: 'string',
                    nullable: true,
                    description: 'Comment associated with the document instance',
                  },
                  template: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      title: { type: 'string' },
                      content: { type: 'object' },
                    },
                  },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
    },
  },

  getDocumentInstanceById: {
    summary: 'Get document instance by ID',
    description: 'Retrieves a specific document instance by its ID',
    operationId: 'getDocumentInstanceById',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Document instance ID',
      },
    ],
    responses: {
      200: {
        description: 'Document instance retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                templateId: { type: 'string', format: 'uuid' },
                userId: { type: 'string', format: 'uuid' },
                filledContent: { type: 'object' },
                variableValues: { type: 'object' },
                is_published: { type: 'boolean' },
                status: {
                  type: 'string',
                  enum: ['pending', 'validated', 'rejected'],
                  description: 'Status of the document instance',
                },
                comment: {
                  type: 'string',
                  nullable: true,
                  description: 'Comment associated with the document instance',
                },
                template: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    content: { type: 'object' },
                  },
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
              example: {
                id: 'instance-uuid',
                templateId: 'template-uuid',
                userId: 'student-uuid',
                filledContent: {
                  type: 'doc',
                  content: [
                    /* ... */
                  ],
                },
                variableValues: { score: 95, name: 'Alice' },
                is_published: false,
                status: 'pending',
                comment: null,
                createdAt: '2025-11-01T10:00:00.000Z',
                updatedAt: '2025-11-01T10:01:00.000Z',
                template: {
                  id: 'template-uuid',
                  title: 'Quiz 1',
                  content: {
                    type: 'doc',
                    content: [
                      /* ... */
                    ],
                  },
                },
              },
            },
          },
        },
      },
      404: { description: 'Document instance not found' },
      401: { description: 'Unauthorized' },
    },
  },

  updateDocumentInstance: {
    summary: 'Update document instance',
    description: 'Updates the filled content of a document instance',
    operationId: 'updateDocumentInstance',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Document instance ID',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              filledContent: {
                type: 'object',
                description: 'Updated TipTap JSON content',
                example: {
                  type: 'doc',
                  content: [
                    {
                      type: 'heading',
                      attrs: { level: 1 },
                      content: [{ type: 'text', text: 'Updated Evaluation' }],
                    },
                  ],
                },
              },
              is_published: {
                type: 'boolean',
                description: 'Whether the document instance is published',
                example: true,
              },
            },
            required: ['filledContent'],
            example: {
              filledContent: {
                type: 'doc',
                content: [
                  {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [
                      { type: 'text', text: 'Pre-Training Assessment Form' },
                    ],
                  },
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Please fill out this form before attending the training session. This will help us understand your current knowledge level.',
                      },
                    ],
                  },
                  {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Personal Information' }],
                  },
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Name: John Doe (Updated)',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Email: john.doe.updated@example.com',
                      },
                    ],
                  },
                  {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Assessment Questions' }],
                  },
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: '1. What is your current experience level with this topic?',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Answer: I have intermediate knowledge and want to become an expert in this field.',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: '2. What specific areas would you like to focus on during the training?',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Answer: I want to focus on advanced techniques, best practices, and real-world case studies.',
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Document instance updated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                templateId: { type: 'string', format: 'uuid' },
                userId: { type: 'string', format: 'uuid' },
                filledContent: { type: 'object' },
                is_published: { type: 'boolean' },
                status: {
                  type: 'string',
                  enum: ['pending', 'validated', 'rejected'],
                  description: 'Status of the document instance',
                },
                comment: {
                  type: 'string',
                  nullable: true,
                  description: 'Comment associated with the document instance',
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      404: { description: 'Document instance not found' },
      401: { description: 'Unauthorized' },
    },
  },

  deleteDocumentInstance: {
    summary: 'Delete document instance',
    description: 'Deletes a document instance',
    operationId: 'deleteDocumentInstance',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Document instance ID',
      },
    ],
    responses: {
      200: {
        description: 'Document instance deleted successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Document instance deleted successfully',
                },
              },
            },
          },
        },
      },
      404: { description: 'Document instance not found' },
      401: { description: 'Unauthorized' },
    },
  },

  getMyDocumentInstancesByTemplate: {
    summary: 'Get my document instances by template ID',
    description:
      'Retrieves all document instances for the authenticated student for a given template ID. This endpoint is used by students to view their own document instances for a specific template.',
    operationId: 'getMyDocumentInstancesByTemplate',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'templateId',
        in: 'path' as const,
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Document template ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    ],
    responses: {
      200: {
        description: 'Student document instances retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'number', example: 200 },
                message: {
                  type: 'string',
                  example: 'Instances retrieved successfully',
                },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      templateId: { type: 'string', format: 'uuid' },
                      userId: { type: 'string', format: 'uuid' },
                      filledContent: { type: 'object' },
                      variableValues: { type: 'object' },
                      is_published: { type: 'boolean' },
                      status: {
                        type: 'string',
                        enum: ['pending', 'validated', 'rejected'],
                        description: 'Status of the document instance',
                      },
                      comment: {
                        type: 'string',
                        nullable: true,
                        description: 'Comment associated with the document instance',
                      },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                      template: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          title: { type: 'string' },
                          content: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
              example: {
                status: 200,
                message: 'Instances retrieved successfully',
                data: [
                  {
                    id: 'instance-uuid',
                    templateId: 'template-uuid',
                    userId: 'student-uuid',
                    filledContent: {
                      type: 'doc',
                      content: [
                        {
                          type: 'heading',
                          attrs: { level: 1 },
                          content: [{ type: 'text', text: 'Assessment Form' }],
                        },
                        {
                          type: 'paragraph',
                          content: [
                            {
                              type: 'text',
                              text: 'Student Name: Alice Johnson',
                            },
                          ],
                        },
                      ],
                    },
                    variableValues: { studentName: 'Alice Johnson', score: 95 },
                    createdAt: '2025-11-01T10:00:00.000Z',
                    updatedAt: '2025-11-01T10:01:00.000Z',
                    template: {
                      id: 'template-uuid',
                      title: 'Pre-Training Assessment',
                      content: {
                        type: 'doc',
                        content: [
                          {
                            type: 'heading',
                            attrs: { level: 1 },
                            content: [
                              { type: 'text', text: 'Assessment Form' },
                            ],
                          },
                          {
                            type: 'paragraph',
                            content: [
                              {
                                type: 'text',
                                text: 'Student Name: {{studentName}}',
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Invalid or missing JWT token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' },
              },
            },
          },
        },
      },
      404: {
        description: 'No document instances found for this template',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'number', example: 404 },
                message: {
                  type: 'string',
                  example: 'No document instances found for this template',
                },
              },
            },
          },
        },
      },
    },
  },

  updateMyDocumentInstance: {
    summary: 'Update my document instance',
    description:
      "Updates the filled content and/or variable values of the authenticated student's own document instance.",
    operationId: 'updateMyDocumentInstance',
    tags: ['Documents'],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path' as const,
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Document instance ID',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              filledContent: {
                type: 'object',
                description: 'Updated TipTap JSON content',
              },
              variableValues: {
                type: 'object',
                description: 'Updated variable values',
              },
              is_published: {
                type: 'boolean',
                description: 'Whether the document instance is published',
              },
            },
            example: {
              filledContent: {
                type: 'doc',
                content: [
                  /* ... */
                ],
              },
              variableValues: { score: 98 },
              is_published: true,
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Document instance updated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                templateId: { type: 'string', format: 'uuid' },
                userId: { type: 'string', format: 'uuid' },
                filledContent: { type: 'object' },
                variableValues: { type: 'object' },
                is_published: { type: 'boolean' },
                status: {
                  type: 'string',
                  enum: ['pending', 'validated', 'rejected'],
                  description: 'Status of the document instance',
                },
                comment: {
                  type: 'string',
                  nullable: true,
                  description: 'Comment associated with the document instance',
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      404: { description: 'Document instance not found' },
      401: { description: 'Unauthorized' },
    },
  },
};
