const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createDonation,
  verifyPayment,
  getAllDonations,
  getDonationById,
  getDonationStats,
  createDonationFromAdmin,
  updateDonationStatusById
} = require('../controllers/donationController');

router.post('/create', createDonation);
router.post('/createByAdmin', createDonationFromAdmin);
router.post('/verify', verifyPayment);
router.get('/', verifyToken, isAdmin, getAllDonations);
router.get('/stats', verifyToken, isAdmin, getDonationStats);
router.get('/:id', verifyToken, isAdmin, getDonationById);
router.put('/:id/status', verifyToken, isAdmin, updateDonationStatusById);

module.exports = router;