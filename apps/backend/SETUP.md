# Required Dependencies for Auth Implementation

The following npm packages need to be installed:

```bash
npm install @nestjs/jwt @nestjs/passport @nestjs/config passport passport-jwt bcrypt class-validator class-transformer @prisma/client
npm install -D @types/bcrypt @types/passport-jwt prisma
```

## Environment Variables

Create a `.env` file in the backend root with:

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRATION=30d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/moneymanager?schema=public"
```

## Prisma Schema Required

The User model in `prisma/schema.prisma` should include:

```prisma
model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  password            String
  hashedRefreshToken  String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

After creating the schema, run:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
