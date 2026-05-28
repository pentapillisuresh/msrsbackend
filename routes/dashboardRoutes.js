const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getDashboardData,
  getQuickStats,
  getDashboardStatsWithGrowth,
  getRecentActivities,
  getYearlyOverview,
  getDashboardCards,
  getDonationTrend
} = require('../controllers/dashboardController');

// All dashboard routes require admin authentication
router.use(verifyToken, isAdmin);

// Main dashboard endpoint
router.get('/', getDashboardData);

// Quick stats for widgets
router.get('/quick-stats', getQuickStats);

// Stats with growth percentage
router.get('/stats-growth', getDashboardStatsWithGrowth);

// Recent activities (all types combined)
router.get('/recent-activities', getRecentActivities);

// Yearly overview report
router.get('/yearly-overview', getYearlyOverview);

// Dashboard cards data
router.get('/cards', getDashboardCards);

// Donation trend chart data
router.get('/donation-trend', getDonationTrend);

module.exports = router;