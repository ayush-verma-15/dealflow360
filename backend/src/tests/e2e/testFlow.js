// ROHAN - E2E Test Flow (8 Steps)
const mongoose = require('mongoose');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Quotation = require('../../models/Quotation');
const Warehouse = require('../../models/Warehouse');
const Invoice = require('../../models/Invoice');
const BillingEngine = require('../../utils/billingEngine');
const calculateBlendedRiskScore = require('../../utils/blendedRiskScore');
const optimizeWarehouseSplit = require('../../utils/warehouseSplit');

async function testCompleteFlow() {
  console.log('🚀 Starting 8-Step Test Flow...\n');
  
  try {
    // ============================================
    // STEP 1: Setup backend data
    // ============================================
    console.log('1️⃣ Setting up backend data...');
    
    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@dealflow.com',
      password: 'Test@123',
      role: 'admin'
    });
    
    // Create sales rep
    const rep = await User.create({
      name: 'Sales Rep',
      email: 'rep@dealflow.com',
      password: 'Test@123',
      role: 'sales_rep'
    });
    
    // Create customer (Gold tier)
    const customer = await User.create({
      name: 'Acme Corp',
      email: 'acme@dealflow.com',
      password: 'Test@123',
      role: 'customer',
      tier: 'Gold'
    });
    
    // Create manager
    const manager = await User.create({
      name: 'Sales Manager',
      email: 'manager@dealflow.com',
      password: 'Test@123',
      role: 'sales_manager'
    });
    
    // Create finance user
    const finance = await User.create({
      name: 'Finance User',
      email: 'finance@dealflow.com',
      password: 'Test@123',
      role: 'finance'
    });
    
    // Create products
    const laptop = await Product.create({
      name: 'Laptop Pro',
      category: 'Hardware',
      basePrice: 50000,
      stock: 100,
      margin: 30
    });
    
    const service = await Product.create({
      name: 'Setup Service',
      category: 'Service',
      basePrice: 25000,
      stock: 999,
      margin: 15
    });
    
    const subscription = await Product.create({
      name: 'Annual Maintenance',
      category: 'Subscription',
      basePrice: 12000,
      stock: 999,
      margin: 40,
      subscriptionPlan: {
        frequency: 'monthly',
        price: 12000,
        prorationRule: 'pro-rata'
      }
    });
    
    // Create warehouses
    const warehouse1 = await Warehouse.create({
      name: 'Mumbai Warehouse',
      location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      stock: [{ productId: laptop._id, quantity: 60 }],
      shippingCostWeight: 1.2
    });
    
    const warehouse2 = await Warehouse.create({
      name: 'Delhi Warehouse',
      location: { city: 'Delhi', state: 'Delhi', pincode: '110001' },
      stock: [
        { productId: laptop._id, quantity: 40 },
        { productId: service._id, quantity: 50 }
      ],
      shippingCostWeight: 1.4
    });
    
    console.log('✅ Setup complete!');
    console.log(`   Customer: ${customer.name} (${customer.tier})`);
    console.log(`   Products: ${laptop.name}, ${service.name}, ${subscription.name}`);
    console.log(`   Warehouses: ${warehouse1.name}, ${warehouse2.name}\n`);
    
    // ============================================
    // STEP 2: Create quotation with high discount
    // ============================================
    console.log('2️⃣ Creating quotation with high discount...');
    
    const lines = [
      {
        product: laptop,
        quantity: 10,
        unitPrice: laptop.basePrice,
        discountPercent: 12, // Under limit (15% allowed)
        lineType: 'one-time'
      },
      {
        product: service,
        quantity: 5,
        unitPrice: service.basePrice,
        discountPercent: 18, // OVER limit (10% allowed for service)
        lineType: 'one-time'
      }
    ];
    
    const quote = new Quotation({
      customer: customer._id,
      salesRep: rep._id,
      lines: lines
    });
    
    // Calculate risk score
    const riskScore = calculateBlendedRiskScore(lines, customer.tier);
    quote.blendedRiskScore = riskScore;
    
    if (riskScore.needsFinanceApproval) {
      quote.approvalStatus = 'pending-finance';
      quote.approvalChain.push(
        { role: 'manager', status: 'pending' },
        { role: 'finance', status: 'pending' }
      );
    } else if (riskScore.needsManagerApproval) {
      quote.approvalStatus = 'pending-manager';
      quote.approvalChain.push({ role: 'manager', status: 'pending' });
    } else {
      quote.approvalStatus = 'approved';
    }
    
    await quote.save();
    
    console.log('✅ Quotation created!');
    console.log(`   Quote Number: ${quote.quoteNumber}`);
    console.log(`   Risk Score: ${riskScore.score}`);
    console.log(`   Approval Status: ${quote.approvalStatus}`);
    console.log(`   Needs Manager: ${riskScore.needsManagerApproval}`);
    console.log(`   Needs Finance: ${riskScore.needsFinanceApproval}\n`);
    
    // ============================================
    // STEP 3: Check auto-approval routing
    // ============================================
    console.log('3️⃣ Checking auto-approval routing...');
    
    if (quote.approvalStatus === 'pending-manager' || quote.approvalStatus === 'pending-finance') {
      console.log('✅ Auto-approval routing triggered correctly!');
      console.log(`   Status: ${quote.approvalStatus}`);
      console.log(`   Approval Chain: ${quote.approvalChain.map(a => a.role).join(' → ')}\n`);
    } else {
      throw new Error('Auto-approval not triggered!');
    }
    
    // ============================================
    // STEP 4: Accept upsell suggestion
    // ============================================
    console.log('4️⃣ Accepting upsell suggestion...');
    
    // Simulate upsell suggestion
    const upsellProduct = subscription;
    const upsellLine = {
      product: upsellProduct,
      quantity: 1,
      unitPrice: upsellProduct.basePrice,
      discountPercent: 0,
      lineType: 'subscription'
    };
    
    // Add upsell to quotation
    quote.lines.push(upsellLine);
    
    // Recalculate risk score
    const newRiskScore = calculateBlendedRiskScore(quote.lines, customer.tier);
    quote.blendedRiskScore = newRiskScore;
    
    // Recalculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    quote.lines.forEach(line => {
      const lineTotal = line.quantity * line.unitPrice;
      const lineDiscount = lineTotal * (line.discountPercent / 100);
      line.total = lineTotal - lineDiscount;
      subtotal += lineTotal;
      totalDiscount += lineDiscount;
    });
    quote.subtotal = subtotal;
    quote.totalDiscount = totalDiscount;
    quote.totalAmount = subtotal - totalDiscount;
    
    await quote.save();
    
    console.log('✅ Upsell added to quotation!');
    console.log(`   Added: ${upsellProduct.name}`);
    console.log(`   New Total: ₹${quote.totalAmount.toLocaleString()}`);
    console.log(`   New Risk Score: ${newRiskScore.score}\n`);
    
    // ============================================
    // STEP 5: Get approval
    // ============================================
    console.log('5️⃣ Getting approval...');
    
    // Simulate manager approval
    const managerApproval = quote.approvalChain.find(a => a.role === 'manager');
    if (managerApproval) {
      managerApproval.status = 'approved';
      managerApproval.userId = manager._id;
      managerApproval.timestamp = new Date();
      managerApproval.reason = 'Approved by manager';
    }
    
    // Check if finance approval needed
    const financeApproval = quote.approvalChain.find(a => a.role === 'finance');
    if (financeApproval) {
      financeApproval.status = 'approved';
      financeApproval.userId = finance._id;
      financeApproval.timestamp = new Date();
      financeApproval.reason = 'Approved by finance';
    }
    
    // Check if all approvals done
    const allApproved = quote.approvalChain.every(a => a.status === 'approved');
    if (allApproved) {
      quote.approvalStatus = 'approved';
    }
    
    await quote.save();
    
    console.log('✅ Quotation approved!');
    console.log(`   Status: ${quote.approvalStatus}`);
    console.log(`   Approved by: ${quote.approvalChain.map(a => a.role).join(', ')}\n`);
    
    // ============================================
    // STEP 6: Check warehouse split
    // ============================================
    console.log('6️⃣ Checking warehouse split...');
    
    // Get warehouses for split
    const warehouses = await Warehouse.find({ isActive: true }).populate('stock.productId');
    const splitResult = optimizeWarehouseSplit(quote.lines, warehouses);
    
    quote.warehouseSplit = splitResult.split;
    await quote.save();
    
    console.log('✅ Warehouse split generated!');
    console.log(`   Total Shipments: ${splitResult.totalShipments}`);
    console.log(`   Fulfillment Rate: ${splitResult.fulfillmentRate}%`);
    console.log(`   Total Cost: ₹${splitResult.totalShippingCost}`);
    console.log(`   Backorders: ${splitResult.backorders.length > 0 ? 'Yes' : 'No'}\n`);
    
    // ============================================
    // STEP 7: Customer negotiation
    // ============================================
    console.log('7️⃣ Customer negotiation...');
    
    // Simulate customer requesting higher discount
    quote.negotiation = {
      status: 'pending',
      requestedDiscount: 20,
      comments: [
        {
          user: customer._id,
          message: 'Requesting 20% discount on total order',
          timestamp: new Date()
        }
      ]
    };
    
    // Check if request exceeds threshold
    const currentDiscount = quote.totalDiscount / quote.subtotal * 100;
    if (quote.negotiation.requestedDiscount > currentDiscount + 5) {
      // Re-enter approval flow
      quote.approvalStatus = 'pending-manager';
      quote.approvalChain.push({
        role: 'manager',
        status: 'pending',
        reason: 'Negotiation request'
      });
    }
    
    await quote.save();
    
    console.log('✅ Negotiation processed!');
    console.log(`   Requested Discount: ${quote.negotiation.requestedDiscount}%`);
    console.log(`   New Status: ${quote.approvalStatus}\n`);
    
    // ============================================
    // STEP 8: Confirm & payment
    // ============================================
    console.log('8️⃣ Confirming order and processing payment...');
    
    // Confirm quotation
    quote.status = 'confirmed';
    
    // Generate billing
    const billingData = await BillingEngine.generateBillingSchedule(quote._id);
    
    // Process payment
    if (billingData.oneTimeInvoice) {
      const paymentResult = await BillingEngine.processPayment(
        billingData.oneTimeInvoice._id,
        { method: 'bank_transfer' }
      );
      
      console.log('✅ Order confirmed and paid!');
      console.log(`   Invoice Number: ${billingData.oneTimeInvoice.invoiceNumber}`);
      console.log(`   Amount Paid: ₹${paymentResult.amount.toLocaleString()}`);
      console.log(`   Transaction ID: ${paymentResult.transactionId}`);
      console.log(`   Status: ${paymentResult.status}`);
    }
    
    console.log('\n🎉 All 8 steps completed successfully!');
    console.log('📊 Final Quotation Status:');
    console.log(`   Quote: ${quote.quoteNumber}`);
    console.log(`   Status: ${quote.status}`);
    console.log(`   Total Amount: ₹${quote.totalAmount.toLocaleString()}`);
    console.log(`   Approval: ${quote.approvalStatus}`);
    console.log(`   Invoice Generated: ${!!billingData.oneTimeInvoice}`);
    console.log(`   Subscriptions: ${billingData.subscriptionSchedule?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Clean up
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  // Connect to database and run test
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to database');
      testCompleteFlow();
    })
    .catch(err => {
      console.error('Database connection error:', err);
    });
}

module.exports = testCompleteFlow;