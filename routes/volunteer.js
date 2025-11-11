const express = require('express');
const { body } = require('express-validator');
const { authMiddleware,  } = require('../middleware/auth');
const {
  createVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
  updateVolunteerStatus
} = require('../controllers/volunteerController');

const router = express.Router();

// Validation rules
const volunteerValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('phoneNumber')
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Valid phone number is required'),
  body('maritalStatus')
    .isIn(['single', 'married', 'divorced', 'widowed'])
    .withMessage('Invalid marital status'),
  body('availability')
    .isIn(['weekdays', 'weekends', 'flexible', 'specific_time'])
    .withMessage('Invalid availability')
];

// Public routes
router.post('/apply', volunteerValidation, createVolunteer);

// Protected routes
router.get('/', getAllVolunteers);
router.get('/:id', getVolunteerById);
router.put('/:id', updateVolunteer);
router.put('/:id/status', updateVolunteerStatus);
router.delete('/:id', deleteVolunteer);

module.exports = router;