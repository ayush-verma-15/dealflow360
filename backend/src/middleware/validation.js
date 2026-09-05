// AYUSH - Request Validation
const { validationResult } = require('express-validator');

// Validate request
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Validate quotation lines
exports.validateQuotationLines = (req, res, next) => {
  const { lines } = req.body;
  
  if (!lines || lines.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Quotation must have at least one line item'
    });
  }

  for (const line of lines) {
    if (!line.productId) {
      return res.status(400).json({
        success: false,
        message: 'Each line must have a product'
      });
    }
    if (!line.quantity || line.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    if (line.discountPercent && (line.discountPercent < 0 || line.discountPercent > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Discount must be between 0 and 100'
      });
    }
  }

  next();
};