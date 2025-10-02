const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pasan-enterprises');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Sample users data
const users = [
  {
    username: 'admin',
    password: 'admin123',
    fullName: 'System Administrator',
    role: 'admin'
  },
  {
    username: 'rumesh02',
    password: 'rumesh123',
    fullName: 'Rumesh (Owner)',
    role: 'admin'
  }
];

// Seed function
const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing users (optional)
    console.log('Clearing existing users...');
    await User.deleteMany({});
    
    // Create new users
    console.log('Creating new users...');
    const createdUsers = await User.create(users);
    
    console.log(`✅ Successfully created ${createdUsers.length} users:`);
    createdUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.fullName}`);
    });
    
    console.log('\n🔐 Login credentials:');
    users.forEach(user => {
      console.log(`   Username: ${user.username} | Password: ${user.password}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();