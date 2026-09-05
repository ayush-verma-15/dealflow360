const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

dotenv.config();

const products = [
  { name: 'Laptop Pro', category: 'Hardware', description: 'High-performance laptop for professionals', basePrice: 50000, stock: 100, margin: 30, taxRate: 18, isPromoted: true },
  { name: 'Laptop Standard', category: 'Hardware', description: 'Reliable everyday laptop', basePrice: 35000, stock: 150, margin: 25, taxRate: 18 },
  { name: 'Server Rack', category: 'Hardware', description: 'Enterprise server rack', basePrice: 150000, stock: 50, margin: 35, taxRate: 18 },
  { name: 'Setup Service', category: 'Service', description: 'Professional setup and configuration', basePrice: 25000, stock: 999, margin: 15, taxRate: 18 },
  { name: 'Data Migration', category: 'Service', description: 'Migration and integration service', basePrice: 35000, stock: 999, margin: 20, taxRate: 18 },
  { name: 'Annual Maintenance', category: 'Subscription', description: 'Yearly maintenance and support', basePrice: 12000, stock: 999, margin: 40, taxRate: 18, isPromoted: true, subscriptionPlan: { frequency: 'monthly', price: 12000, prorationRule: 'pro-rata' } },
  { name: 'Cloud Storage', category: 'Subscription', description: 'Cloud storage and backup', basePrice: 5000, stock: 999, margin: 50, taxRate: 18, subscriptionPlan: { frequency: 'monthly', price: 5000, prorationRule: 'pro-rata' } }
];

const ensureDemoData = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const productMap = {};
  for (const data of products) {
    const product = await Product.findOneAndUpdate(
      { name: data.name, category: data.category },
      { $setOnInsert: data },
      { upsert: true, new: true }
    );
    productMap[data.name] = product._id;
  }

  const warehouses = [
    { name: 'Mumbai Warehouse', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', shippingCostWeight: 1.2, stock: [['Laptop Pro', 60], ['Laptop Standard', 80], ['Server Rack', 20]] },
    { name: 'Delhi Warehouse', city: 'Delhi', state: 'Delhi', pincode: '110001', shippingCostWeight: 1.4, stock: [['Laptop Pro', 40], ['Laptop Standard', 70], ['Server Rack', 30]] },
    { name: 'Bangalore Warehouse', city: 'Bangalore', state: 'Karnataka', pincode: '560001', shippingCostWeight: 1.6, stock: [['Laptop Pro', 30], ['Server Rack', 20]] }
  ];

  for (const data of warehouses) {
    const stock = data.stock.map(([name, quantity]) => ({ productId: productMap[name], quantity, minThreshold: 5, maxThreshold: 100, lastUpdated: new Date() }));
    await Warehouse.findOneAndUpdate(
      { 'location.pincode': data.pincode },
      { $setOnInsert: { code: `${data.city.slice(0, 3).toUpperCase()}-DEMO`, name: data.name, location: { address: data.name, city: data.city, state: data.state, pincode: data.pincode }, shippingCostWeight: data.shippingCostWeight, stock } },
      { upsert: true, new: true }
    );
  }
  console.log(`Ensured ${products.length} products and ${warehouses.length} warehouses`);
  await mongoose.disconnect();
};

ensureDemoData().catch((error) => { console.error(error); process.exitCode = 1; });
