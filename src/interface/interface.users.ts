export enum UserRole {
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  ADMIN = 'admin',
  SECRETARY = 'secretary',
  EXPULLED = 'expulled',
}

export interface IUsers {
  id?: string;
  avatar?: string;
  email: string;
  phone?: string;
  verification_code?: string;
  last_login?: string;
  is_verified?: boolean;
  num_piece_identite?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  country?: string;
  city?: string;
  dateBirth?: string;
  role: UserRole;
}
