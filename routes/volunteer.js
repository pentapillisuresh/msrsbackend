const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
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
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be less than 100 characters')
    .escape(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phoneNumber')
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters')
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('maritalStatus')
    .optional()
    .isIn(['single', 'married', 'divorced', 'widowed'])
    .withMessage('Invalid marital status'),
  
  body('availability')
    .optional()
    .isIn(['weekdays', 'weekends', 'flexible', 'specific_time'])
    .withMessage('Invalid availability'),
  
  body('areasOfInterest')
    .optional()
    .custom((value) => {
      if (value && !Array.isArray(value)) {
        throw new Error('Areas of interest must be an array');
      }
      if (value) {
        const validInterests = ['temple_service', 'social_service', 'educational_support', 'events', 'medical_camps', 'others'];
        for (const interest of value) {
          if (!validInterests.includes(interest)) {
            throw new Error(`Invalid area of interest: ${interest}`);
          }
        }
      }
      return true;
    }),
  
  body('dateOfBirth')
    .optional()
    .isDate()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16) {
          throw new Error('Volunteer must be at least 16 years old');
        }
      }
      return true;
    })
];

// Public routes
router.post('/apply', volunteerValidation, createVolunteer);

// Protected routes (uncomment authMiddleware when ready)
router.get('/', /* authMiddleware, */ getAllVolunteers);
router.get('/:id', /* authMiddleware, */ getVolunteerById);
router.put('/:id', /* authMiddleware, */ volunteerValidation, updateVolunteer);
router.put('/:id/status', /* authMiddleware, */ updateVolunteerStatus);
router.delete('/:id', /* authMiddleware, */ deleteVolunteer);

module.exports = router;