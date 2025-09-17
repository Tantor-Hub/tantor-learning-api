export interface IUsers {
  id?: string;
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
  roles?: number[];
  last_login?: string;
  can_update_password?: number;
  status?: number;
  firstName?: string;
  lastName?: string;
  address?: string;
  country?: string;
  city?: string;
  identityNumber?: number;
  dateBirth?: string;
  role: 'instructor' | 'student' | 'admin' | 'secretary';
  otp?: string;
  otpExpires?: Date;
}
