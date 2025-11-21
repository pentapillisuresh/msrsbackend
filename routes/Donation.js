const express = require('express');
const router = express.Router();
const {
  createDonation,
  deleteDonation,
  getAllDonations,
  getDonationById,
  updateDonation,
  createRazorpayOrder,
  verifyPayment,
  generateQRCode,
  markUPIPaymentCompleted,
  getPaymentSummary
} = require('../controllers/DonationController');

// CREATE
router.post('/', createDonation);

// READ
router.get('/', getAllDonations);
router.get('/:id', getDonationById);

// UPDATE
router.put('/:id', updateDonation);

// DELETE
router.delete('/:id', deleteDonation);

// PAYMENT ROUTES
router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyPayment);
router.post('/generate-qrcode', generateQRCode);
router.post('/complete-upi-payment', markUPIPaymentCompleted);
router.get('/payment/summary', getPaymentSummary);

module.exports = router;