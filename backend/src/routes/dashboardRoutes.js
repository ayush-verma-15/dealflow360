const express = require('express');
const { protect } = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');

const router = express.Router();

module.exports = router;

router.get('/stats', protect, getStats);
