const { Category } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, categoryRelated, description, status } = req.body;
    const category = await Category.create({ name, categoryRelated, description, status });
    return successResponse(res, category, 'Category created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const { categoryRelated, status } = req.query;
    const where = {};
    if (categoryRelated) where.categoryRelated = categoryRelated;
    if (status) where.status = status;
    
    const categories = await Category.findAll({ where, order: [['createdAt', 'DESC']] });
    return successResponse(res, categories, 'Categories fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }
    return successResponse(res, category, 'Category fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryRelated, description, status } = req.body;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }
    
    await category.update({ name, categoryRelated, description, status });
    return successResponse(res, category, 'Category updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }
    
    await category.destroy();
    return successResponse(res, null, 'Category deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};