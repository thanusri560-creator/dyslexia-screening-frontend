import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dyslexia-screening';

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the users collection
    const users = await mongoose.connection.collection('users').find({}).toArray();

    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`📊 Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`User #${index + 1}:`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Created: ${user.createdAt}`);
        console.log(`  Password (hashed): ${user.password ? 'Yes (hidden)' : 'No'}`);
        console.log('');
      });
    }

    // Also check screening results
    const results = await mongoose.connection.collection('screeningresults').find({}).toArray();
    console.log(`\n📋 Screening Results: ${results.length} record(s)`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
