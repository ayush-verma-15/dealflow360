const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  register, 
  login, 
  getMe, 
  logout, 
  updateProfile,
  getCustomers,
  getUsers,
  updateUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const allowedSignupRoles = ['sales_rep', 'sales_manager', 'finance', 'operations', 'admin', 'customer'];

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(allowedSignupRoles).withMessage('Invalid account role'),
  body('tier').optional().isIn(['Bronze', 'Silver', 'Gold']).withMessage('Invalid customer tier')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.get('/customers', protect, authorize('admin', 'sales_manager', 'sales_rep', 'finance', 'operations'), getCustomers);
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id', protect, authorize('admin'), updateUser);

module.exports = router;