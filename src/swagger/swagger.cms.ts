import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// CMS DTOs with Swagger decorators
export class CreateNewsLetterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address for newsletter subscription',
  })
  email: string;
}

export class CreateContactDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the person sending the contact form',
  })
  from_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the person sending the contact form',
    format: 'email',
  })
  from_mail: string;

  @ApiProperty({
    example: 'Question about course enrollment',
    description: 'Subject of the contact form message',
  })
  subject: string;

  @ApiProperty({
    example: 'I would like to know more about your course offerings and how to enroll.',
    description: 'Content/body of the contact form message',
  })
  content: string;
}

// CMS Controller Swagger Configuration
export const CMSSwagger = {
  controller: {
    tag: 'CMS',
    bearerAuth: false, // Public endpoints for newsletter
  },

  methods: {
    subscribeNewsletter: {
      operation: {
        summary: 'Subscribe to the newsletter',
        description: 'Subscribe an email address to the newsletter',
      },
      body: { type: CreateNewsLetterDto },
      responses: {
        201: {
          description: 'Subscription successful',
        },
        409: {
          description: 'Already subscribed',
        },
      },
    },

    unsubscribeNewsletter: {
      operation: {
        summary: 'Unsubscribe from the newsletter',
        description: 'Unsubscribe an email address from the newsletter',
      },
      body: { type: CreateNewsLetterDto },
      responses: {
        200: {
          description: 'Unsubscription successful',
        },
        404: {
          description: 'Email not found',
        },
      },
    },

    getNewsletterSubscribers: {
      operation: {
        summary: 'Get list of active newsletter subscribers',
        description: 'Retrieve all active newsletter subscribers (Admin only)',
      },
      responses: {
        200: {
          description: 'Newsletter subscribers retrieved successfully',
        },
      },
    },

    getNewsletterSubscribersAdmin: {
      operation: {
        summary: 'Admin: Get list of active newsletter subscribers',
        description:
          'Admin endpoint to retrieve all active newsletter subscribers',
      },
      responses: {
        200: {
          description: 'Newsletter subscribers retrieved successfully',
        },
      },
    },

    contactForm: {
      operation: {
        summary: 'Submit contact form with optional file attachment',
        description: `
# Contact Form Submission

Submit a contact form message to the Tantor Learning support team with an optional file attachment (image, PDF, document, etc.).

## Features
- **Public Endpoint**: No authentication required
- **File Upload Support**: Attach images, PDFs, documents, or other files
- **Automatic Email Notification**: Contact form submissions are automatically sent to support team
- **Secure File Storage**: Files are uploaded to Cloudinary and stored securely

## Request Format
- **Content-Type**: multipart/form-data
- **Required Fields**: from_name, from_mail, subject, content
- **Optional Fields**: piece_jointe (file attachment)

## Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX
- **Images**: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
- **Maximum File Size**: 10MB

## Response Format
All responses follow this structure:
\`\`\`json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "from_name": "John Doe",
    "from_mail": "john.doe@example.com",
    "subject": "Question about courses",
    "content": "Message content...",
    "piece_jointe": "https://cloudinary.com/file-url",
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
\`\`\`

## Example Usage

### With cURL:
\`\`\`bash
curl -X POST "http://localhost:3737/cms/contactus" \\
  -F "from_name=John Doe" \\
  -F "from_mail=john.doe@example.com" \\
  -F "subject=Course Enrollment Question" \\
  -F "content=I would like to know more about your course offerings." \\
  -F "piece_jointe=@/path/to/document.pdf"
\`\`\`

### With JavaScript/TypeScript:
\`\`\`javascript
const formData = new FormData();
formData.append('from_name', 'John Doe');
formData.append('from_mail', 'john.doe@example.com');
formData.append('subject', 'Course Enrollment Question');
formData.append('content', 'I would like to know more about your course offerings.');
formData.append('piece_jointe', fileInput.files[0]); // Optional file

const response = await fetch('http://localhost:3737/cms/contactus', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
\`\`\`

### With React:
\`\`\`jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch('/cms/contactus', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (result.status === 201) {
      alert('Message sent successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

<form onSubmit={handleSubmit}>
  <input name="from_name" placeholder="Your Name" required />
  <input name="from_mail" type="email" placeholder="Your Email" required />
  <input name="subject" placeholder="Subject" required />
  <textarea name="content" placeholder="Message" required />
  <input name="piece_jointe" type="file" />
  <button type="submit">Send Message</button>
</form>
\`\`\`

## Error Responses
- **400**: Bad Request - Invalid data or file type
- **500**: Internal Server Error - Server-side error during processing

## Notes
- File uploads are optional - the contact form can be submitted without an attachment
- The file is uploaded to Cloudinary and a secure URL is stored
- An email notification is automatically sent to the support team
        `,
      },
      body: { type: CreateContactDto },
      responses: {
        201: {
          description: 'Contact form submitted successfully',
          schema: {
            example: {
              status: 201,
              data: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                from_name: 'John Doe',
                from_mail: 'john.doe@example.com',
                subject: 'Course Enrollment Question',
                content: 'I would like to know more about your course offerings and how to enroll.',
                piece_jointe: 'https://res.cloudinary.com/dfjs9os9x/__tantorLearning/abc123def456',
                createdAt: '2025-01-25T10:00:00.000Z',
                updatedAt: '2025-01-25T10:00:00.000Z',
              },
            },
          },
        },
        400: {
          description: 'Bad request - Invalid data or file',
          schema: {
            example: {
              status: 400,
              data: 'Invalid email format or missing required fields',
            },
          },
        },
        500: {
          description: 'Internal server error',
          schema: {
            example: {
              status: 500,
              message: 'Une erreur interne est survenue. Veuillez réessayer plus tard.',
            },
          },
        },
      },
    },
  },
};
