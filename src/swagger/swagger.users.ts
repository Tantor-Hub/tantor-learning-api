import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

// User DTOs with Swagger decorators
export class LoginPasswordlessDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  email: string;
}

export class RegisterPasswordlessDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  lastName: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Address',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: 'France',
    description: 'Country',
    required: false,
  })
  country?: string;

  @ApiProperty({
    example: 'Paris',
    description: 'City',
    required: false,
  })
  city?: string;

  @ApiProperty({
    example: 123456789,
    description: 'Phone number',
    required: false,
  })
  phone?: number;
}

export class FindByEmailDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address to search for',
  })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code',
  })
  otp: string;

  @ApiProperty({
    example: 'NewStrongPass123!',
    description: 'New password',
  })
  newPassword: string;

  @ApiProperty({
    example: 'NewStrongPass123!',
    description: 'Confirm new password',
  })
  confirmPassword: string;
}

export class SignInStudentDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Student email address',
  })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code',
  })
  otp: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code to verify',
  })
  otp: string;
}

// Users Controller Swagger Configuration
export const UsersSwagger = {
  controller: {
    tag: 'Users',
    bearerAuth: true,
  },

  methods: {
    loginPasswordless: {
      operation: {
        summary: 'Login passwordless user with OTP',
        description: 'Send OTP to user email for passwordless login',
      },
      body: { type: LoginPasswordlessDto },
      responses: {
        201: {
          description: 'OTP sent successfully',
        },
      },
    },

    registerPasswordless: {
      operation: {
        summary: 'Register new passwordless user',
        description: 'Register a new user with email verification',
      },
      body: { type: RegisterPasswordlessDto },
      responses: {
        201: {
          description: 'User registered successfully',
        },
      },
    },

    findByEmail: {
      operation: {
        summary: 'Find user by email',
        description: 'Search for a user by their email address',
      },
      body: { type: FindByEmailDto },
      responses: {
        200: {
          description: 'User found successfully',
        },
      },
    },

    resetPassword: {
      operation: {
        summary: 'Reset user password',
        description: 'Reset password using OTP verification',
      },
      body: { type: ResetPasswordDto },
      responses: {
        200: {
          description: 'Password reset successfully',
        },
      },
    },

    signInStudent: {
      operation: {
        summary: 'Student sign in with OTP',
        description: 'Authenticate student using email and OTP',
      },
      body: { type: SignInStudentDto },
      responses: {
        200: {
          description: 'Student signed in successfully',
        },
      },
    },

    verifyOtp: {
      operation: {
        summary: 'Verify OTP code',
        description: 'Verify the OTP code sent to user email',
      },
      body: { type: VerifyOtpDto },
      responses: {
        200: {
          description: 'OTP verified successfully',
        },
      },
    },
  },
};
