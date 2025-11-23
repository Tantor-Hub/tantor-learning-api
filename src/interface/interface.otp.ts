export enum OtpType {
  NORMAL = 'normal',
  GMAIL = 'gmail',
}

export interface IOtp {
  id?: string;
  userId: string | null;
  otp: string;
  connected: boolean;
  type?: OtpType;
  createdAt?: Date;
  updatedAt?: Date;
}
