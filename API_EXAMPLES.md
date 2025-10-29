# Document Management API Examples

This file contains comprehensive examples of request and response bodies for the Document Management API.

## 📋 Table of Contents

- [Create Document Template](#create-document-template)
- [Fill Document](#fill-document)
- [Update Document Instance](#update-document-instance)
- [Get All Templates](#get-all-templates)
- [Get Template by ID](#get-template-by-id)
- [Get User Documents](#get-user-documents)

---

## 🆕 Create Document Template

**Endpoint:** `POST /api/documents/templates`  
**Authentication:** Required (Secretary role only)

### Request Body Examples

#### Pre-Training Assessment Form

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

#### Training Exercise Worksheet

```json
{
  "title": "Hands-on Exercise Worksheet",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "Hands-on Exercise Worksheet" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Complete this exercise during the training session."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Exercise Instructions" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "1. Follow the step-by-step instructions provided by the instructor."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "2. Document your progress and any challenges you encounter."
          }
        ]
      }
    ]
  },
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "during"
}
```

#### Post-Training Evaluation

```json
{
  "title": "Post-Training Evaluation",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "Post-Training Evaluation" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Please evaluate your training experience."
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
            "text": "1. How would you rate the overall training experience? (1-5)"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "2. What was the most valuable part of the training?"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "3. What areas could be improved?"
          }
        ]
      }
    ]
  },
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "after"
}
```

### Response

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

---

## 📝 Fill Document

**Endpoint:** `POST /api/documents/fill`  
**Authentication:** Required

### Request Body

```json
{
  "templateId": "123e4567-e89b-12d3-a456-426614174000",
  "filledContent": {
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
            "text": "Name: John Doe"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Email: john.doe@example.com"
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
            "text": "Answer: I have basic knowledge but would like to learn more advanced concepts."
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
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Answer: I am particularly interested in practical applications and hands-on exercises."
          }
        ]
      }
    ]
  }
}
```

### Response

```json
{
  "id": "instance-uuid-here",
  "templateId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-uuid-here",
  "filledContent": {
    "type": "doc",
    "content": [...]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## ✏️ Update Document Instance

**Endpoint:** `PUT /api/documents/instances/:id`  
**Authentication:** Required

### Request Body

```json
{
  "filledContent": {
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
            "text": "Name: John Doe (Updated)"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Email: john.doe.updated@example.com"
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
            "text": "Answer: I have intermediate knowledge and want to become an expert in this field."
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
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Answer: I want to focus on advanced techniques, best practices, and real-world case studies."
          }
        ]
      }
    ]
  }
}
```

### Response

```json
{
  "id": "instance-uuid-here",
  "templateId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-uuid-here",
  "filledContent": {
    "type": "doc",
    "content": [...]
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 📚 Get All Templates

**Endpoint:** `GET /api/documents/templates`  
**Authentication:** Not required

### Response

```json
[
  {
    "id": "template-uuid-1",
    "title": "Pre-Training Assessment Form",
    "content": {
      "type": "doc",
      "content": [...]
    },
    "createdById": "secretary-uuid",
    "createdBy": {
      "id": "secretary-uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    },
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "trainingSession": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Advanced React Training",
      "description": "Comprehensive React development course"
    },
    "type": "before",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "template-uuid-2",
    "title": "Hands-on Exercise Worksheet",
    "content": {
      "type": "doc",
      "content": [...]
    },
    "createdById": "secretary-uuid",
    "createdBy": {
      "id": "secretary-uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    },
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "trainingSession": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Advanced React Training",
      "description": "Comprehensive React development course"
    },
    "type": "during",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 🔍 Get Template by ID

**Endpoint:** `GET /api/documents/templates/:id`  
**Authentication:** Not required

### Response

```json
{
  "id": "template-uuid-here",
  "title": "Pre-Training Assessment Form",
  "content": {
    "type": "doc",
    "content": [...]
  },
  "createdById": "secretary-uuid",
  "createdBy": {
    "id": "secretary-uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com"
  },
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "trainingSession": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Advanced React Training",
    "description": "Comprehensive React development course"
  },
  "type": "before",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 👤 Get User Documents

**Endpoint:** `GET /api/documents/user`  
**Authentication:** Required

### Response

```json
[
  {
    "id": "instance-uuid-1",
    "templateId": "template-uuid-1",
    "userId": "user-uuid-here",
    "filledContent": {
      "type": "doc",
      "content": [...]
    },
    "template": {
      "id": "template-uuid-1",
      "title": "Pre-Training Assessment Form",
      "content": {
        "type": "doc",
        "content": [...]
      }
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "instance-uuid-2",
    "templateId": "template-uuid-2",
    "userId": "user-uuid-here",
    "filledContent": {
      "type": "doc",
      "content": [...]
    },
    "template": {
      "id": "template-uuid-2",
      "title": "Hands-on Exercise Worksheet",
      "content": {
        "type": "doc",
        "content": [...]
      }
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer your-jwt-token-here
```

## 📝 Document Types

- **`before`**: Documents filled before the training session starts (assessments, pre-requisites)
- **`during`**: Documents filled during the training session (exercises, worksheets, notes)
- **`after`**: Documents filled after the training session ends (evaluations, feedback, follow-up)

## 🎯 TipTap Content Structure

The `content` field uses TipTap's JSON format with the following structure:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Your heading text" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Your paragraph text" }]
    }
  ]
}
```

Common TipTap node types:

- `heading` (with `attrs.level` 1-6)
- `paragraph`
- `text`
- `bulletList` / `listItem`
- `orderedList`
- `blockquote`
- `codeBlock`
- `hardBreak`
- `horizontalRule`
