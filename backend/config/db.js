const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civictrack';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected to external server: ${conn.connection.host}`);
    
    // Auto-seed if empty
    const { seedData } = require('../seed');
    await seedData(false);
  } catch (error) {
    console.warn(`⚠️ Could not connect to MongoDB at "${uri}". Starting embedded MongoDB engine...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Embedded MongoDB Started and Connected: ${memoryUri}`);

      // Auto seed sample data
      const { seedData } = require('../seed');
      await seedData(true);
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
