# Universal Multi-Role Guard System Documentation

## Overview

The Universal Multi-Role Guard System provides flexible access control by allowing you to specify any combination of roles when using the guard. Unlike pre-configured guards, this system lets you define role requirements at the endpoint level.

## Features

- ✅ **Universal Role Support**: Specify any combination of roles
- ✅ **Flexible Role Checking**: Require ANY or ALL of specified roles
- ✅ **Admin Override Control**: Enable/disable admin bypass
- ✅ **Easy-to-Use Decorators**: Simple decorators for common scenarios
- ✅ **Custom Configuration**: Full control over role requirements
- ✅ **Type Safety**: TypeScript support with proper interfaces

## Core Components

### 1. Universal Multi-Role Guard

- `JwtAuthGuardUniversalMultiRole`: The core guard that handles role checking
- `JwtAuthGuardUniversalFactory`: Factory guard that uses decorator metadata

### 2. Role Decorators

- `@UniversalRoles()`: Full configuration control
- `@RequireAnyRole()`: User needs ANY of the specified roles
- `@RequireAllRoles()`: User needs ALL of the specified roles
- `@RequireAnyRoleStrict()`: ANY role with no admin override
- `@RequireAllRolesStrict()`: ALL roles with no admin override

## Usage Examples

### 1. Require ANY of Multiple Roles

```typescript
@Get('endpoint')
@UseGuards(JwtAuthGuardUniversalFactory)
@RequireAnyRole('admin', 'secretary', 'instructor')
async someEndpoint() {
  // User needs admin OR secretary OR instructor
}
```

### 2. Require ALL of Multiple Roles

```typescript
@Get('endpoint')
@UseGuards(JwtAuthGuardUniversalFactory)
@RequireAllRoles('admin', 'secretary')
async someEndpoint() {
  // User needs admin AND secretary
}
```

### 3. Custom Configuration

```typescript
@Get('endpoint')
@UseGuards(JwtAuthGuardUniversalFactory)
@UniversalRoles({
  requiredRoles: ['instructor', 'secretary'],
  requireAll: false,
  allowAdminOverride: false, // Even admin needs to meet requirements
})
async someEndpoint() {
  // User needs instructor OR secretary, no admin override
}
```

### 4. Strict Mode (No Admin Override)

```typescript
@Get('endpoint')
@UseGuards(JwtAuthGuardUniversalFactory)
@RequireAnyRoleStrict('student', 'instructor')
async someEndpoint() {
  // User needs student OR instructor, admin cannot override
}
```

## Configuration Options

### UniversalRoleOptions Interface

```typescript
interface UniversalRoleOptions {
  requiredRoles: string[]; // Array of required roles
  requireAll?: boolean; // If true, user must have ALL roles
  allowAdminOverride?: boolean; // If true, admin users can access regardless
}
```

### Parameters Explained

- **requiredRoles**: Array of role names that are required
- **requireAll**:
  - `false` (default): User needs ANY of the specified roles
  - `true`: User needs ALL of the specified roles
- **allowAdminOverride**:
  - `true` (default): Admin users can access any endpoint
  - `false`: Admin users must meet the role requirements

## Real-World Examples

### 1. Management Dashboard (Admin OR Secretary)

```typescript
@Get('management-dashboard')
@UseGuards(JwtAuthGuardUniversalFactory)
@RequireAnyRole('admin', 'secretary')
async getManagementDashboard() {
  // Accessible by admin OR secretary
}
```

### 2. Course Management (Admin AND Secretary)

```typescript
@Get('course-management')
@UseGuards(JwtAuthGuardUniversalFactory)
@RequireAllRoles('admin', 'secretary')
async manageCourses() {
  // Only accessible by users with BOTH admin AND secretary roles
}
```

### 3. Instructor Portal (Instructor OR Admin)

```typescript
@Get('instructor-portal')
@UseGuards(JwtAuthGuardUniversalFactory)
@RequireAnyRole('instructor', 'admin')
async getInstructorPortal() {
  // Accessible by instructor OR admin
}
```

### 4. Student Features (Student OR Instructor, No Admin Override)

```typescript
@Get('student-features')
@UseGuards(JwtAuthGuardUniversalFactory)
@RequireAnyRoleStrict('student', 'instructor')
async getStudentFeatures() {
  // Accessible by student OR instructor, admin cannot override
}
```

### 5. Complex Role Requirements

```typescript
@Get('complex-endpoint')
@UseGuards(JwtAuthGuardUniversalFactory)
@UniversalRoles({
  requiredRoles: ['admin', 'secretary', 'instructor'],
  requireAll: false, // User needs ANY of these roles
  allowAdminOverride: true, // Admin can always access
})
async complexEndpoint() {
  // Accessible by admin, secretary, or instructor
  // Admin can always access regardless of other roles
}
```

