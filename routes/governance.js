const express = require('express');
const { Governance } = require('../models');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const governanceValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .isIn(['trustee_responsibilities', 'policies', 'procedures', 'guidelines', 'compliance', 'others'])
    .withMessage('Invalid category')
];

// Get all governance documents (public)
router.get('/', async (req, res) => {
  try {
    const { category, isActive = true } = req.query;
    
    const whereClause = { isActive };
    if (category) whereClause.category = category;

    const governanceDocs = await Governance.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['effectiveDate', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { governanceDocs }
    });
  } catch (error) {
    console.error('Get governance documents error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get trustee responsibilities
router.get('/trustee-responsibilities', async (req, res) => {
  try {
    const responsibilities = await Governance.findAll({
      where: { 
        category: 'trustee_responsibilities',
        isActive: true 
      },
      order: [['sortOrder', 'ASC'], ['effectiveDate', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { responsibilities }
    });
  } catch (error) {
    console.error('Get trustee responsibilities error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get governance document by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const governanceDoc = await Governance.findByPk(id);
    if (!governanceDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Governance document not found'
      });
    }

    res.json({
      status: 'success',
      data: { governanceDoc }
    });
  } catch (error) {
    console.error('Get governance document by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Create governance document
router.post('/', governanceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const governanceDoc = await Governance.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Governance document created successfully',
      data: { governanceDoc }
    });
  } catch (error) {
    console.error('Create governance document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update governance document
router.put('/:id',  governanceValidation, async (req, res) => {
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

    const governanceDoc = await Governance.findByPk(id);
    if (!governanceDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Governance document not found'
      });
    }

    await governanceDoc.update(req.body);

    res.json({
      status: 'success',
      message: 'Governance document updated successfully',
      data: { governanceDoc }
    });
  } catch (error) {
    console.error('Update governance document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Delete governance document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const governanceDoc = await Governance.findByPk(id);
    if (!governanceDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Governance document not found'
      });
    }

    await governanceDoc.destroy();

    res.json({
      status: 'success',
      message: 'Governance document deleted successfully'
    });
  } catch (error) {
    console.error('Delete governance document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;