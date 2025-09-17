export enum UserRole {
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  ADMIN = 'admin',
  SECRETARY = 'secretary',
}

export interface IUsers {
  id?: number;
  uuid?: string;
  num_record?: string;
  avatar?: string;
  fs_name?: string;
  ls_name?: string;
  nick_name?: string;
  email: string;
  phone?: string;
  password?: string;
  verification_code?: string;
  is_verified?: number;
  status?: number;
  can_update_password?: number;
  adresse_physique?: string;
  pays_residance?: string;
  ville_residance?: string;
  num_piece_identite?: string;
  date_of_birth?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  country?: string;
  city?: string;
  identityNumber?: number;
  dateBirth?: string;
  role: UserRole;
  roles?: number[];
  otp?: string;
  otpExpires?: Date;
}
