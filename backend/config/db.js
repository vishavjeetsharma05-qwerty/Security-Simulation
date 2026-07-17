import mongoose from 'mongoose';

let useJsonDb = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    useJsonDb = true;
    return { isMock: true };
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    return { isMock: false };
  } catch (error) {
    useJsonDb = true;
    return { isMock: true };
  }
}

export function isUsingJsonDb() {
  return useJsonDb;
}
