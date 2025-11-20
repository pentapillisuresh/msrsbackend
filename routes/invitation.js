const express = require('express');
const { Invitation } = require('../models');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const invitationValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('eventDate')
    .isISO8601()
    .withMessage('Valid event date is required'),
  body('venue')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Venue is required and must be less than 200 characters')
];

// Get all invitations (public)
router.get('/', async (req, res) => {
  try {
    const { status = 'published', category } = req.query;
    
    // const whereClause = { status, isActive: true };
    // if (category) {
    //   whereClause.category = category;
    // }

    

    const invitations = await Invitation.findAll({
      // where: whereClause,
      order: [['eventDate', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { invitations }
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const invitations = await Invitation.findAll({
      where: {
        status: 'published',
        isActive: true,
        eventDate: {
          [require('sequelize').Op.gte]: new Date()
        }
      },
      order: [['eventDate', 'ASC']],
      limit: 10
    });

    res.json({
      status: 'success',
      data: { invitations }
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get invitation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findByPk(id);
    if (!invitation) {
      return res.status(404).json({
        status: 'error',
        message: 'Invitation not found'
      });
    }

    res.json({
      status: 'success',
      data: { invitation }
    });
  } catch (error) {
    console.error('Get invitation by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Create invitation
router.post('/', invitationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const invitation = await Invitation.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Invitation created successfully',
      data: { invitation }
    });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update invitation
router.put('/:id', invitationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const invitation = await Invitation.findByPk(id);
    if (!invitation) {
      return res.status(404).json({
        status: 'error',
        message: 'Invitation not found'
      });
    }

    await invitation.update(req.body);

    res.json({
      status: 'success',
      message: 'Invitation updated successfully',
      data: { invitation }
    });
  } catch (error) {
    console.error('Update invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Delete invitation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await Invitation.findByPk(id);
    if (!invitation) {
      return res.status(404).json({
        status: 'error',
        message: 'Invitation not found'
      });
    }

    await invitation.destroy();

    res.json({
      status: 'success',
      message: 'Invitation deleted successfully'
    });
  } catch (error) {
    console.error('Delete invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;