# Prisma Setup Guide for Tantor Learning API

## 📋 Prerequisites

- Node.js 16+ installed
- PostgreSQL database running
- Existing Tantor Learning API project

## 🚀 Step-by-Step Setup

### 1. Install Prisma Dependencies

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Initialize Prisma (if not already done)

```bash
npx prisma init
```

### 3. Configure Environment Variables

Add to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tantor_learning?schema=public"

# Example for different environments:
# Development
DATABASE_URL="postgresql://postgres:password@localhost:5432/tantor_learning_dev"

# Production
DATABASE_URL="postgresql://postgres:password@your-production-host:5432/tantor_learning_prod"
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Create Initial Migration

```bash
npx prisma migrate dev --name init
```

### 6. Verify Setup

```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can view and edit your data.

## 🔄 Migration from Sequelize

### Option 1: Fresh Start (Recommended for new projects)

1. **Backup your existing data**:

   ```bash
   pg_dump your_database > backup.sql
   ```

2. **Drop existing tables** (if starting fresh):

   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```

3. **Run Prisma migrations**:

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Import your data** (if needed):
   ```bash
   psql your_database < backup.sql
   ```

### Option 2: Gradual Migration

1. **Keep existing Sequelize models running**
2. **Add Prisma alongside** for new features
3. **Gradually migrate endpoints** to use Prisma
4. **Remove Sequelize** once migration is complete

## 🛠️ Development Workflow

### Daily Development

```bash
# Generate client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name describe_your_changes

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Production Deployment

```bash
# Generate client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Verify database
npx prisma db pull
```

## 📁 Project Structure

```
prisma/
├── schema.prisma          # Database schema definition
├── migrations/            # Migration files
│   ├── 20240101000000_init/
│   │   └── migration.sql
│   └── ...
├── README.md             # This file
└── setup.md             # Setup instructions

src/
├── prisma/              # Generated Prisma client
│   └── client.ts
└── ...
```

## 🔧 Integration with NestJS

### 1. Create Prisma Service

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### 2. Create Prisma Module

```typescript
// src/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 3. Use in Your Services

```typescript
// src/trainings/trainings.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.training.findMany({
      include: {
        trainingCategory: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  async create(data: CreateTrainingDto) {
    return this.prisma.training.create({
      data,
      include: {
        trainingCategory: {
          select: {
            title: true,
          },
        },
      },
    });
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Prisma Client not generated"**

   ```bash
   npx prisma generate
   ```

2. **"Database connection failed"**

   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify credentials and database exists

3. **"Migration conflicts"**

   ```bash
   npx prisma migrate reset
   npx prisma migrate dev --name init
   ```

4. **"Schema drift detected"**
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

### Performance Tips

1. **Use select for specific fields**:

   ```typescript
   this.prisma.user.findMany({
     select: {
       id: true,
       email: true,
       firstName: true,
     },
   });
   ```

2. **Use include sparingly**:

   ```typescript
   this.prisma.training.findMany({
     include: {
       trainingCategory: {
         select: { title: true }, // Only get what you need
       },
     },
   });
   ```

3. **Use pagination for large datasets**:
   ```typescript
   this.prisma.training.findMany({
     skip: 0,
     take: 10,
     orderBy: { createdAt: 'desc' },
   });
   ```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma with NestJS](https://docs.nestjs.com/recipes/prisma)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript with Prisma](https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety)

## 🆘 Support

If you encounter issues:

1. Check the [Prisma GitHub Issues](https://github.com/prisma/prisma/issues)
2. Review the [Prisma Community](https://www.prisma.io/community)
3. Check your database logs
4. Verify your schema syntax
