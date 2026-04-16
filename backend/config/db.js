const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return mongoose.connection;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
