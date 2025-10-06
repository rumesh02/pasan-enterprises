const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get collections
    const db = mongoose.connection.db;
    const customersCollection = db.collection('customers');
    const pastOrdersCollection = db.collection('pastorders');

    console.log('🔧 Fixing Customer indexes...');
    try {
      // Drop the old nic index
      await customersCollection.dropIndex('nic_1');
      console.log('✅ Dropped old nic_1 index');
    } catch (err) {
      console.log('ℹ️  nic_1 index not found or already dropped');
    }

    // Create new nic index with proper configuration
    await customersCollection.createIndex({ nic: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new nic index with unique and sparse options\n');

    console.log('🔧 Fixing PastOrder indexes...');
    try {
      // Drop the old orderId index if it exists
      await pastOrdersCollection.dropIndex('orderId_1');
      console.log('✅ Dropped old orderId_1 index');
    } catch (err) {
      console.log('ℹ️  orderId_1 index not found or already dropped');
    }

    // Create new orderId index
    await pastOrdersCollection.createIndex({ orderId: 1 }, { unique: true });
    console.log('✅ Created new orderId index with unique option');

    // Create items.machineId index for fast sales stats queries
    await pastOrdersCollection.createIndex({ 'items.machineId': 1 });
    console.log('✅ Created items.machineId index for sales stats\n');

    console.log('🎉 All indexes fixed successfully!');

    // List all indexes
    console.log('\n📋 Current indexes:\n');
    const customerIndexes = await customersCollection.indexes();
    console.log('Customer indexes:', JSON.stringify(customerIndexes, null, 2));
    
    const pastOrderIndexes = await pastOrdersCollection.indexes();
    console.log('\nPastOrder indexes:', JSON.stringify(pastOrderIndexes, null, 2));

  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

fixIndexes();
