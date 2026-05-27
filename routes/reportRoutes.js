const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getAuditReport,
  getProjectReport,
  getDonationReport,
  getVolunteerReport
} = require('../controllers/reportController');

router.get('/audit', verifyToken, isAdmin, getAuditReport);
router.get('/projects', verifyToken, isAdmin, getProjectReport);
router.get('/donations', verifyToken, isAdmin, getDonationReport);
router.get('/volunteers', verifyToken, isAdmin, getVolunteerReport);

module.exports = router;