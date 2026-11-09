const mongoose = require('mongoose');
const Issue = require('../models/Issue');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civictrack';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected to external server: ${conn.connection.host}`);
    
    // Ensure geospatial 2dsphere and search indexes exist
    await Issue.createIndexes();
    console.log('📌 Database indexes verified');
  } catch (error) {
    console.warn(`⚠️ Could not connect to MongoDB at "${uri}". Starting embedded MongoDB engine...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Embedded MongoDB Started and Connected: ${memoryUri}`);

      // Ensure indexes
      await Issue.createIndexes();
    } catch (memErr) {
      console.error(`❌ Failed to start embedded MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Clean shutdown
process.on('SIGINT', async () => {
  if (mongod) await mongod.stop();
  process.exit(0);
});

module.exports = connectDB;
