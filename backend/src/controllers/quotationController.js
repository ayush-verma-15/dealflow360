// AYUSH - Quotation Controller
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const User = require('../models/User');
const calculateBlendedRiskScore = require('../utils/blendedRiskScore');
const optimizeWarehouseSplit = require('../utils/warehouseSplit');

// @desc    Create quotation
// @route   POST /api/quotes
// @access  Private
exports.createQuotation = async (req, res) => {
  try {
    const { customer, lines, notes } = req.body;

    // Check customer exists
    const customerExists = await User.findById(customer);
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Validate lines
    if (!lines || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one product line'
      });
    }

    // Get product details and calculate
    const processedLines = [];
    for (const line of lines) {
      const product = await Product.findById(line.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${line.productId}`
        });
      }

      const unitPrice = product.basePrice;
      const lineType = product.category === 'Subscription' ? 'subscription' : 'one-time';

      processedLines.push({
        product: product._id,
        productName: product.name,
        quantity: line.quantity,
        unitPrice: unitPrice,
        discountPercent: line.discountPercent || 0,
        lineType: lineType
      });
    }

    // Create quotation
    const quotation = new Quotation({
      customer: customer,
      salesRep: req.user.id,
      lines: processedLines,
      notes: notes || ''
    });

    // Calculate blended risk score
    const riskScore = calculateBlendedRiskScore(processedLines, customerExists.tier);
    quotation.blendedRiskScore = riskScore;

    // Set approval status based on risk score
    if (riskScore.needsFinanceApproval) {
      quotation.approvalStatus = 'pending-finance';
      quotation.approvalChain.push({
        role: 'manager',
        status: 'pending'
      });
      quotation.approvalChain.push({
        role: 'finance',
        status: 'pending'
      });
    } else if (riskScore.needsManagerApproval) {
      quotation.approvalStatus = 'pending-manager';
      quotation.approvalChain.push({
        role: 'manager',
        status: 'pending'
      });
    } else {
      quotation.approvalStatus = 'approved';
    }

    // Add to audit log
    quotation.auditLog.push({
      user: req.user.id,
      action: 'Created quotation',
      timestamp: new Date()
    });

    await quotation.save();

    // Populate quotation details
    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate('customer', 'name email tier')
      .populate('salesRep', 'name email')
      .populate('lines.product');

    res.status(201).json({
      success: true,
      data: populatedQuotation
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all quotations
// @route   GET /api/quotes
// @access  Private
exports.getQuotations = async (req, res) => {
  try {
    const { status, approvalStatus, customer, salesRep } = req.query;

    let query = {};
    
    // Filter by role
    if (req.user.role === 'sales_rep') {
      query.salesRep = req.user.id;
    }
    
    // Additional filters
    if (status) query.status = status;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (customer) query.customer = customer;
    if (salesRep) query.salesRep = salesRep;

    const quotations = await Quotation.find(query)
      .populate('customer', 'name email tier')
      .populate('salesRep', 'name email')
      .populate('lines.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quotations.length,
      data: quotations
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single quotation
// @route   GET /api/quotes/:id
// @access  Private
exports.getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customer', 'name email tier company')
      .populate('salesRep', 'name email')
      .populate('lines.product')
      .populate('approvalChain.userId', 'name email')
      .populate('warehouseSplit.warehouse', 'name location')
      .populate('invoice');

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check access rights
    if (req.user.role === 'sales_rep' && quotation.salesRep._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this quotation'
      });
    }

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update quotation
// @route   PUT /api/quotes/:id
// @access  Private
exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check if quotation can be updated
    if (quotation.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update quotation after it has been sent'
      });
    }

    const { lines } = req.body;

    if (lines) {
      const processedLines = [];
      for (const line of lines) {
        const product = await Product.findById(line.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${line.productId}`
          });
        }

        const unitPrice = product.basePrice;
        const lineType = product.category === 'Subscription' ? 'subscription' : 'one-time';

        processedLines.push({
          product: product._id,
          productName: product.name,
          quantity: line.quantity,
          unitPrice: unitPrice,
          discountPercent: line.discountPercent || 0,
          lineType: lineType
        });
      }

      quotation.lines = processedLines;
      
      // Recalculate risk score
      const customer = await User.findById(quotation.customer);
      const riskScore = calculateBlendedRiskScore(processedLines, customer.tier);
      quotation.blendedRiskScore = riskScore;

      // Reset approval if risk score changed
      if (riskScore.needsFinanceApproval) {
        quotation.approvalStatus = 'pending-finance';
      } else if (riskScore.needsManagerApproval) {
        quotation.approvalStatus = 'pending-manager';
      } else {
        quotation.approvalStatus = 'approved';
      }
    }

    quotation.auditLog.push({
      user: req.user.id,
      action: 'Updated quotation',
      timestamp: new Date()
    });

    await quotation.save();

    const updatedQuotation = await Quotation.findById(req.params.id)
      .populate('customer', 'name email tier')
      .populate('salesRep', 'name email')
      .populate('lines.product');

    res.status(200).json({
      success: true,
      data: updatedQuotation
    });
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve quotation
// @route   POST /api/quotes/:id/approve
// @access  Private (Manager or Finance)
exports.approveQuotation = async (req, res) => {
  try {
    const { reason } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check if quotation is pending approval
    if (quotation.approvalStatus === 'approved' || quotation.approvalStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Quotation already processed'
      });
    }

    // Determine which role is approving
    let role = '';
    if (req.user.role === 'sales_manager') role = 'manager';
    else if (req.user.role === 'finance') role = 'finance';
    else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve quotations'
      });
    }

    // Find pending approval step
    const approvalStep = quotation.approvalChain.find(
      step => step.role === role && step.status === 'pending'
    );

    if (!approvalStep) {
      return res.status(400).json({
        success: false,
        message: 'No pending approval for this role'
      });
    }

    // Update approval step
    approvalStep.status = 'approved';
    approvalStep.userId = req.user.id;
    approvalStep.timestamp = new Date();
    approvalStep.reason = reason || 'Approved';

    // Check if all approvals are done
    const allApproved = quotation.approvalChain.every(step => step.status === 'approved');
    
    if (allApproved) {
      quotation.approvalStatus = 'approved';
      
      // Generate warehouse split
      try {
        const warehouses = await require('../models/Warehouse').find({ isActive: true });
        const splitResult = optimizeWarehouseSplit(quotation.lines, warehouses);
        quotation.warehouseSplit = splitResult.split;
      } catch (error) {
        console.error('Warehouse split error:', error);
      }

      // Generate billing
      try {
        const BillingEngine = require('../utils/billingEngine');
        await BillingEngine.generateBillingSchedule(quotation._id);
      } catch (error) {
        console.error('Billing generation error:', error);
      }
    }

    quotation.auditLog.push({
      user: req.user.id,
      action: `Approved (${role})`,
      reason: reason || 'Approved',
      timestamp: new Date()
    });

    await quotation.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`deal-${quotation._id}`).emit('status-changed', {
        quoteId: quotation._id,
        status: quotation.approvalStatus,
        action: 'approve',
        role: role,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quotation approved successfully',
      data: quotation
    });
  } catch (error) {
    console.error('Approve quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reject quotation
// @route   POST /api/quotes/:id/reject
// @access  Private (Manager or Finance)
exports.rejectQuotation = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for rejection'
      });
    }

    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check if quotation is pending approval
    if (quotation.approvalStatus === 'approved' || quotation.approvalStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Quotation already processed'
      });
    }

    // Determine which role is rejecting
    let role = '';
    if (req.user.role === 'sales_manager') role = 'manager';
    else if (req.user.role === 'finance') role = 'finance';
    else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject quotations'
      });
    }

    // Find pending approval step
    const approvalStep = quotation.approvalChain.find(
      step => step.role === role && step.status === 'pending'
    );

    if (!approvalStep) {
      return res.status(400).json({
        success: false,
        message: 'No pending approval for this role'
      });
    }

    // Update approval step
    approvalStep.status = 'rejected';
    approvalStep.userId = req.user.id;
    approvalStep.timestamp = new Date();
    approvalStep.reason = reason;

    quotation.approvalStatus = 'rejected';

    quotation.auditLog.push({
      user: req.user.id,
      action: `Rejected (${role})`,
      reason: reason,
      timestamp: new Date()
    });

    await quotation.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`deal-${quotation._id}`).emit('status-changed', {
        quoteId: quotation._id,
        status: 'rejected',
        action: 'reject',
        role: role,
        reason: reason,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quotation rejected',
      data: quotation
    });
  } catch (error) {
    console.error('Reject quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete quotation
// @route   DELETE /api/quotes/:id
// @access  Private
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Only allow deletion of draft quotations
    if (quotation.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a quotation that has been sent'
      });
    }

    await quotation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get risk score for quotation
// @route   GET /api/quotes/:id/risk
// @access  Private
exports.getRiskScore = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        blendedRiskScore: quotation.blendedRiskScore,
        approvalStatus: quotation.approvalStatus,
        approvalChain: quotation.approvalChain
      }
    });
  } catch (error) {
    console.error('Get risk score error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};