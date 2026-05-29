const { AccessLog } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create accessLog
const createAccessLog = async (req, res) => {
  try {
    const accessLogData = req.body;

    const accessLog = await AccessLog.create(accessLogData);

    return successResponse(
      res,
      {
        accessLog,
        OTP: accessLog.OTP
      },
      'AccessLog created successfully',
      201
    );

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, OTP } = req.body;

    // Validate request
    if (!phoneNumber || !OTP) {
      return errorResponse(
        res,
        'Phone number and OTP are required',
        400
      );
    }

    // Find matching access log
    const accessLog = await AccessLog.findOne({
      where: {
        phoneNumber,
        OTP,
        status: 'active'
      },
      order: [['createdAt', 'DESC']]
    });

    // Invalid OTP
    if (!accessLog) {
      return errorResponse(res, 'Invalid or expired OTP', 400);
    }

    // Update status after successful verification
    accessLog.status = 'inactive';

    await accessLog.save();

    return successResponse(
      res,
      {
        verified: true,
      },
      'OTP verified successfully',
      200
    );

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
  verifyOTP,
  getAllAccessLogs,
  getAccessLogById,
  updateAccessLog,
  deleteAccessLog
};