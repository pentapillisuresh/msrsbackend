const express = require('express');
const { Team } = require('../models');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const teamValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('designation')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Designation is required and must be less than 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

// Get all team members (public)
router.get('/', async (req, res) => {
  try {
    const { department, isActive = true } = req.query;
    
    const whereClause = { isActive };
    if (department) whereClause.department = department;

    const teamMembers = await Team.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['joinedDate', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { teamMembers }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get team member by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await Team.findByPk(id);
    if (!teamMember) {
      return res.status(404).json({
        status: 'error',
        message: 'Team member not found'
      });
    }

    res.json({
      status: 'success',
      data: { teamMember }
    });
  } catch (error) {
    console.error('Get team member by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Create team member
router.post('/', teamValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const teamMember = await Team.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Team member created successfully',
      data: { teamMember }
    });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update team member
router.put('/:id', teamValidation, async (req, res) => {
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

    const teamMember = await Team.findByPk(id);
    if (!teamMember) {
      return res.status(404).json({
        status: 'error',
        message: 'Team member not found'
      });
    }

    await teamMember.update(req.body);

    res.json({
      status: 'success',
      message: 'Team member updated successfully',
      data: { teamMember }
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Delete team member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await Team.findByPk(id);
    if (!teamMember) {
      return res.status(404).json({
        status: 'error',
        message: 'Team member not found'
      });
    }

    await teamMember.destroy();

    res.json({
      status: 'success',
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;