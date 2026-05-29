const { AccessLog } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create document
const createAccessLog = async (req, res) => {
  try {
    const documentData = req.body;
    const document = await AccessLog.create(documentData);
    return successResponse(res, document, 'AccessLog created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all documents
const getAllAccessLogs = async (req, res) => {
  try {
    const { documentType, status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;
    
    const offset = (page - 1) * limit;
    const documents = await AccessLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: documents.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: documents.rows
    }, 'AccessLogs fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get document by ID
const getAccessLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await AccessLog.findByPk(id);
    if (!document) {
      return errorResponse(res, 'AccessLog not found', 404);
    }
    return successResponse(res, document, 'AccessLog fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update document
const updateAccessLog = async (req, res) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
    
    const document = await AccessLog.findByPk(id);
    if (!document) {
      return errorResponse(res, 'AccessLog not found', 404);
    }
    
    await document.update(documentData);
    return successResponse(res, document, 'AccessLog updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete document
const deleteAccessLog = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await AccessLog.findByPk(id);
    if (!document) {
      return errorResponse(res, 'AccessLog not found', 404);
    }
    
    await document.destroy();
    return successResponse(res, null, 'AccessLog deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createAccessLog,
  getAllAccessLogs,
  getAccessLogById,
  updateAccessLog,
  deleteAccessLog
};