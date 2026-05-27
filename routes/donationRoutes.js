const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createDonation,
  verifyPayment,
  getAllDonations,
  getDonationById,
  getDonationStats
} = require('../controllers/donationController');

router.post('/create', createDonation);
router.post('/verify', verifyPayment);
router.get('/', verifyToken, isAdmin, getAllDonations);
router.get('/stats', verifyToken, isAdmin, getDonationStats);
router.get('/:id', verifyToken, isAdmin, getDonationById);

module.exports = router;