import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/assignment',
  jwtSecret: process.env.JWT_SECRET || 'dont_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:4200').split(','),
};
