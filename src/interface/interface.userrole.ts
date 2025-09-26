export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  SECRETARY = 'secretary',
}

export const VALID_ROLES = Object.values(UserRole);
export const ALL_ROLES = [...VALID_ROLES, 'all'];
