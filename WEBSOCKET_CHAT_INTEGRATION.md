# WebSocket Chat Integration Documentation

This document describes the WebSocket integration for the Chat and RepliesChat systems, including the new `is_public` field for controlling reply visibility.

## 🚀 **Features Implemented**

### **1. WebSocket Gateway (`ChatGateway`)**

- **Real-time messaging** between users
- **JWT authentication** for WebSocket connections
- **Room management** for chat conversations
- **User presence tracking** (online/offline status)
- **Event-driven architecture** for instant notifications

### **2. Enhanced RepliesChat Model**

- **`is_public` field**: Boolean field to control reply visibility
  - `true` (default): Reply visible to all chat participants
  - `false`: Reply visible only to the sender (private reply)

### **3. WebSocket Events**

#### **Connection Events**

- `connect`: User connects to chat gateway
- `disconnect`: User disconnects from chat gateway
- `connected`: Confirmation of successful connection

#### **Chat Management Events**

- `join_chat`: Join a specific chat room
- `leave_chat`: Leave a chat room
- `new_message`: Receive new chat message
- `message_sent`: Confirmation of sent message

#### **Reply Events**

- `send_reply`: Send a reply to a chat message
- `reply_received`: Receive a reply (public or private)
- `reply_sent`: Confirmation of sent reply

#### **Status Events**

- `mark_as_read`: Mark a message as read
- `message_read`: Notification that someone read a message
- `get_online_users`: Get list of online users

## 📡 **WebSocket Connection**

### **Connection URL**

```
ws://localhost:3000/chat
```

### **Authentication**

```javascript
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

### **Connection Flow**

1. Client connects with JWT token
2. Server validates token and extracts user information
3. User is added to connected users map
4. User joins their personal room (`user_${userId}`)
5. Connection confirmation sent to client

## 🔧 **API Events**

### **1. Join Chat**

```javascript
socket.emit('join_chat', { chatId: 'chat-uuid' });
```

- **Purpose**: Join a specific chat room to receive real-time updates
- **Validation**: Checks if user is sender or receiver of the chat
- **Response**: `joined_chat` event with confirmation

### **2. Send Message**

```javascript
socket.emit('send_message', {
  id_user_receiver: ['user-uuid-1', 'user-uuid-2'],
  subject: 'Meeting Discussion',
  content: 'Hello everyone!',
  piece_joint: ['/uploads/file1.pdf'],
});
```

- **Purpose**: Send a new chat message
- **Broadcast**: Message sent to all receivers via WebSocket
- **Response**: `message_sent` confirmation + `new_message` to receivers

### **3. Send Reply**

```javascript
socket.emit('send_reply', {
  id_chat: 'chat-uuid',
  content: 'Thank you for your message!',
  is_public: true, // or false for private reply
});
```

- **Purpose**: Reply to an existing chat message
- **Visibility Control**:
  - `is_public: true`: All chat participants receive the reply
  - `is_public: false`: Only the sender receives the reply (private)
- **Response**: `reply_sent` confirmation + `reply_received` to appropriate users

### **4. Mark as Read**

```javascript
socket.emit('mark_as_read', { chatId: 'chat-uuid' });
```

- **Purpose**: Mark a message as read
- **Broadcast**: Notifies other participants that message was read
- **Response**: `marked_as_read` confirmation + `message_read` to others

### **5. Get Online Users**

```javascript
socket.emit('get_online_users');
```

- **Purpose**: Get list of currently online users
- **Response**: `online_users` event with user list and count

## 📊 **Event Response Examples**

### **New Message Received**

```javascript
socket.on('new_message', (data) => {
  console.log(data);
  // {
  //   type: 'chat',
  //   data: {
  //     id: 'chat-uuid',
  //     content: 'Hello everyone!',
  //     id_user_sender: 'sender-uuid',
  //     id_user_receiver: ['receiver1-uuid', 'receiver2-uuid'],
  //     subject: 'Meeting Discussion',
  //     status: 'alive',
  //     createdAt: '2025-01-25T10:00:00.000Z'
  //   },
  //   sender: {
  //     id: 1,
  //     uuid: 'sender-uuid',
  //     email: 'john@example.com',
  //     fs_name: 'John',
  //     ls_name: 'Doe'
  //   }
  // }
});
```

### **Reply Received**

```javascript
socket.on('reply_received', (data) => {
  console.log(data);
  // {
  //   type: 'reply',
  //   data: {
  //     id: 'reply-uuid',
  //     content: 'Thank you for your message!',
  //     id_sender: 'sender-uuid',
  //     id_chat: 'chat-uuid',
  //     status: 'alive',
  //     is_public: true,
  //     createdAt: '2025-01-25T10:05:00.000Z'
  //   },
  //   sender: {
  //     id: 1,
  //     uuid: 'sender-uuid',
  //     email: 'jane@example.com',
  //     fs_name: 'Jane',
  //     ls_name: 'Smith'
  //   },
  //   is_private: false
  // }
});
```

## 🔐 **Security Features**

### **Authentication**

- JWT token validation on connection
- User information extraction from token
- Automatic disconnection for invalid tokens

### **Authorization**

- Chat access validation (sender/receiver only)
- Room-based access control
- User-specific event filtering

### **Data Validation**

- UUID validation for all IDs
- Content sanitization
- Input validation for all events

## 🎯 **Usage Examples**

### **Complete Chat Flow**

```javascript
// 1. Connect to WebSocket
const socket = io('http://localhost:3000/chat', {
  auth: { token: 'your-jwt-token' },
});

