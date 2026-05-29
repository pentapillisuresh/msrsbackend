const { AccessLog } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create accessLog
const createAccessLog = async (req, res) => {
  try {
    const accessLogData = req.body;
    const accessLog = await AccessLog.create(accessLogData);
    return successResponse(res, accessLog, 'AccessLog created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all accessLogs
const getAllAccessLogs = async (req, res) => {
  try {
    const { accessLogType, page = 1, limit = 10 } = req.query;
    const where = {};
    if (accessLogType) where.accessLogType = accessLogType;
    
    const offset = (page - 1) * limit;
    const accessLog = await AccessLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: accessLog.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: accessLog.rows
    }, 'AccessLogs fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get accessLog by ID
const getAccessLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const accessLog = await AccessLog.findByPk(id);
    if (!accessLog) {
      return errorResponse(res, 'AccessLog not found', 404);
    }
    return successResponse(res, accessLog, 'AccessLog fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update accessLog
const updateAccessLog = async (req, res) => {
  try {
    const { id } = req.params;
    const accessLogData = req.body;
    
    const accessLog = await AccessLog.findByPk(id);
    if (!accessLog) {
      return errorResponse(res, 'AccessLog not found', 404);
    }
    
    await accessLog.update(accessLogData);
    return successResponse(res, accessLog, 'AccessLog updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete accessLog
const deleteAccessLog = async (req, res) => {
  try {
    const { id } = req.params;
    const accessLog = await AccessLog.findByPk(id);
    if (!accessLog) {
      return errorResponse(res, 'AccessLog not found', 404);
    }
    
    await accessLog.destroy();
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