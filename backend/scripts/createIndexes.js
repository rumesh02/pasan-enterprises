const mongoose = require('mongoose');
require('dotenv').config();

// Import models to ensure indexes are registered
const Machine = require('../models/Machine');
const Customer = require('../models/Customer');
const PastOrder = require('../models/PastOrder');
const User = require('../models/User');

const createIndexes = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Creating indexes for all collections...\n');

    // Create indexes for Machine model
    console.log('Creating Machine indexes...');
    await Machine.createIndexes();
    console.log('✅ Machine indexes created');

    // Create indexes for Customer model
    console.log('Creating Customer indexes...');
    await Customer.createIndexes();
    console.log('✅ Customer indexes created');

    // Create indexes for PastOrder model
    console.log('Creating PastOrder indexes...');
    await PastOrder.createIndexes();
    console.log('✅ PastOrder indexes created');

    // Create indexes for User model
    console.log('Creating User indexes...');
    await User.createIndexes();
    console.log('✅ User indexes created');

    console.log('\n🎉 All indexes created successfully!');
    
    // List all indexes
    console.log('\n📋 Listing all indexes:\n');
    
    const pastOrderIndexes = await PastOrder.collection.getIndexes();
    console.log('PastOrder indexes:', JSON.stringify(pastOrderIndexes, null, 2));

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

createIndexes();
