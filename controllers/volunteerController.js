const { Volunteer } = require('../models');
const { validationResult } = require('express-validator');

const createVolunteer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const volunteer = await Volunteer.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Volunteer application submitted successfully',
      data: { volunteer }
    });
  } catch (error) {
    console.error('Create volunteer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const getAllVolunteers = async (req, res) => {
  try {
    const { status, areasOfInterest, availability } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (availability) whereClause.availability = availability;

    const volunteers = await Volunteer.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        volunteers: volunteers.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(volunteers.count / limit),
          totalItems: volunteers.count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get all volunteers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const getVolunteerById = async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    res.json({
      status: 'success',
      data: { volunteer }
    });
  } catch (error) {
    console.error('Get volunteer by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const updateVolunteer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    await volunteer.update(req.body);

    res.json({
      status: 'success',
      message: 'Volunteer information updated successfully',
      data: { volunteer }
    });
  } catch (error) {
    console.error('Update volunteer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    await volunteer.destroy();

    res.json({
      status: 'success',
      message: 'Volunteer record deleted successfully'
    });
  } catch (error) {
    console.error('Delete volunteer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    await volunteer.update({ status });

    res.json({
      status: 'success',
      message: 'Volunteer status updated successfully',
      data: { volunteer }
    });
  } catch (error) {
    console.error('Update volunteer status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
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