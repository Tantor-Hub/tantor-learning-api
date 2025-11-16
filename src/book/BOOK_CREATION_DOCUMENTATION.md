# Book Creation API Documentation

## Create a Book with File Uploads

Upload an icon image and a document file to create a new book. The files will be stored in Cloudinary and the secure URLs will be saved as `icon` and `piece_joint`.

**Authorization:**
- Only secretaries can create books
- Bearer token required

**Request Format:**
- Content-Type: `multipart/form-data`
- Required fields:
  - `title` (string) - Title of the book
  - `author` (string) - Author of the book
  - `status` (string) - Book status: `premium` or `free`
  - `category` (array) - Array of BookCategory UUIDs (can be sent as JSON string or array)
  - `icon` (file) - Book icon image file
  - `piece_joint` (file) - Book document file
- Optional fields:
  - `description` (string) - Description of the book
  - `session` (array) - Array of session UUIDs (can be sent as JSON string or array)
  - `public` (boolean) - Whether the book is public (default: false)
  - `downloadable` (boolean) - Whether the book is downloadable (default: false)

**Supported File Types:**

**Icon (Image File):**
- JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
- Maximum file size: 100MB

**Piece Joint (Document File):**
- Documents: PDF, DOC, DOCX, TXT
- Presentations: PPT, PPTX
- Spreadsheets: XLS, XLSX
- Images: JPEG, PNG, GIF, WebP (also allowed for documents)
- Maximum file size: 2GB

**Example cURL:**

```bash
curl -X POST "http://localhost:3000/api/book" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Introduction to Programming" \
  -F "author=John Doe" \
  -F "status=free" \
  -F "category=[\"550e8400-e29b-41d4-a716-446655440000\",\"550e8400-e29b-41d4-a716-446655440001\"]" \
  -F "description=A comprehensive guide to programming fundamentals" \
  -F "icon=@/path/to/your/icon.jpg" \
  -F "piece_joint=@/path/to/your/document.pdf" \
  -F "public=false" \
  -F "downloadable=true"
```

**Example JavaScript/TypeScript:**

```javascript
const formData = new FormData();

// Required fields
formData.append('title', 'Introduction to Programming');
formData.append('author', 'John Doe');
formData.append('status', 'free');
formData.append('category', JSON.stringify([
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001'
]));

// Optional fields
formData.append('description', 'A comprehensive guide to programming fundamentals');
formData.append('session', JSON.stringify([
  '550e8400-e29b-41d4-a716-446655440002'
]));

// File uploads (required)
formData.append('icon', iconFileInput.files[0]); // Image file
formData.append('piece_joint', documentFileInput.files[0]); // Document file

// Optional boolean fields
formData.append('public', 'false');
formData.append('downloadable', 'true');

const response = await fetch('http://localhost:3000/api/book', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

**Example React/Next.js:**

```typescript
import { useState } from 'react';

const CreateBookForm = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<'premium' | 'free'>('free');
  const [category, setCategory] = useState<string[]>([]);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [pieceJointFile, setPieceJointFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('status', status);
    formData.append('category', JSON.stringify(category));

    if (iconFile) {
      formData.append('icon', iconFile);
    }
    if (pieceJointFile) {
      formData.append('piece_joint', pieceJointFile);
    }

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.status === 201) {
        console.log('Book created successfully:', result.data);
      } else {
        console.error('Error creating book:', result.data);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as 'premium' | 'free')}
        required
      >
        <option value="free">Free</option>
        <option value="premium">Premium</option>
      </select>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setIconFile(e.target.files?.[0] || null)}
        required
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,image/*"
        onChange={(e) => setPieceJointFile(e.target.files?.[0] || null)}
        required
      />
      <button type="submit">Create Book</button>
    </form>
  );
};
```

**Response Example:**

```json
{
  "status": 201,
  "message": "Opération réussie.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Introduction to Programming",
    "author": "John Doe",
    "description": "A comprehensive guide to programming fundamentals",
    "status": "free",
    "category": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001"
    ],
    "icon": "https://res.cloudinary.com/example/image/upload/v1234567890/icon.jpg",
    "piece_joint": "https://res.cloudinary.com/example/image/upload/v1234567890/document.pdf",
    "views": 0,
    "download": 0,
    "public": false,
    "downloadable": true,
    "createby": "550e8400-e29b-41d4-a716-446655440002",
    "createdAt": "2025-01-25T10:00:00.000Z",
    "updatedAt": "2025-01-25T10:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "status": 400,
  "data": "Icon file is required. Please upload an image file."
}
```

```json
{
  "status": 400,
  "data": "Piece joint file is required. Please upload a document file."
}
```

```json
{
  "status": 400,
  "data": "Icon file type application/octet-stream is not allowed. Allowed types: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF"
}
```

**401 Unauthorized:**
```json
{
  "status": 401,
  "data": "Unauthorized - Secretary access required"
}
```

**403 Forbidden:**
```json
{
  "status": 403,
  "data": "Forbidden - Only secretaries can create books"
}
```

**500 Internal Server Error:**
```json
{
  "status": 500,
  "data": "Failed to upload icon to cloud storage"
}
```

**Notes:**
- The `category` field can be sent as a JSON string array or as an array in form data
- The `session` field is optional and can also be sent as a JSON string array
- Boolean fields (`public`, `downloadable`) should be sent as strings (`'true'` or `'false'`) in form data
- Both files are uploaded to Cloudinary and the returned URLs are stored in the database
- File uploads are processed asynchronously, so large files may take some time to upload

