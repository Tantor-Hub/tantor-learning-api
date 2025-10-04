# WebSocket Chat API Documentation

## Overview

The Chat WebSocket API provides real-time messaging capabilities with file upload support. This documentation covers both REST API endpoints and WebSocket events.

## Connection

### WebSocket Connection

- **URL**: `ws://localhost:3000/chat` (development)
- **URL**: `wss://your-domain.com/chat` (production)
- **Namespace**: `/chat`
- **Authentication**: JWT token via handshake

### Authentication

```javascript
const socket = io('ws://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

## REST API Endpoints

### 1. Create Chat Message

- **Endpoint**: `POST /api/chat/create`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token

### 2. Get User's Chat Messages

- **Endpoint**: `GET /api/chat/user`
- **Authentication**: JWT Bearer Token
- **Description**: Get all chat messages for the authenticated user (sender ID automatically extracted from JWT token)

### 3. Mark Message as Read

- **Endpoint**: `PATCH /api/chat/{id}/read`
- **Authentication**: JWT Bearer Token
- **Description**: Mark a chat message as read by the authenticated user (user ID automatically extracted from JWT token)

### 4. Hide Message

- **Endpoint**: `PATCH /api/chat/{id}/hide`
- **Authentication**: JWT Bearer Token
- **Description**: Hide a chat message for the authenticated user (user ID automatically extracted from JWT token)

**Request Body:**

```json
{
  "id_user_receiver": ["user-uuid-1", "user-uuid-2"],
  "subject": "Meeting Discussion",
  "content": "Hello everyone, let's discuss the project updates.",
  "piece_joint": ["https://example.com/file1.pdf"]
}
```

**Note:** `subject`, `content`, and `piece_joint` are all optional fields. You can create a chat with just the required `id_user_receiver` field:

```json
{
  "id_user_receiver": ["user-uuid-1", "user-uuid-2"]
}
```

**Response:**

```json
{
  "status": 201,
  "message": "Chat message created successfully",
  "data": {
    "id": "chat-uuid",
    "id_user_sender": "sender-uuid",
    "id_user_receiver": ["user-uuid-1", "user-uuid-2"],
    "subject": "Meeting Discussion",
    "content": "Hello everyone, let's discuss the project updates.",
    "piece_joint": ["https://example.com/file1.pdf"],
    "status": "alive",
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
```

### 5. Create Chat Message with Files

- **Endpoint**: `POST /api/chat/create-with-files`
- **Content-Type**: `multipart/form-data`
- **Authentication**: JWT Bearer Token

**Form Data:**

- `id_user_receiver`: JSON array of receiver UUIDs
- `subject`: Message subject (optional)
- `content`: Message content (optional)
- `files`: File attachments (max 10 files, 50MB each)

**Supported File Types:**

- Documents: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX
- Images: JPEG, PNG, GIF, WebP
- Archives: ZIP, RAR
- Videos: MP4, AVI, MOV
- Audio: MP3, WAV, MPEG

**Response:**

```json
{
  "status": 201,
  "message": "Chat message with files created successfully",
  "data": {
    "id": "chat-uuid",
    "id_user_sender": "sender-uuid",
    "id_user_receiver": ["user-uuid-1", "user-uuid-2"],
    "subject": "Meeting Discussion with Attachments",
    "content": "Hello everyone, please review the attached documents.",
    "piece_joint": [
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/__tantorLearning/document.pdf",
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/__tantorLearning/image.jpg"
    ],
    "status": "alive",
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
```

## WebSocket Events

### Client to Server Events

#### 1. Join Chat Room

```javascript
socket.emit('join_chat', {
  chatId: 'chat-uuid',
});
```

**Response Events:**

- `joined_chat`: Successfully joined the chat room
- `error`: Error joining chat room

#### 2. Leave Chat Room

```javascript
socket.emit('leave_chat', {
  chatId: 'chat-uuid',
});
```

**Response Events:**

- `left_chat`: Successfully left the chat room

#### 3. Send Message

```javascript
socket.emit('send_message', {
  id_user_receiver: ['user-uuid-1', 'user-uuid-2'],
  subject: 'Meeting Discussion',
  content: "Hello everyone, let's discuss the project updates.",
  piece_joint: ['https://example.com/file1.pdf'],
});
```

**Response Events:**

- `message_sent`: Message sent successfully (to sender)
- `new_message`: New message received (to receivers)

#### 4. Send Message with Files

```javascript
socket.emit('send_message_with_files', {
  id_user_receiver: ['user-uuid-1', 'user-uuid-2'],
  subject: 'Meeting Discussion with Attachments',
  content: 'Hello everyone, please review the attached documents.',
  files: [
    {
      name: 'document.pdf',
      type: 'application/pdf',
      size: 1024000,
      data: 'base64-encoded-file-data',
    },
  ],
});
```

**Response Events:**

- `message_sent`: Message with files sent successfully (to sender)
- `new_message`: New message with files received (to receivers)

#### 5. Send Reply

```javascript
socket.emit('send_reply', {
  id_chat: 'chat-uuid',
  content: 'Thank you for your message. I will get back to you soon.',
  is_public: true,
});
```

**Response Events:**

- `reply_sent`: Reply sent successfully (to sender)
- `reply_received`: Reply received (to chat participants)

#### 6. Mark as Read

```javascript
socket.emit('mark_as_read', {
  chatId: 'chat-uuid',
});
```

**Response Events:**

- `marked_as_read`: Message marked as read (to sender)
- `message_read`: Message read notification (to other participants)

#### 7. Get Online Users

```javascript
socket.emit('get_online_users');
```

**Response Events:**

- `online_users`: List of online users

### Server to Client Events

#### 1. Connection Events

```javascript
socket.on('connected', (data) => {
  console.log('Connected as:', data.user.email);
});

socket.on('error', (data) => {
  console.error('Error:', data.message);
});
```

#### 2. Message Events

```javascript
socket.on('new_message', (data) => {
  console.log('New message from:', data.sender.fs_name);
  console.log('Content:', data.data.content);
  console.log('Files:', data.data.piece_joint);
});

socket.on('message_sent', (data) => {
  console.log('Message sent successfully:', data.data.id);
});
```

#### 3. Reply Events

```javascript
socket.on('reply_received', (data) => {
  console.log('Reply from:', data.sender.fs_name);
  console.log('Content:', data.data.content);
  console.log('Is private:', data.is_private);
});

socket.on('reply_sent', (data) => {
  console.log('Reply sent successfully:', data.data.id);
});
```

#### 4. Chat Room Events

```javascript
socket.on('joined_chat', (data) => {
  console.log('Joined chat:', data.chatId);
});

socket.on('left_chat', (data) => {
  console.log('Left chat:', data.chatId);
});
```

#### 5. Read Receipt Events

```javascript
socket.on('message_read', (data) => {
  console.log('Message read by:', data.readBy.fs_name);
  console.log('Chat ID:', data.chatId);
  console.log('Timestamp:', data.timestamp);
});

socket.on('marked_as_read', (data) => {
  console.log('Marked as read:', data.chatId);
});
```

#### 6. Online Users Event

```javascript
socket.on('online_users', (data) => {
  console.log('Online users:', data.users);
  console.log('Count:', data.count);
});
```

## Error Handling

### Common Error Responses

```javascript
socket.on('error', (data) => {
  switch (data.message) {
    case 'User not authenticated':
      // Handle authentication error
      break;
    case 'Access denied to this chat':
      // Handle access denied
      break;
    case 'Chat not found':
      // Handle chat not found
      break;
    case 'File type not allowed':
      // Handle invalid file type
      break;
    case 'File size exceeds limit':
      // Handle file size error
      break;
    default:
      // Handle other errors
      break;
  }
});
```

## File Upload Guidelines

### File Validation

- **Maximum files**: 10 per message
- **Maximum file size**: 50MB per file
- **Maximum total size**: 500MB per message
- **Storage**: Files are uploaded to Cloudinary automatically

### Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX
- **Images**: JPEG, PNG, GIF, WebP
- **Archives**: ZIP, RAR
- **Videos**: MP4, AVI, MOV
- **Audio**: MP3, WAV, MPEG

### File Upload Methods

#### Method 1: REST API (Recommended for large files)

```javascript
const formData = new FormData();
formData.append(
  'id_user_receiver',
  JSON.stringify(['user-uuid-1', 'user-uuid-2']),
);
formData.append('content', 'Hello with files!');
formData.append('files', file1);
formData.append('files', file2);

fetch('/api/chat/create-with-files', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

#### Method 2: WebSocket (For smaller files)

```javascript
// Convert file to base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Send message with files
const fileData = await convertFileToBase64(file);
socket.emit('send_message_with_files', {
  id_user_receiver: ['user-uuid-1', 'user-uuid-2'],
  content: 'Hello with files!',
  files: [
    {
      name: file.name,
      type: file.type,
      size: file.size,
      data: fileData,
    },
  ],
});
```

## Security Considerations

1. **Authentication**: All requests require valid JWT tokens
2. **File Validation**: Files are validated on both frontend and backend
3. **Access Control**: Users can only access chats they're participants in
4. **Rate Limiting**: Consider implementing rate limiting for file uploads
5. **File Scanning**: Consider implementing malware scanning for uploaded files

## Best Practices

1. **Connection Management**: Always handle connection/disconnection events
2. **Error Handling**: Implement comprehensive error handling for all events
3. **File Validation**: Validate files on the frontend before sending
4. **Progress Indication**: Show upload progress for large files
5. **Retry Logic**: Implement retry logic for failed operations
6. **Memory Management**: Clean up event listeners on component unmount

## Example Implementation

See the complete frontend implementation examples in the `FRONTEND_WEBSOCKET_CHAT_IMPLEMENTATION_GUIDE.md` file for React, Vue.js, and vanilla JavaScript implementations.
