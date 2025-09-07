const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-234-567-8901',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    role: 'customer'
  },
  {
    name: 'Admin User',
    email: 'admin@pasanenterprises.com',
    phone: '+1-234-567-8902',
    address: {
      street: '456 Business Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    role: 'admin'
  }
];

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 199.99,
    category: 'electronics',
    brand: 'TechSound',
    stock: 50,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        alt: 'Wireless Bluetooth Headphones'
      }
    ],
    specifications: {
      weight: '250g',
      dimensions: '18cm x 15cm x 8cm',
      color: 'Black',
      material: 'Premium Plastic & Foam',
      warranty: '2 Years'
    },
    ratings: {
      average: 4.5,
      count: 127
    },
    featured: true
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking watch with heart rate monitor, GPS, and smartphone connectivity.',
    price: 299.99,
    category: 'electronics',
    brand: 'FitTech',
    stock: 30,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9',
        alt: 'Smart Fitness Watch'
      }
    ],
    specifications: {
      weight: '45g',
      dimensions: '4.4cm x 3.8cm x 1.2cm',
      color: 'Space Gray',
      material: 'Aluminum & Silicon',
      warranty: '1 Year'
    },
    ratings: {
      average: 4.3,
      count: 89
    },
    featured: true
  },
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable and stylish cotton t-shirt perfect for casual wear.',
    price: 29.99,
    category: 'clothing',
    brand: 'StyleCorp',
    stock: 100,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        alt: 'Premium Cotton T-Shirt'
      }
    ],
    specifications: {
      weight: '180g',
      dimensions: 'Various sizes available',
      color: 'Navy Blue',
      material: '100% Organic Cotton',
      warranty: '30 Days Return'
    },
    ratings: {
      average: 4.7,
      count: 203
    },
    featured: false
  },
  {
    name: 'JavaScript: The Complete Guide',
    description: 'Comprehensive guide to modern JavaScript programming with practical examples.',
    price: 49.99,
    category: 'books',
    brand: 'TechBooks',
    stock: 75,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
        alt: 'JavaScript Programming Book'
      }
    ],
    specifications: {
      weight: '800g',
      dimensions: '23cm x 18cm x 3cm',
      color: 'Multi-color cover',
      material: 'Paper',
      warranty: 'N/A'
    },
    ratings: {
      average: 4.8,
      count: 156
    },
    featured: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`👥 Created ${users.length} users`);

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`📦 Created ${products.length} products`);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Featured Products: ${products.filter(p => p.featured).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
