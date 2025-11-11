const express = require('express');
const router = express.Router();
const {createConsultation,getAllConsultations, getConsultationById, updateConsultation, deleteConsultation} = require('../controllers/astrologyConsultationController');

router.post('/', createConsultation);
router.get('/', getAllConsultations);
router.get('/:id', getConsultationById);
router.put('/:id', updateConsultation);
router.delete('/:id', deleteConsultation);

module.exports = router;
