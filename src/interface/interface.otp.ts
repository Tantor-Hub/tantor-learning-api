export interface IOtp {
  id?: string;
  userId: string;
  otp: string;
  connected: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
