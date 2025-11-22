// routes/eventCategoryRoutes.js
const express = require('express');
const router = express.Router();
const {createCategory,getAllCategories,getCategoryById,updateCategory, deleteCategory,} = require('../controllers/elibraryCategoryController');

router.post('/', createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
