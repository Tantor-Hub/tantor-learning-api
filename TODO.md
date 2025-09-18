# Passwordless Authentication Improvements

## Issues to Fix

- [ ] Fix field mapping inconsistencies (fs_name/ls_name vs firstName/lastName)
- [ ] Add proper role assignment for passwordless users
- [ ] Improve OTP expiration logic
- [ ] Add proper user status initialization
- [ ] Standardize user response format
- [ ] Add better error handling
- [ ] Consider adding rate limiting for OTP verification

## Implementation Steps

1. Update registerPasswordless method in users.service.ts
2. Update loginPasswordless method in users.service.ts
3. Update verifyOtp method in users.service.ts
4. Update DTOs for consistency
5. Test the improved flow

## Completed Tasks

- [x] Implement change role functionality
  - [x] Create ChangeRoleDto with validation
  - [x] Add changeRole method in users.service.ts
  - [x] Add PUT /users/change-role endpoint in users.controller.ts
  - [x] Create change-role.sh script for API testing
  - [x] Add proper authentication with JwtAuthGuardAsFormateur

## Testing

To test the change role functionality:

1. Start the application: `npm run start:dev`
2. Use the change-role.sh script:
   ```bash
   ./src/users/change-role.sh user@example.com admin
   ```
3. Or make a direct API call:
   ```bash
   curl -X PUT http://localhost:3000/users/change-role \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"email": "user@example.com", "role": "admin"}'
   ```

Available roles: instructor, teacher, admin, student, secretary

## New Endpoints: Get User Roles

### Get Current User Role

Added GET `/users/user-role` endpoint to retrieve the current authenticated user's role(s):

```bash
curl -X GET http://localhost:3000/users/user-role \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response format:

```json
{
  "statuscode": 200,
  "status": "Success",
  "data": {
    "roles": [1, 4],
    "userId": 123,
    "uuid": "user-uuid-here"
  }
}
```

This endpoint is protected with JwtAuthGuard and returns the roles array from the JWT payload.

### Get User Role by Email

Added GET `/users/role/:email` endpoint to retrieve a user's role(s) by email (similar to change-role.sh logic):

```bash
curl -X GET http://localhost:3000/users/role/user@example.com \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response format:

```json
{
  "statuscode": 200,
  "status": "Success",
  "data": {
    "email": "user@example.com",
    "roles": [4],
    "userId": 123
  }
}
```

This endpoint is protected with JwtAuthGuardAsFormateur and returns the roles from the database for the specified user.
