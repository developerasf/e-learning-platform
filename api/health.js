import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      return res.status(500).json({ status: 'error', message: 'MongoDB URI not configured - please set MONGODB_URI in Vercel environment variables' });
    }
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return res.json({ status: 'ok', message: 'Connected to MongoDB' });
    }
    
    // Try to connect
    await mongoose.connect(mongoUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });
    
    return res.json({ status: 'ok', message: 'Connected to MongoDB' });
  } catch (error) {
    // Provide more helpful error message based on the error type
    let errorMessage = error.message;
    
    if (error.message.includes('authentication failed')) {
      errorMessage = 'bad auth: authentication failed - check your MONGODB_URI username/password in Vercel environment variables';
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      errorMessage = 'Connection timeout - check your MONGODB_URI database host in Vercel environment variables';
    } else if (error.message.includes('MongoDB URI not configured')) {
      errorMessage = 'MONGODB_URI environment variable is not set in Vercel';
    }
    
    return res.status(500).json({ status: 'error', message: errorMessage });
  }
}
