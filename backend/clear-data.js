require('dotenv').config();
const mongoose = require('mongoose');
const Issue = require('./models/Issue');
const User = require('./models/User');

async function clearData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas');

    // Delete all complaints
    const result = await Issue.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} sample complaints.`);

    // Ensure Admin and Citizen user accounts exist so you can log in
    let admin = await User.findOne({ email: 'admin@civictrack.in' });
    if (!admin) {
      admin = await User.create({
        name: 'CivicTrack Admin',
        email: 'admin@civictrack.in',
        passwordHash: 'Admin@123',
        role: 'admin',
      });
      console.log('👤 Admin account verified: admin@civictrack.in');
    } else {
      console.log('👤 Admin account verified: admin@civictrack.in');
    }

    // Recreate indexes
    await Issue.createIndexes();
    console.log('📌 Geospatial 2dsphere indexes ready for new reports.');

    const remainingCount = await Issue.countDocuments();
    console.log(`\n🎉 Website database is now clean! Remaining complaints: ${remainingCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
}

clearData();

