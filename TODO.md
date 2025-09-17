# Passwordless Authentication Improvements

## Issues to Fix

- [ ] Fix field mapping inconsistencies (fs_name/ls_name vs firstName/lastName)
- [ ] Add proper role assignment for passwordless users
- [ ] Improve OTP expiration logic
- [ ] Add proper user status initialization
- [ ] Standardize user response format
- [ ] Add better error handling
- [ ] Consider adding rate limiting for OTP verification

## Implementation Steps

1. Update registerPasswordless method in users.service.ts
2. Update loginPasswordless method in users.service.ts
3. Update verifyOtp method in users.service.ts
4. Update DTOs for consistency
5. Test the improved flow
