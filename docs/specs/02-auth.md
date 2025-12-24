# Authentication

## Auth Methods
- Email + Password
- JWT (Access + Refresh tokens)

## Token Rules
- Access token: 15 minutes
- Refresh token: 30 days
- Refresh token rotation required

## Endpoints
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout

## Security
- Passwords hashed using bcrypt
- Tokens stored securely on device
- UserId derived from token only

## Errors
- INVALID_CREDENTIALS
- USER_ALREADY_EXISTS
- TOKEN_EXPIRED
