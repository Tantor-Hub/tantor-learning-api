// Swagger documentation definitions for uploads endpoints

export const UploadSwagger = {
  uploadImage: {
    summary: 'Upload an image to Cloudinary',
    description:
      'Uploads a single image file to Cloudinary under the documents folder. Only secretaries can upload images.',
  },

  uploadImageBody: {
    description: 'Image file upload',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description:
            'Image file to upload (JPEG, PNG, GIF, WebP). Maximum size: 10MB.',
        },
      },
      required: ['image'],
    },
  },

  uploadImageConsumes: 'multipart/form-data',

  uploadImageSuccess: {
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 201,
          description: 'HTTP status code',
        },
        message: {
          type: 'string',
          example: 'Image uploaded successfully',
          description: 'Success message',
        },
        data: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              example:
                'https://res.cloudinary.com/your-cloud/documents/sample.jpg',
              description: 'Public URL of the uploaded image',
            },
            publicId: {
              type: 'string',
              example: 'documents/sample',
              description: 'Cloudinary public ID for the uploaded image',
            },
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Database record ID',
            },
            originalName: {
              type: 'string',
              example: 'my-image.jpg',
              description: 'Original filename of the uploaded image',
            },
            size: {
              type: 'number',
              example: 1024000,
              description: 'File size in bytes',
            },
            mimeType: {
              type: 'string',
              example: 'image/jpeg',
              description: 'MIME type of the uploaded file',
            },
          },
        },
      },
    },
  },

  uploadImageBadRequest: {
    status: 400,
    description: 'Bad request - Invalid file or missing file',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'No image file provided' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  },

  uploadImageUnauthorized: {
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  },

  uploadImageForbidden: {
    status: 403,
    description: 'Forbidden - Only secretaries can upload images',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: {
          type: 'string',
          example: 'Access denied. Only secretaries can perform this action.',
        },
      },
    },
  },

  uploadImageServerError: {
    status: 500,
    description: 'Internal server error - Upload failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
      },
    },
  },

  getUserUploads: {
    summary: 'Get user uploads',
    description:
      'Retrieves all image uploads for the authenticated secretary user.',
  },

  getUserUploadsSuccess: {
    status: 200,
    description: 'User uploads retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
            description: 'Unique identifier for the upload record',
          },
          url: {
            type: 'string',
            example:
              'https://res.cloudinary.com/your-cloud/documents/sample.jpg',
            description: 'Public URL of the uploaded image',
          },
          publicId: {
            type: 'string',
            example: 'documents/sample',
            description: 'Cloudinary public ID',
          },
          originalName: {
            type: 'string',
            example: 'my-image.jpg',
            description: 'Original filename of the uploaded image',
          },
          size: {
            type: 'number',
            example: 1024000,
            description: 'File size in bytes',
          },
          mimeType: {
            type: 'string',
            example: 'image/jpeg',
            description: 'MIME type of the uploaded file',
          },
          uploadedBy: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
            description: 'ID of the user who uploaded the file',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
            description: 'Upload creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
            description: 'Last update timestamp',
          },
        },
      },
    },
  },

  deleteUpload: {
    summary: 'Delete an uploaded image',
    description:
      'Deletes an uploaded image from both Cloudinary and the database. Only the uploader can delete their own images.',
  },

  deleteUploadSuccess: {
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'File deleted successfully',
          description: 'Success message',
        },
      },
    },
  },

  deleteUploadBadRequest: {
    status: 400,
    description: 'Bad request - Upload not found or no permission',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example:
            'Upload not found or you do not have permission to delete this file',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  },
};
