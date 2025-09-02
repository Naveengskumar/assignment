import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  await mongoose.connect(config.mongoUri);
  console.log('✅ Mongo connected');
}
