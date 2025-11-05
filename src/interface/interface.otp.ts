export interface IOtp {
  id?: string;
  userId: string | null;
  otp: string;
  connected: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
