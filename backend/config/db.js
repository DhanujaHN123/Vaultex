const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    // 1. Try connecting to local MongoDB daemon first (e.g. mongodb://localhost:27017/vaultx)
    console.log(`Connecting to MongoDB at: ${process.env.MONGO_URI || 'mongodb://localhost:27017/vaultx'}...`);
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vaultx', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected to Local Daemon: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️ Local mongod daemon not reachable (${error.message}).`);
    console.log(`🚀 Starting high-performance built-in Local MongoDB Server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'vaultx',
        },
      });
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ VaultX Local MongoDB Server is active & connected! URI: ${uri}`);
    } catch (innerError) {
      console.error(`❌ Failed to start local embedded MongoDB: ${innerError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
