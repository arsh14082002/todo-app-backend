import mongoose, { mongo } from 'mongoose';
import { config } from 'dotenv';
config();

const mongoURI = process.env.MONGO_URI;

// console.log(mongoURI);

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Connected to MongoDB');
    });
    mongoose.connection.on('error', () => {
      console.log('Error connecting to MongoDB');
      process.exit(1);
    });

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
