import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const allowMemoryFallback = process.env.USE_MEMORY_DB_FALLBACK !== 'false';

  try {
    if (uri && !process.env.FORCE_MEMORY_DB) {
      console.log(`Connecting to MongoDB at ${uri}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }
  } catch (err) {
    console.warn(`⚠️ Could not connect to external MongoDB: ${err.message}`);
    if (!allowMemoryFallback) {
      throw err;
    }
  }

  // Fallback to In-Memory MongoDB for local development and testing
  if (allowMemoryFallback) {
    console.log('🔄 Spinning up in-memory MongoDB server for development/testing...');
    mongoMemoryInstance = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ In-Memory MongoDB Connected at: ${memoryUri}`);
    return conn;
  }

  throw new Error('No MongoDB connection available');
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryInstance) {
    await mongoMemoryInstance.stop();
  }
};
