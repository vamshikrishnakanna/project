require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Issue = require('./models/Issue');
const User = require('./models/User');

const BENGALURU_ISSUES = [
  // ── MG Road & surroundings ───────────────────────────────────────────────
  {
    title: 'Large Pothole on MG Road near Brigade Road Junction',
    description: 'A very large and dangerous pothole has formed near the Brigade Road junction on MG Road. It is causing accidents and vehicle damage for motorists and two-wheelers. Immediate repair needed.',
    category: 'Pothole',
    location: { type: 'Point', coordinates: [77.6035, 12.9757], address: 'MG Road, near Brigade Road', area: 'MG Road', city: 'Bengaluru' },
    status: 'Under Review',
    reporter: { name: 'Ravi Kumar', contact: 'ravi.kumar@email.com' },
    image: { url: null, filename: null },
  },
  {
    title: 'Pothole cluster on MG Road causing traffic slowdown',
    description: 'Multiple potholes have appeared near the Brigade Road signal on MG Road. Two-wheelers are at risk. The road surface is severely damaged and needs urgent patching.',
    category: 'Pothole',
    location: { type: 'Point', coordinates: [77.6038, 12.9755], address: 'MG Road near Brigade Road signal', area: 'MG Road', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Priya Sharma', contact: null },
    image: { url: null, filename: null },
    isDuplicate: true,
  },
  // ── Indiranagar ──────────────────────────────────────────────────────────
  {
    title: 'Overflowing Garbage Bin near Indiranagar 100ft Road',
    description: 'The garbage bin near the Indiranagar 100ft road junction is overflowing. Waste is scattered all around creating a health hazard and foul smell in the area. BBMP needs to increase collection frequency.',
    category: 'Garbage',
    location: { type: 'Point', coordinates: [77.6413, 12.9784], address: '100ft Road, Indiranagar', area: 'Indiranagar', city: 'Bengaluru' },
    status: 'In Progress',
    reporter: { name: 'Anjali Nair', contact: '9876543210' },
    image: { url: null, filename: null },
  },
  {
    title: 'Garbage overflow creating nuisance at Indiranagar market',
    description: 'Garbage bins near the Indiranagar vegetable market are overflowing with waste. Waste is spilling onto the footpath and road. The smell is unbearable and stray animals are scavenging.',
    category: 'Garbage',
    location: { type: 'Point', coordinates: [77.6415, 12.9782], address: 'Indiranagar Market, 100ft Road', area: 'Indiranagar', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Anonymous', contact: null },
    image: { url: null, filename: null },
    isDuplicate: true,
  },
  // ── Koramangala ──────────────────────────────────────────────────────────
  {
    title: 'Broken Streetlight in Koramangala 5th Block',
    description: 'The streetlight near Koramangala 5th block park has been non-functional for over two weeks. This is creating a safety hazard especially for women returning home late. Immediate replacement needed.',
    category: 'Streetlight',
    location: { type: 'Point', coordinates: [77.6263, 12.9346], address: '5th Block, Koramangala', area: 'Koramangala', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Meera Reddy', contact: 'meera@gmail.com' },
    image: { url: null, filename: null },
  },
  {
    title: 'Street lamp not working near Koramangala park',
    description: 'A street lamp near the main park in Koramangala 5th block has stopped working. The area is very dark at night. This streetlight failure is making the area unsafe for pedestrians and residents.',
    category: 'Streetlight',
    location: { type: 'Point', coordinates: [77.6261, 12.9344], address: 'Koramangala 5th Block Park', area: 'Koramangala', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Anonymous', contact: null },
    image: { url: null, filename: null },
    isDuplicate: true,
  },
  // ── Whitefield ──────────────────────────────────────────────────────────
  {
    title: 'Water Leakage on Whitefield Main Road',
    description: 'A BWSSB water pipeline is leaking near the Whitefield main road near ITPL Gate 1. Water is flowing continuously on the road causing waterlogging and wastage of thousands of litres of water daily.',
    category: 'Water Leakage',
    location: { type: 'Point', coordinates: [77.7480, 12.9879], address: 'Whitefield Main Road near ITPL Gate 1', area: 'Whitefield', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Suresh Babu', contact: '8765432109' },
    image: { url: null, filename: null },
  },
  {
    title: 'Pipeline burst near Whitefield ITPL causing water waste',
    description: 'Water is gushing out from a broken pipeline near ITPL main gate in Whitefield. Huge amount of water is being wasted. The road is also becoming slippery and dangerous for vehicles.',
    category: 'Water Leakage',
    location: { type: 'Point', coordinates: [77.7483, 12.9876], address: 'ITPL Main Gate, Whitefield', area: 'Whitefield', city: 'Bengaluru' },
    status: 'Under Review',
    reporter: { name: 'Tech Park Employee', contact: null },
    image: { url: null, filename: null },
    isDuplicate: true,
  },
  // ── Jayanagar ──────────────────────────────────────────────────────────
  {
    title: 'Road Damage on Jayanagar 4th Block Main Road',
    description: 'The main road in Jayanagar 4th block has severely deteriorated. Large chunks of asphalt are missing and the road surface is broken. This is causing accidents and traffic jams in the peak hours.',
    category: 'Road Damage',
    location: { type: 'Point', coordinates: [77.5826, 12.9299], address: '4th Block Main Road, Jayanagar', area: 'Jayanagar', city: 'Bengaluru' },
    status: 'In Progress',
    reporter: { name: 'Vinod Kumar', contact: 'vinod.k@hotmail.com' },
    image: { url: null, filename: null },
  },
  // ── HSR Layout ───────────────────────────────────────────────────────────
  {
    title: 'Drainage Blockage in HSR Layout Sector 1',
    description: 'The main drainage channel in HSR Layout Sector 1 is completely blocked with silt and garbage. During rains, water overflows onto the road and enters nearby houses causing flooding and health hazards.',
    category: 'Drainage',
    location: { type: 'Point', coordinates: [77.6376, 12.9121], address: 'Sector 1, HSR Layout', area: 'HSR Layout', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Ramesh Gowda', contact: null },
    image: { url: null, filename: null },
  },
  {
    title: 'Blocked drain causing flooding in HSR Layout sector',
    description: 'Drainage near HSR Layout sector 1 is clogged and water is overflowing. During recent rains water entered residential properties. The blockage needs to be cleared urgently before monsoon gets worse.',
    category: 'Drainage',
    location: { type: 'Point', coordinates: [77.6379, 12.9119], address: 'HSR Layout Sector 1 near water tank', area: 'HSR Layout', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Lakshmi Devi', contact: '9988776655' },
    image: { url: null, filename: null },
    isDuplicate: true,
  },
  // ── Electronic City ─────────────────────────────────────────────────────
  {
    title: 'Damaged Traffic Sign on Electronic City Flyover',
    description: 'The speed limit sign board on Electronic City Phase 1 flyover is completely damaged and bent. It is hanging dangerously and could fall. The signboard needs to be replaced immediately for road safety.',
    category: 'Traffic Sign Damage',
    location: { type: 'Point', coordinates: [77.6694, 12.8451], address: 'Electronic City Flyover, Phase 1', area: 'Electronic City', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'IT Employee', contact: null },
    image: { url: null, filename: null },
  },
  // ── Bannerghatta Road ───────────────────────────────────────────────────
  {
    title: 'Major Pothole on Bannerghatta Road near JP Nagar',
    description: 'An extremely dangerous pothole has developed on Bannerghatta Road near JP Nagar 7th phase junction. The pothole is about 2 feet deep and 3 feet wide. Multiple vehicles have been damaged.',
    category: 'Pothole',
    location: { type: 'Point', coordinates: [77.5951, 12.8963], address: 'Bannerghatta Road, near JP Nagar 7th Phase', area: 'JP Nagar', city: 'Bengaluru' },
    status: 'Resolved',
    reporter: { name: 'Arun Prakash', contact: 'arun.p@gmail.com' },
    image: { url: null, filename: null },
  },
  // ── Hebbal ──────────────────────────────────────────────────────────────
  {
    title: 'Garbage Dump near Hebbal Lake',
    description: 'People are illegally dumping garbage near Hebbal lake causing environmental damage and pollution. The garbage is attracting stray animals and birds near the lake area. This is damaging the lake ecosystem.',
    category: 'Garbage',
    location: { type: 'Point', coordinates: [77.5980, 13.0470], address: 'Hebbal Lake Road', area: 'Hebbal', city: 'Bengaluru' },
    status: 'Under Review',
    reporter: { name: 'Environmental Activist', contact: null },
    image: { url: null, filename: null },
  },
  // ── Marathahalli ────────────────────────────────────────────────────────
  {
    title: 'Water Leakage at Marathahalli Bridge Junction',
    description: 'A water main pipeline is leaking near the Marathahalli bridge junction. Water has been flowing for over a week creating potholes in the road and waterlogging. BWSSB needs to repair this urgently.',
    category: 'Water Leakage',
    location: { type: 'Point', coordinates: [77.7006, 12.9591], address: 'Marathahalli Bridge Junction', area: 'Marathahalli', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Anonymous', contact: null },
    image: { url: null, filename: null },
  },
  // ── Yelahanka ───────────────────────────────────────────────────────────
  {
    title: 'Broken Streetlight at Yelahanka New Town',
    description: 'Three streetlights on the main road in Yelahanka New Town have been broken for the past month. The area is completely dark at night. Residents are afraid to walk at night and petty crimes have increased.',
    category: 'Streetlight',
    location: { type: 'Point', coordinates: [77.5981, 13.1010], address: 'Yelahanka New Town Main Road', area: 'Yelahanka', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Residents Association', contact: '9876012345' },
    image: { url: null, filename: null },
  },
  // ── Rajajinagar ─────────────────────────────────────────────────────────
  {
    title: 'Severe Drainage Problem in Rajajinagar',
    description: 'The drainage system in Rajajinagar 1st block is completely broken. During every rain, the entire street gets flooded knee-deep. Residents are facing immense hardship. This has been ongoing since last monsoon.',
    category: 'Drainage',
    location: { type: 'Point', coordinates: [77.5564, 12.9960], address: '1st Block, Rajajinagar', area: 'Rajajinagar', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Block Resident', contact: null },
    image: { url: null, filename: null },
  },
  // ── Sadashivanagar ──────────────────────────────────────────────────────
  {
    title: 'Road Surface Damage near Sadashivanagar Circle',
    description: 'The road surface near Sadashivanagar police station circle has completely deteriorated. Large potholes and uneven road surface are causing danger. The road was recently repaired but already damaged again.',
    category: 'Road Damage',
    location: { type: 'Point', coordinates: [77.5801, 13.0156], address: 'Sadashivanagar Circle', area: 'Sadashivanagar', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Anonymous', contact: null },
    image: { url: null, filename: null },
  },
  // ── RT Nagar ────────────────────────────────────────────────────────────
  {
    title: 'Traffic Sign Missing at RT Nagar Cross',
    description: 'The directional traffic sign board at RT Nagar main cross has been missing for weeks. This is causing confusion for drivers unfamiliar with the area and leading to wrong turns and traffic issues.',
    category: 'Traffic Sign Damage',
    location: { type: 'Point', coordinates: [77.5969, 13.0274], address: 'RT Nagar Main Cross', area: 'RT Nagar', city: 'Bengaluru' },
    status: 'Under Review',
    reporter: { name: 'Anonymous', contact: null },
    image: { url: null, filename: null },
  },
  // ── Vijayanagar ─────────────────────────────────────────────────────────
  {
    title: 'Public Infrastructure Damage at Vijayanagar Park',
    description: 'Several benches and facilities in the Vijayanagar public park have been vandalized and damaged. The park wall has also partially collapsed. Children who play there are at risk. BBMP must restore the park.',
    category: 'Other',
    location: { type: 'Point', coordinates: [77.5340, 12.9718], address: 'Vijayanagar Public Park', area: 'Vijayanagar', city: 'Bengaluru' },
    status: 'Reported',
    reporter: { name: 'Park User', contact: null },
    image: { url: null, filename: null },
  },
];

async function seedData(force = false) {
  try {
    const issueCount = await Issue.countDocuments();
    if (issueCount > 0 && !force) {
      console.log(`ℹ️ Database already has ${issueCount} issues. Skipping seed.`);
      return;
    }

    if (force) {
      await Issue.deleteMany({});
      await User.deleteMany({});
      console.log('🗑️  Cleared existing data for fresh seed');
    }

    // Ensure admin user
    let admin = await User.findOne({ email: 'admin@civictrack.in' });
    if (!admin) {
      admin = await User.create({
        name: 'CivicTrack Admin',
        email: 'admin@civictrack.in',
        passwordHash: 'Admin@123',
        role: 'admin',
      });
      console.log(`👤 Admin created: ${admin.email}`);
    }

    // Ensure test user
    let user = await User.findOne({ email: 'user@civictrack.in' });
    if (!user) {
      user = await User.create({
        name: 'Test Citizen',
        email: 'user@civictrack.in',
        passwordHash: 'User@1234',
        role: 'user',
      });
      console.log('👤 Test citizen created: user@civictrack.in');
    }

    if (issueCount === 0 || force) {
      // Build 2dsphere index before inserting
      await Issue.createIndexes();
      const inserted = await Issue.insertMany(BENGALURU_ISSUES);
      console.log(`✅ Seeded ${inserted.length} sample civic issues in Bengaluru`);
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  }
}

if (require.main === module) {
  const connectDB = require('./config/db');
  connectDB().then(() => seedData(true)).then(() => process.exit(0));
}

module.exports = { seedData, BENGALURU_ISSUES };
