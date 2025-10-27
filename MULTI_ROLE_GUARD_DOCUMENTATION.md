# Multi-Role Guard System Documentation

## Overview

The Multi-Role Guard System allows you to create flexible access control by combining multiple user roles. Users can have multiple roles simultaneously (e.g., admin + secretary, or secretary + instructor), and guards can check for specific combinations.

## Features

- ✅ **Multiple Role Support**: Users can have multiple roles at the same time
- ✅ **Flexible Role Checking**: Require ANY or ALL of specified roles
- ✅ **Admin Override**: Admin users can access any endpoint (configurable)
- ✅ **Pre-configured Guards**: Ready-to-use guards for common scenarios
- ✅ **Custom Configuration**: Create custom role combinations
- ✅ **Decorator Support**: Use decorators for clean, declarative role checking

## Database Structure

### UserRoles Table

```sql
CREATE TABLE ___tbl_tantor_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES ___tbl_tantor_users(id) ON DELETE CASCADE,
  role ENUM('instructor', 'student', 'admin', 'secretary', 'expulled') NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role)
);
```

## Usage Examples

### 1. Pre-configured Guards

#### Admin OR Secretary

```typescript
@Get('admin-or-secretary-only')
@UseGuards(JwtAuthGuardAdminOrSecretary)
async adminOrSecretaryOnly() {
  // User needs admin OR secretary role
  return { message: 'Access granted' };
}
```

#### Secretary AND Instructor

```typescript
@Get('secretary-and-instructor-only')
@UseGuards(JwtAuthGuardSecretaryAndInstructor)
async secretaryAndInstructorOnly() {
  // User needs BOTH secretary AND instructor roles
  return { message: 'Access granted' };
}
```

#### Admin AND Secretary

```typescript
@Get('admin-and-secretary-only')
@UseGuards(JwtAuthGuardAdminAndSecretary)
async adminAndSecretaryOnly() {
  // User needs BOTH admin AND secretary roles
  return { message: 'Access granted' };
}
```

### 2. Custom Multi-Role Configuration

#### Using Decorator

```typescript
@Get('custom-endpoint')
@UseGuards(JwtAuthGuardMultiRole)
@MultiRole({
  requiredRoles: ['instructor', 'secretary'],
  requireAll: false, // User needs instructor OR secretary
  allowAdminOverride: true, // Admin can always access
})
async customEndpoint() {
  return { message: 'Access granted' };
}
```

#### Programmatic Configuration

```typescript
@Get('programmatic-endpoint')
@UseGuards(JwtAuthGuardMultiRole.create({
  requiredRoles: ['admin', 'secretary', 'instructor'],
  requireAll: false, // User needs ANY of these roles
  allowAdminOverride: false, // No admin override
}))
async programmaticEndpoint() {
  return { message: 'Access granted' };
}
```

## Configuration Options

### MultiRoleOptions Interface

```typescript
interface MultiRoleOptions {
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

## Role Assignment

### Assign Multiple Roles to User

```typescript
// In your service
async assignMultipleRoles(userId: string, roles: string[]) {
  for (const role of roles) {
    await this.userRolesModel.create({
      user_id: userId,
      role: role,
      is_active: true
    });
  }
}
```

### Example: Give user both admin and secretary roles

```typescript
await this.assignMultipleRoles('user-uuid', ['admin', 'secretary']);
```

## Common Use Cases

### 1. Management Dashboard

```typescript
@Get('management-dashboard')
@UseGuards(JwtAuthGuardAdminOrSecretary)
async getManagementDashboard() {
  // Accessible by admin OR secretary
}
```

### 2. Instructor Portal

```typescript
@Get('instructor-portal')
@UseGuards(JwtAuthGuardMultiRole)
@MultiRole({
  requiredRoles: ['instructor'],
  requireAll: false,
  allowAdminOverride: true
})
async getInstructorPortal() {
  // Accessible by instructor OR admin
}
```

### 3. Secretary + Instructor Features

```typescript
@Get('course-management')
@UseGuards(JwtAuthGuardSecretaryAndInstructor)
async manageCourses() {
  // Only accessible by users with BOTH secretary AND instructor roles
}
```

### 4. Super Admin Features

```typescript
@Get('system-settings')
@UseGuards(JwtAuthGuardAdminAndSecretary)
async systemSettings() {
  // Only accessible by users with BOTH admin AND secretary roles
}
```

## Migration Guide

### From Single Role to Multi-Role

1. **Run the migration** to create the user_roles table
2. **Update existing users** to have roles in the new table
3. **Update guards** to use the new multi-role system
4. **Test thoroughly** to ensure access control works as expected

### Example Migration Script

```typescript
// Migrate existing single roles to multi-role system
async migrateSingleRolesToMultiRole() {
  const users = await this.userModel.findAll();

  for (const user of users) {
    if (user.role) {
      await this.userRolesModel.create({
        user_id: user.id,
        role: user.role,
        is_active: true
      });
    }
  }
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
```

## Best Practices

1. **Use Pre-configured Guards** for common scenarios
2. **Be Explicit** about role requirements in your API documentation
3. **Test Thoroughly** with different role combinations
4. **Consider Admin Override** carefully - it can bypass security
5. **Document Role Requirements** in your API endpoints
6. **Use Meaningful Role Names** that clearly indicate permissions

## Security Considerations

- **Admin Override**: Be careful with `allowAdminOverride: true` as it can bypass all role checks
- **Role Validation**: Always validate roles on the server side
- **Token Security**: Ensure JWT tokens are properly secured
- **Role Hierarchy**: Consider implementing role hierarchies if needed
- **Audit Logging**: Log role changes and access attempts for security auditing
