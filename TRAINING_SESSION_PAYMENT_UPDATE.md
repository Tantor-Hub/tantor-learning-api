# Training Session Payment Update Endpoint

## 🎯 Overview

A new dedicated endpoint has been added to update only payment-related fields of training sessions. This endpoint allows you to update `payment_method` and `cpf_link` fields without affecting other training session data.

## 📡 API Endpoint

### Update Payment Information

```
PATCH http://192.168.1.71:3737/api/trainingssession/update-payment
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**Authentication:** JWT + Secretary/Admin role required

## 📋 Request Body

### UpdatePaymentDto Structure

```typescript
{
  id: string;                    // Required: Training session UUID
  payment_method?: string[];     // Optional: Array of payment methods
  cpf_link?: string;            // Optional: CPF payment link
}
```

## 🔧 Usage Examples

### 1. Update Payment Methods Only

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_method": ["Credit Card", "Bank Transfer", "PayPal"]
}
```

### 2. Update CPF Link Only

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cpf_link": "https://cpf.example.com/payment-link"
}
```

### 3. Update Both Fields

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_method": ["Credit Card", "Bank Transfer"],
  "cpf_link": "https://cpf.example.com/payment-link"
}
```

## 📤 Response Format

### Success Response (200)

```json
{
  "status": 200,
  "message": "Payment information updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "React Training Session",
    "payment_method": ["Credit Card", "Bank Transfer"],
    "cpf_link": "https://cpf.example.com/payment-link",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 404 - Training Session Not Found

```json
{
  "status": 404,
  "message": "Training session not found",
  "data": null
}
```

#### 400 - Bad Request

```json
{
  "status": 400,
  "message": "Validation failed",
  "data": {
    "errors": ["id must be a UUID", "payment_method must be an array"]
  }
}
```

#### 401 - Unauthorized

```json
{
  "status": 401,
  "message": "Unauthorized",
  "data": null
}
```

#### 403 - Forbidden

```json
{
  "status": 403,
  "message": "Insufficient permissions",
  "data": null
}
```

## 🔐 Security Features

- ✅ **JWT Authentication** required
- ✅ **Role-based Authorization** (Secretary/Admin only)
- ✅ **Input Validation** with class-validator
- ✅ **UUID Validation** for training session ID
- ✅ **Selective Field Updates** (only payment fields can be updated)

## 🎯 Key Benefits

1. **Focused Updates:** Only payment-related fields can be updated
2. **Data Safety:** Other training session data remains unchanged
3. **Flexible:** Can update one or both payment fields
4. **Validated:** Full input validation and error handling
5. **Secure:** JWT authentication and role-based access control

## 📚 Swagger Documentation

The endpoint is fully documented in Swagger with:

- ✅ **Interactive Examples** for different update scenarios
- ✅ **Request/Response Schemas** with validation rules
- ✅ **Error Response Examples** for all possible scenarios
- ✅ **Authentication Requirements** clearly specified

## 🚀 Frontend Integration

### TypeScript Interface

```typescript
interface UpdatePaymentRequest {
  id: string;
  payment_method?: string[];
  cpf_link?: string;
}
```

### API Service Function

```typescript
async function updateTrainingSessionPayment(paymentData: UpdatePaymentRequest) {
  const response = await fetch(
    'http://192.168.1.71:3737/api/trainingssession/update-payment',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(paymentData),
    },
  );
  return response.json();
}
```

### Usage Example

```typescript
// Update payment methods
await updateTrainingSessionPayment({
  id: '550e8400-e29b-41d4-a716-446655440000',
  payment_method: ['Credit Card', 'Bank Transfer', 'PayPal'],
});

// Update CPF link
await updateTrainingSessionPayment({
  id: '550e8400-e29b-41d4-a716-446655440000',
  cpf_link: 'https://cpf.example.com/payment-link',
});
```

## ✅ Implementation Status

- ✅ **DTO Created:** `UpdatePaymentDto` with validation
- ✅ **Service Method:** `updatePayment()` with selective field updates
- ✅ **Controller Endpoint:** `PATCH /update-payment` with full Swagger docs
- ✅ **Authentication:** JWT + Secretary/Admin role required
- ✅ **Validation:** Complete input validation and error handling
- ✅ **Documentation:** Comprehensive API documentation

The payment update endpoint is now ready for production use! 🎉