## Module Setup

### 1. Add to Module Providers

```typescript
@Module({
  imports: [
    SequelizeModule.forFeature([Users, UserRoles /* other models */]),
    // ... other imports
  ],
  providers: [
    // ... other providers
    JwtAuthGuardUniversalFactory,
    JwtAuthGuardUniversalMultiRole,
  ],
})
export class YourModule {}
```

### 2. Import Required Models

Make sure to include `UserRoles` model in your SequelizeModule.forFeature array.

## Advanced Usage

### 1. Dynamic Role Configuration

```typescript
@Get('dynamic-endpoint')
@UseGuards(JwtAuthGuardUniversalFactory)
@UniversalRoles({
  requiredRoles: ['admin', 'secretary', 'instructor', 'student'],
  requireAll: false,
  allowAdminOverride: false, // Strict mode
})
async dynamicEndpoint() {
  // User needs ANY of the 4 roles, no admin override
}
```

### 2. Role Hierarchy Implementation

```typescript
@Get('hierarchy-endpoint')
@UseGuards(JwtAuthGuardUniversalFactory)
@UniversalRoles({
  requiredRoles: ['admin', 'secretary'],
  requireAll: false,
  allowAdminOverride: true, // Admin is highest in hierarchy
})
async hierarchyEndpoint() {
  // Admin can access, secretary can access, others cannot
}
```

## Error Handling

The guards will throw `CustomUnauthorizedException` with appropriate messages:

- **No token**: "Aucune clé d'authentification n'a été fournie"
- **Invalid token**: "La clé d'authentification fournie a déjà expiré"
- **User not found**: "Utilisateur non trouvé"
- **Insufficient roles**: "La clé d'authentification fournie n'a pas les droits requis pour accéder à ces ressources"

## Testing

### Test Different Role Combinations

```typescript
// Test user with admin role
const adminUser = await createUserWithRoles(['admin']);

// Test user with secretary and instructor roles
const secretaryInstructor = await createUserWithRoles([
  'secretary',
  'instructor',
]);

// Test user with only student role
const studentUser = await createUserWithRoles(['student']);

// Test endpoints with different role requirements
await testEndpoint('/examples/any-three-roles', adminUser); // Should pass
await testEndpoint('/examples/all-two-roles', adminUser); // Should fail (needs admin AND secretary)
await testEndpoint('/examples/strict-any', adminUser); // Should fail (strict mode, no admin override)
```

## Migration from Pre-configured Guards

### Before (Pre-configured)

```typescript
@UseGuards(JwtAuthGuardAdminOrSecretary)
```

### After (Universal)

```typescript
@UseGuards(JwtAuthGuardUniversalFactory)
@RequireAnyRole('admin', 'secretary')
```

## Best Practices

1. **Use Helper Decorators**: Prefer `@RequireAnyRole()` over `@UniversalRoles()` for simple cases
2. **Be Explicit**: Clearly document role requirements in API documentation
3. **Test Thoroughly**: Test with different role combinations
4. **Consider Admin Override**: Use strict mode when admin should not bypass requirements
5. **Use Meaningful Role Names**: Choose role names that clearly indicate permissions
6. **Document Role Requirements**: Include role requirements in Swagger documentation

## Security Considerations

- **Admin Override**: Be careful with `allowAdminOverride: true` as it can bypass all role checks
- **Role Validation**: Always validate roles on the server side
- **Token Security**: Ensure JWT tokens are properly secured
- **Role Hierarchy**: Consider implementing role hierarchies if needed
- **Audit Logging**: Log role changes and access attempts for security auditing

## Performance Considerations

- **Database Queries**: The guard fetches user roles from the database on each request
- **Caching**: Consider implementing role caching for high-traffic applications
- **Connection Pooling**: Ensure proper database connection pooling for role queries

## Troubleshooting

### Common Issues

1. **Guard Not Working**: Ensure the guard is properly registered in the module
2. **Role Not Found**: Check that the UserRoles model is included in SequelizeModule.forFeature
3. **Admin Override Not Working**: Verify `allowAdminOverride` configuration
4. **Multiple Roles Not Working**: Check `requireAll` configuration

### Debug Mode

Enable debug logging by checking the console output for guard authentication messages:

```
✅ JwtAuthGuardUniversalMultiRole: User authenticated: user@example.com with roles: ['admin', 'secretary'] for /api/endpoint
❌ JwtAuthGuardUniversalMultiRole: Access denied for user@example.com - User roles: ['student'] - Required roles: ['admin', 'secretary']
```
