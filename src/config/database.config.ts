import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // Support for DATABASE_URL (common on deployment platforms)
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    console.log('🔗 Using DATABASE_URL for connection');
    const url = new URL(databaseUrl);
    return {
      dialect: 'postgres' as const,
      host: url.hostname,
      port: Number(url.port) || 5432,
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    };
  }

  // Fallback to individual environment variables
  console.log('🔗 Using individual environment variables for connection');
  return {
    dialect: (process.env.APP_BD_DIALECT || 'postgres') as 'postgres',
    host: process.env.APP_BD_HOST,
    port: Number(process.env.APP_BD_PORT) || 5432,
    username: process.env.APP_BD_USERNAME,
    password: process.env.APP_BD_PASSWORD,
    database: process.env.APP_BD_NAME,
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  };
});

export const cloudinaryConfig = registerAs('cloudinary', () => ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}));