// 2. Listen for connection confirmation
socket.on('connected', (data) => {
  console.log('Connected as:', data.user.email);
});

// 3. Join a chat room
socket.emit('join_chat', { chatId: 'chat-uuid' });

// 4. Listen for new messages
socket.on('new_message', (data) => {
  displayMessage(data.data, data.sender);
});

// 5. Send a message
socket.emit('send_message', {
  id_user_receiver: ['user1-uuid', 'user2-uuid'],
  content: 'Hello everyone!',
  subject: 'Project Update',
});

// 6. Send a public reply
socket.emit('send_reply', {
  id_chat: 'chat-uuid',
  content: 'Great idea!',
  is_public: true,
});

// 7. Send a private reply
socket.emit('send_reply', {
  id_chat: 'chat-uuid',
  content: 'Let me think about this...',
  is_public: false,
});

// 8. Mark message as read
socket.emit('mark_as_read', { chatId: 'chat-uuid' });
```

### **Private vs Public Replies**

```javascript
// Public reply - visible to all chat participants
socket.emit('send_reply', {
  id_chat: 'chat-uuid',
  content: 'I agree with this proposal.',
  is_public: true,
});

// Private reply - visible only to sender
socket.emit('send_reply', {
  id_chat: 'chat-uuid',
  content: 'I need to discuss this privately first.',
  is_public: false,
});
```

## 🛠️ **Testing**

### **WebSocket Client Example**

A complete HTML client example is provided in `src/chat/websocket-client-example.html` that demonstrates:

- Connection management
- Chat room joining/leaving
- Message sending and receiving
- Reply sending (public/private)
- Read status tracking
- Online user management

### **Testing Steps**

1. Start the application: `npm run start:dev:memory`
2. Open the HTML client example in a browser
3. Enter a valid JWT token
4. Test all WebSocket events
5. Verify real-time communication between multiple clients

## 📈 **Performance Considerations**

### **Connection Management**

- Automatic cleanup of disconnected users
- Efficient room-based message broadcasting
- Minimal memory footprint for user tracking

### **Event Optimization**

- Targeted event emission (only to relevant users)
- Efficient data structures for user mapping
- Optimized database queries for validation

### **Scalability**

- Room-based architecture supports multiple concurrent chats
- Stateless design allows horizontal scaling
- Efficient event filtering reduces unnecessary network traffic

## 🔧 **Configuration**

### **WebSocket Gateway Settings**

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/chat',
})
```

### **JWT Configuration**

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  signOptions: { expiresIn: '24h' },
});
```

## 🚀 **Deployment Notes**

### **Production Considerations**

- Use environment variables for JWT secrets
- Configure CORS properly for production domains
- Implement rate limiting for WebSocket connections
- Monitor connection counts and memory usage
- Use Redis adapter for multi-instance deployments

### **Environment Variables**

```bash
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

## 📝 **API Endpoints**

The WebSocket integration works alongside the existing REST API endpoints:

- `POST /api/chat` - Create chat message
- `GET /api/chat` - Get all chat messages
- `GET /api/chat/:id` - Get specific chat message
- `GET /api/chat/user/:userId` - Get user's chat messages
- `PATCH /api/chat` - Update chat message
- `DELETE /api/chat` - Delete chat message

- `POST /api/replieschat` - Create reply
- `GET /api/replieschat` - Get all replies
- `GET /api/replieschat/:id` - Get specific reply
- `GET /api/replieschat/chat/:chatId` - Get chat replies
- `GET /api/replieschat/sender/:senderId` - Get sender replies
- `PATCH /api/replieschat` - Update reply
- `DELETE /api/replieschat` - Delete reply

The WebSocket events provide real-time alternatives to these REST endpoints, enabling instant communication and updates.

## 🎉 **Summary**

The WebSocket integration provides:

- ✅ **Real-time messaging** with instant delivery
- ✅ **Public/private replies** with `is_public` field control
- ✅ **User presence tracking** and online status
- ✅ **Secure authentication** with JWT tokens
- ✅ **Room-based architecture** for efficient message routing
- ✅ **Complete event system** for all chat operations
- ✅ **Production-ready** with proper error handling and validation

The system is now fully functional for real-time chat communication with both public and private reply capabilities! 🚀
