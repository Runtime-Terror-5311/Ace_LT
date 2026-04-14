import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/acelawn';
  
  if (!process.env.MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI not found in environment variables. Falling back to local MongoDB.');
  }

  try {
    console.log(`Attempting to connect to MongoDB...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    console.log('Successfully connected to MongoDB');
  } catch (err: any) {
    console.error('CRITICAL: MongoDB connection error details:');
    console.error(`- Message: ${err.message}`);
    console.error(`- Code: ${err.code}`);
    if (err.message.includes('IP not whitelisted')) {
      console.error('- Recommendation: Ensure your Render IP (or 0.0.0.0/0) is whitelisted in MongoDB Atlas.');
    }
    process.exit(1);
  }
};
