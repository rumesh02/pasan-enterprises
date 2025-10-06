const mongoose = require('mongoose');
require('dotenv').config();

const cleanupData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const customersCollection = db.collection('customers');

    console.log('🧹 Cleaning up empty NIC values...');
    
    // Convert empty strings to null for NIC field
    const result = await customersCollection.updateMany(
      { nic: { $in: ['', null, undefined] } },
      { $unset: { nic: '' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} customers with empty NIC values\n`);

    console.log('🔧 Now creating the unique sparse index on NIC...');
    try {
      await customersCollection.createIndex({ nic: 1 }, { unique: true, sparse: true });
      console.log('✅ Created nic index successfully');
    } catch (err) {
      console.log('ℹ️  Index already exists or error:', err.message);
    }

    // Also create the items.machineId index for PastOrders
    const pastOrdersCollection = db.collection('pastorders');
    console.log('\n🔧 Creating items.machineId index for sales stats...');
    try {
      await pastOrdersCollection.createIndex({ 'items.machineId': 1 });
      console.log('✅ Created items.machineId index successfully');
    } catch (err) {
      console.log('ℹ️  Index already exists or error:', err.message);
    }

    console.log('\n📋 Listing all indexes:');
    const customerIndexes = await customersCollection.indexes();
    console.log('\nCustomer indexes:', JSON.stringify(customerIndexes, null, 2));
    
    const pastOrderIndexes = await pastOrdersCollection.indexes();
    console.log('\nPastOrder indexes:', JSON.stringify(pastOrderIndexes, null, 2));

    console.log('\n🎉 Cleanup and indexing complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

cleanupData();
