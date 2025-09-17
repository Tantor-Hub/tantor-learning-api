# Passwordless Authentication Implementation

## Completed Tasks

- [x] Update Users model to match specified shape (UUID id, firstName, lastName, email, avatar, address, country, city, identityNumber, dateBirth, role enum, otp, otpExpires)
- [x] Update IUsers interface
- [x] Create DTOs: RegisterPasswordlessDto, LoginPasswordlessDto, VerifyOtpDto
- [x] Add passwordless methods to UsersService: registerPasswordless, loginPasswordless, verifyOtp
- [x] Add passwordless endpoints to UsersController: /user/passwordless/register, /user/passwordless/login, /user/passwordless/verify

## Remaining Tasks

- [ ] Update database schema (run migration or sync)
- [ ] Test the new endpoints
- [ ] Verify email OTP sending
- [ ] Handle OTP expiration (10 minutes)
- [ ] Add validation for identityNumber when country is 'France'
- [ ] Update existing code that references old user fields (fs_name, ls_name, etc.) to use new fields
- [ ] Remove or update old password-based auth methods if no longer needed
