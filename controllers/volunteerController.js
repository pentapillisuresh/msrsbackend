const { Volunteer, VolunteerPreference, Category } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create volunteer
const createVolunteer = async (req, res) => {
  try {
    const { preferences, ...volunteerData } = req.body;
    const volunteer = await Volunteer.create(volunteerData);
    
    if (preferences && preferences.length > 0) {
      const preferenceData = preferences.map(area => ({
        volunteerId: volunteer.id,
        areaOfInterest: area
      }));
      await VolunteerPreference.bulkCreate(preferenceData);
    }
    
    const volunteerWithPref = await Volunteer.findByPk(volunteer.id, {
      include: [{ model: VolunteerPreference }]
    });
    
    return successResponse(res, volunteerWithPref, 'Volunteer created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all volunteers
const getAllVolunteers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    
    const offset = (page - 1) * limit;
    const volunteers = await Volunteer.findAndCountAll({
      where,
      include: [{ model: VolunteerPreference }, { model: Category }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: volunteers.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: volunteers.rows
    }, 'Volunteers fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get volunteer by ID
const getVolunteerById = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByPk(id, {
      include: [{ model: VolunteerPreference }, { model: Category }]
    });
    
    if (!volunteer) {
      return errorResponse(res, 'Volunteer not found', 404);
    }
    return successResponse(res, volunteer, 'Volunteer fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update volunteer
const updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferences, ...volunteerData } = req.body;
    
    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return errorResponse(res, 'Volunteer not found', 404);
    }
    
    await volunteer.update(volunteerData);
    
    if (preferences) {
      await VolunteerPreference.destroy({ where: { volunteerId: id } });
      const preferenceData = preferences.map(area => ({
        volunteerId: id,
        areaOfInterest: area
      }));
      await VolunteerPreference.bulkCreate(preferenceData);
    }
    
    const updatedVolunteer = await Volunteer.findByPk(id, {
      include: [{ model: VolunteerPreference }, { model: Category }]
    });
    
    return successResponse(res, updatedVolunteer, 'Volunteer updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete volunteer
const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return errorResponse(res, 'Volunteer not found', 404);
    }
    
    await VolunteerPreference.destroy({ where: { volunteerId: id } });
    await volunteer.destroy();
    return successResponse(res, null, 'Volunteer deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update volunteer status
const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return errorResponse(res, 'Volunteer not found', 404);
    }
    
    await volunteer.update({ status });
    return successResponse(res, volunteer, 'Volunteer status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
  updateVolunteerStatus
};