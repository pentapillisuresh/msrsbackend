const { Meeting } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create meeting request
const createMeeting = async (req, res) => {
  try {
    const meetingData = req.body;
    const meeting = await Meeting.create(meetingData);
    return successResponse(res, meeting, 'Meeting request created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all meetings
const getAllMeetings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    
    const offset = (page - 1) * limit;
    const meetings = await Meeting.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['preferredDate', 'ASC']]
    });
    
    return successResponse(res, {
      total: meetings.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: meetings.rows
    }, 'Meetings fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get meeting by ID
const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return errorResponse(res, 'Meeting not found', 404);
    }
    return successResponse(res, meeting, 'Meeting fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update meeting
const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meetingData = req.body;
    
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return errorResponse(res, 'Meeting not found', 404);
    }
    
    await meeting.update(meetingData);
    return successResponse(res, meeting, 'Meeting updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete meeting
const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return errorResponse(res, 'Meeting not found', 404);
    }
    
    await meeting.destroy();
    return successResponse(res, null, 'Meeting deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update meeting status
const updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;
    
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return errorResponse(res, 'Meeting not found', 404);
    }
    
    await meeting.update({ status, remark });
    return successResponse(res, meeting, 'Meeting status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  updateMeetingStatus
};