const { ELibrary, Category } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create E-Library entry
const createELibrary = async (req, res) => {
  try {
    const eLibraryData = req.body;
    if (req.file) {
      eLibraryData.file = `/uploads/documents/${req.file.filename}`;
    }
    const eLibrary = await ELibrary.create(eLibraryData);
    return successResponse(res, eLibrary, 'E-Library entry created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all E-Library entries
const getAllELibrary = async (req, res) => {
  try {
    const { status, categoryId, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    
    const offset = (page - 1) * limit;
    const eLibrary = await ELibrary.findAndCountAll({
      where,
      include: [{ model: Category }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: eLibrary.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: eLibrary.rows
    }, 'E-Library entries fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get E-Library entry by ID
const getELibraryById = async (req, res) => {
  try {
    const { id } = req.params;
    const eLibrary = await ELibrary.findByPk(id, {
      include: [{ model: Category }]
    });
    if (!eLibrary) {
      return errorResponse(res, 'E-Library entry not found', 404);
    }
    return successResponse(res, eLibrary, 'E-Library entry fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update E-Library entry
const updateELibrary = async (req, res) => {
  try {
    const { id } = req.params;
    const eLibraryData = req.body;
    
    const eLibrary = await ELibrary.findByPk(id);
    if (!eLibrary) {
      return errorResponse(res, 'E-Library entry not found', 404);
    }
    
    if (req.file) {
      eLibraryData.file = `/uploads/documents/${req.file.filename}`;
    }
    
    await eLibrary.update(eLibraryData);
    return successResponse(res, eLibrary, 'E-Library entry updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete E-Library entry
const deleteELibrary = async (req, res) => {
  try {
    const { id } = req.params;
    const eLibrary = await ELibrary.findByPk(id);
    if (!eLibrary) {
      return errorResponse(res, 'E-Library entry not found', 404);
    }
    
    await eLibrary.destroy();
    return successResponse(res, null, 'E-Library entry deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createELibrary,
  getAllELibrary,
  getELibraryById,
  updateELibrary,
  deleteELibrary
};