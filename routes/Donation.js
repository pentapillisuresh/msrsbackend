const express = require('express');
const router = express.Router();
const {createDonation,deleteDonation,getAllDonations,getDonationById,updateDonation} = require('../controllers/DonationController');

// CREATE
router.post('/', createDonation);

// READ
router.get('/', getAllDonations);
router.get('/:id', getDonationById);

// UPDATE
router.put('/:id', updateDonation);

// DELETE
router.delete('/:id', deleteDonation);

module.exports = router;
