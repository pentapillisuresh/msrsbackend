const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const {
  createTempleInfo,
  getAllTempleInfo,
  getTempleInfoById,
  updateTempleInfo,
  deleteTempleInfo,
  getTempleInfoByCategory
} = require('../controllers/templeController');

const router = express.Router();

// Validation rules
const templeValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .isIn(['about', 'schedule', 'activities', 'architecture', 'gallery', 'directions', 'important_dates'])
    .withMessage('Invalid category')
];

// Routes
router.get('/', getAllTempleInfo);
router.get('/category/:category', getTempleInfoByCategory);
router.get('/:id', getTempleInfoById);
router.post('/', templeValidation, createTempleInfo);
router.put('/:id', templeValidation, updateTempleInfo);
router.delete('/:id', deleteTempleInfo);

module.exports = router;