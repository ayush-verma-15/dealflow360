// ROHAN - Database Seeder
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

dotenv.config();

const users = [
  {
    name: 'Ayush Kumar',
    email: 'ayush@dealflow.com',
    password: 'Test@123',
    role: 'sales_rep',
    tier: 'Gold',
    company: 'DealFlow Corp'
  },
  {
    name: 'Sales Manager',
    email: 'manager@dealflow.com',
    password: 'Test@123',
    role: 'sales_manager',
    tier: 'Gold',
    company: 'DealFlow Corp'
  },
  {
    name: 'Finance User',
    email: 'finance@dealflow.com',
    password: 'Test@123',
    role: 'finance',
    tier: 'Gold',
    company: 'DealFlow Corp'
  },
  {
    name: 'Admin User',
    email: 'admin@dealflow.com',
    password: 'Test@123',
    role: 'admin',
    tier: 'Gold',
    company: 'DealFlow Corp'
  },
  {
    name: 'Acme Corp',
    email: 'acme@dealflow.com',
    password: 'Test@123',
    role: 'customer',
    tier: 'Gold',
    company: 'Acme Corporation'
  },
  {
    name: 'Beta Industries',
    email: 'beta@dealflow.com',
    password: 'Test@123',
    role: 'customer',
    tier: 'Silver',
    company: 'Beta Industries'
  },
  {
    name: 'Gamma Solutions',
    email: 'gamma@dealflow.com',
    password: 'Test@123',
    role: 'customer',
    tier: 'Bronze',
    company: 'Gamma Solutions'
  }
];

const products = [
  {
    name: 'Laptop Pro',
    category: 'Hardware',
    description: 'High-performance laptop for professionals',
    basePrice: 50000,
    stock: 100,
    margin: 30,
    taxRate: 18,
    isPromoted: true
  },
  {
    name: 'Laptop Standard',
    category: 'Hardware',
    description: 'Standard laptop for everyday use',
    basePrice: 35000,
    stock: 150,
    margin: 25,
    taxRate: 18,
    isPromoted: false
  },
  {
    name: 'Server Rack',
    category: 'Hardware',
    description: 'Enterprise server rack',
    basePrice: 150000,
    stock: 50,
    margin: 35,
    taxRate: 18,
    isPromoted: false
  },
  {
    name: 'Setup Service',
    category: 'Service',
    description: 'Professional setup and configuration service',
    basePrice: 25000,
    stock: 999,
    margin: 15,
    taxRate: 18,
    isPromoted: false
  },
  {
    name: 'Data Migration',
    category: 'Service',
    description: 'Data migration and integration service',
    basePrice: 35000,
    stock: 999,
    margin: 20,
    taxRate: 18,
    isPromoted: false
  },
  {
    name: 'Annual Maintenance',
    category: 'Subscription',
    description: 'Yearly maintenance and support plan',
    basePrice: 12000,
    stock: 999,
    margin: 40,
    taxRate: 18,
    isPromoted: true,
    subscriptionPlan: {
      frequency: 'monthly',
      price: 12000,
      prorationRule: 'pro-rata'
    }
  },
  {
    name: 'Cloud Storage',
    category: 'Subscription',
    description: 'Cloud storage and backup service',
    basePrice: 5000,
    stock: 999,
    margin: 50,
    taxRate: 18,
    isPromoted: false,
    subscriptionPlan: {
      frequency: 'monthly',
      price: 5000,
      prorationRule: 'pro-rata'
    }
  }
];

const warehouses = [
  {
    name: 'Mumbai Warehouse',
    location: {
      address: 'Unit 1, Business Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    stock: [
      { productName: 'Laptop Pro', quantity: 60 },
      { productName: 'Laptop Standard', quantity: 80 },
      { productName: 'Server Rack', quantity: 20 }
    ],
    shippingCostWeight: 1.2
  },
  {
    name: 'Delhi Warehouse',
    location: {
      address: 'Plot 5, Industrial Area',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    stock: [
      { productName: 'Laptop Pro', quantity: 40 },
      { productName: 'Laptop Standard', quantity: 70 },
      { productName: 'Server Rack', quantity: 30 }
    ],
    shippingCostWeight: 1.4
  },
  {
    name: 'Bangalore Warehouse',
    location: {
      address: 'Tech Park, Electronic City',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    stock: [
      { productName: 'Laptop Pro', quantity: 30 },
      { productName: 'Server Rack', quantity: 20 }
    ],
    shippingCostWeight: 1.6
  }
];

// Import data
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Warehouse.deleteMany();
    console.log('Cleared existing data');

    // Insert users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Insert products
    const createdProducts = await Product.create(products);
    console.log(`Created ${createdProducts.length} products`);

    // Map product names to IDs for warehouse stock
    const productMap = {};
    createdProducts.forEach(p => {
      productMap[p.name] = p._id;
    });

    // Insert warehouses with proper product IDs
    const warehouseData = warehouses.map(wh => ({
      ...wh,
      stock: wh.stock.map(s => ({
        productId: productMap[s.productName],
        quantity: s.quantity,
        minThreshold: 5,
        maxThreshold: 100,
        lastUpdated: new Date()
      }))
    }));

    const createdWarehouses = await Warehouse.create(warehouseData);
    console.log(`Created ${createdWarehouses.length} warehouses`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('   Sales Rep:    ayush@dealflow.com / Test@123');
    console.log('   Manager:      manager@dealflow.com / Test@123');
    console.log('   Finance:      finance@dealflow.com / Test@123');
    console.log('   Admin:        admin@dealflow.com / Test@123');
    console.log('   Customer:     acme@dealflow.com / Test@123');

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    await User.deleteMany();
    await Product.deleteMany();
    await Warehouse.deleteMany();
    console.log('Data deleted successfully');

    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Run based on command line argument
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}