const { Event, Category } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create event
const createEvent = async (req, res) => {
  try {
    const eventData = req.body;
    if (req.file) {
      eventData.image = `/uploads/images/${req.file.filename}`;
    }
    const event = await Event.create(eventData);
    return successResponse(res, event, 'Event created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { status, categoryId, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    
    const offset = (page - 1) * limit;
    const events = await Event.findAndCountAll({
      where,
      include: [{ model: Category }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'ASC']]
    });
    
    return successResponse(res, {
      total: events.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: events.rows
    }, 'Events fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id, {
      include: [{ model: Category }]
    });
    if (!event) {
      return errorResponse(res, 'Event not found', 404);
    }
    return successResponse(res, event, 'Event fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;
    
    const event = await Event.findByPk(id);
    if (!event) {
      return errorResponse(res, 'Event not found', 404);
    }
    
    if (req.file) {
      eventData.image = `/uploads/images/${req.file.filename}`;
    }
    
    await event.update(eventData);
    return successResponse(res, event, 'Event updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) {
      return errorResponse(res, 'Event not found', 404);
    }
    
    await event.destroy();
    return successResponse(res, null, 'Event deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update event status
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const event = await Event.findByPk(id);
    if (!event) {
      return errorResponse(res, 'Event not found', 404);
    }
    
    await event.update({ status });
    return successResponse(res, event, 'Event status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus
};