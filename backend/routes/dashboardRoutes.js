const express = require('express');
const router = express.Router();
const {
  getStats,
  getCategoryStats,
  getStatusDistribution,
  getRecentIssues,
} = require('../controllers/dashboardController');

router.get('/stats', getStats);
router.get('/categories', getCategoryStats);
router.get('/status-distribution', getStatusDistribution);
router.get('/recent', getRecentIssues);

module.exports = router;

