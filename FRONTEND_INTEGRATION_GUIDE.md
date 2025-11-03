# Frontend Integration Guide for Document Templates

## 🎯 POST /api/documents/templates

This guide shows exactly what the frontend should send when creating document templates.

### 📋 Required Headers

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### 🔧 Request Body Structure

```typescript
interface CreateTemplateRequest {
  title: string;
  content: TipTapDocument;
  sessionId: string; // UUID of the training session
  type: 'before' | 'during' | 'after';
}
```

### 📝 Complete Request Examples

#### 1. Pre-Training Assessment Form

```json
{
  "title": "Pre-Training Assessment Form",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "Pre-Training Assessment Form" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Please fill out this form before attending the training session. This will help us understand your current knowledge level."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Personal Information" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Name: [Your name here]"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Email: [Your email here]"
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Assessment Questions" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "1. What is your current experience level with this topic?"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "2. What specific areas would you like to focus on during the training?"
          }
        ]
      }
    ]
  },
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "before"
}
```

#### 2. Training Exercise Worksheet

```json
{
  "title": "Hands-on React Component Exercise",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [
          { "type": "text", "text": "Hands-on React Component Exercise" }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Complete this exercise during the training session. Follow the instructions step by step."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Exercise Instructions" }]
      },
      {
        "type": "orderedList",
        "content": [
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "Create a new React component called 'UserCard'"
                  }
                ]
              }
            ]
          },
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "The component should accept props: name, email, and avatar"
                  }
                ]
              }
            ]
          },
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "Style the component using CSS modules or styled-components"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Your Solution" }]
      },
      {
        "type": "codeBlock",
        "attrs": { "language": "javascript" },
        "content": [
          {
            "type": "text",
            "text": "// Your React component code here\n\n"
          }
        ]
      }
    ]
  },
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "during"
}
```

#### 3. Post-Training Evaluation

```json
{
  "title": "Post-Training Evaluation Form",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "Post-Training Evaluation Form" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Thank you for participating in this training session. Please take a few minutes to provide your feedback."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Training Feedback" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "1. How would you rate the overall quality of the training? (1-5 scale)"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "2. Was the content relevant to your needs?"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "3. How would you rate the instructor's knowledge and teaching style?"
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Learning Outcomes" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "4. What was the most valuable thing you learned today?"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "5. What topics would you like to see covered in future training sessions?"
          }
        ]
      }
    ]
  },
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "after"
}
```

### 🎨 Frontend Implementation Examples

#### React with TipTap Editor

```jsx
import { useEditor } from '@tiptap/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const CreateTemplateForm = ({ sessionId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('before');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading,
      BulletList,
      OrderedList,
      CodeBlock,
      // ... other extensions
    ],
    content: '<p>Start creating your document template...</p>',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/documents/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          content: editor.getJSON(),
          sessionId,
          type,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess(result);
        // Reset form
        setTitle('');
        editor.commands.clearContent();
      } else {
        const error = await response.json();
        console.error('Error creating template:', error);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Template Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Document Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="before">Pre-Training Assessment</option>
          <option value="during">Training Exercise</option>
          <option value="after">Post-Training Evaluation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Document Content
        </label>
        <div className="mt-1 border border-gray-300 rounded-md">
          <EditorContent editor={editor} className="min-h-[400px] p-4" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !title.trim()}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Template'}
      </button>
    </form>
  );
};
```

#### JavaScript/TypeScript Fetch Example

```typescript
interface CreateTemplateData {
  title: string;
  content: any; // TipTap JSON
  sessionId: string;
  type: 'before' | 'during' | 'after';
}

const createTemplate = async (data: CreateTemplateData, token: string) => {
  try {
    const response = await fetch('/api/documents/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create template');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

// Usage example
const templateData = {
  title: 'Pre-Training Assessment Form',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Pre-Training Assessment Form' }],
      },
      // ... more content
    ],
  },
  sessionId: '123e4567-e89b-12d3-a456-426614174000',
  type: 'before' as const,
};

createTemplate(templateData, 'your-jwt-token')
  .then((result) => {
    console.log('Template created:', result);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

### 🔍 Expected Response

```json
{
  "id": "template-uuid-here",
  "title": "Pre-Training Assessment Form",
  "content": {
    "type": "doc",
    "content": [...]
  },
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "before",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### ⚠️ Error Responses

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 403 Forbidden (Not a Secretary)

```json
{
  "statusCode": 403,
  "message": "Access denied. Only secretaries can perform this action."
}
```

### 📝 TipTap Content Structure

The `content` field should be a valid TipTap JSON document with this structure:

```typescript
interface TipTapDocument {
  type: 'doc';
  content: TipTapNode[];
}

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
}
```

### 🎯 Common TipTap Node Types

- `heading` - Headers (attrs.level: 1-6)
- `paragraph` - Text paragraphs
- `text` - Text content
- `bulletList` / `listItem` - Bullet lists
- `orderedList` - Numbered lists
- `codeBlock` - Code blocks (attrs.language)
- `blockquote` - Block quotes
- `hardBreak` - Line breaks
- `horizontalRule` - Horizontal dividers

### 🔐 Authentication Requirements

- **JWT Token Required**: All requests must include a valid Bearer token
- **Secretary Role Only**: Only users with 'secretary' role can create templates
- **Token in Header**: `Authorization: Bearer <token>`

### ✅ Validation Rules

- **title**: Required string, not empty
- **content**: Required object (TipTap JSON)
- **sessionId**: Required UUID string
- **type**: Required enum ('before', 'during', 'after')

This guide provides everything the frontend team needs to integrate with the document template creation endpoint! 🚀
