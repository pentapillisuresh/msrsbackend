const express = require('express');
const { Project } = require('../models');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const projectValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name is required and must be less than 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .isIn([
      'blood_bank', 'educational_resources', 'food_distribution', 
      'vedic_sanskrit_education', 'goshala', 'help_people', 
      'medical_assistance', 'yoga_classes', 'book_bank', 'others'
    ])
    .withMessage('Invalid category')
];

// Get all projects (public)
router.get('/', async (req, res) => {
  try {
    const { category, status, isActive = true } = req.query;
    
    const whereClause = { isActive };
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    const projects = await Project.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { projects }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get projects by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const projects = await Project.findAll({
      where: { 
        category,
        isActive: true 
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { projects }
    });
  } catch (error) {
    console.error('Get projects by category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get active projects
router.get('/active', async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: {
        status: 'active',
        isActive: true
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { projects }
    });
  } catch (error) {
    console.error('Get active projects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    res.json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Create project
router.post('/', projectValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update project
router.put('/:id', projectValidation, async (req, res) => {
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

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    await project.update(req.body);

    res.json({
      status: 'success',
      message: 'Project updated successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    await project.destroy();

    res.json({
      status: 'success',
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;