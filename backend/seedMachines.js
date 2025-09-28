const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Machine = require('./models/Machine');
const connectDB = require('./db');

// Sample machine data
const sampleMachines = [
  {
    itemId: 'HP-001234',
    name: 'Centrifugal Water Pump',
    category: 'Pumps',
    description: 'High-performance centrifugal pump suitable for water supply systems. Features corrosion-resistant materials and efficient operation.',
    quantity: 15,
    price: 45000.00
  },
  {
    itemId: 'MT-567890',
    name: '3-Phase Induction Motor',
    category: 'Motors',
    description: '5HP three-phase induction motor with high efficiency rating. Suitable for industrial applications and heavy-duty operations.',
    quantity: 8,
    price: 75000.00
  },
  {
    itemId: 'PP-111222',
    name: 'PVC Pipe 6-inch',
    category: 'Pipes',
    description: 'High-grade PVC pipe with 6-inch diameter. Ideal for water distribution and drainage systems. Length: 20 feet.',
    quantity: 50,
    price: 2500.00
  },
  {
    itemId: 'BR-333444',
    name: 'Ball Bearing SKF 6205',
    category: 'Bearings',
    description: 'Premium quality SKF ball bearing, model 6205. Suitable for high-speed applications with excellent durability.',
    quantity: 25,
    price: 1200.00
  },
  {
    itemId: 'VL-555666',
    name: 'Gate Valve 4-inch',
    category: 'Valves',
    description: 'Heavy-duty gate valve with 4-inch diameter. Made from cast iron with brass internals for long-lasting performance.',
    quantity: 12,
    price: 8500.00
  }
];

const seedMachines = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🌱 Starting to seed machines...');
    
    // Clear existing machines (optional - remove this line to keep existing data)
    await Machine.deleteMany({});
    console.log('🗑️  Cleared existing machines');
    
    // Insert sample machines
    const insertedMachines = await Machine.insertMany(sampleMachines);
    
    console.log(`✅ Successfully seeded ${insertedMachines.length} machines:`);
    insertedMachines.forEach(machine => {
      console.log(`   📦 ${machine.itemId} - ${machine.name} (${machine.category})`);
    });
    
    console.log('🎉 Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding machines:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedMachines();
}

module.exports = seedMachines;