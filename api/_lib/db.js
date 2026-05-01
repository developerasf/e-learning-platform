import mongoose from 'mongoose';
import { createIndexes } from './indexes.js';

// Use globalThis so the connection survives across Vercel serverless hot-reloads.
// A plain module-scope variable resets on every cold start; globalThis persists
// as long as the execution context (container) is alive.
const cached = globalThis._mongooseCache || (globalThis._mongooseCache = { conn: null, promise: null });

export default async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }

    cached.promise = mongoose
      .connect(mongoUri, {
        maxPoolSize: 5,               // limit open connections per container
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,        // fail fast instead of queuing indefinitely
      })
      .then(async (m) => {
        await createIndexes();        // only runs once per container lifetime
        return m;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
