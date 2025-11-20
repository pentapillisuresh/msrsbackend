const Volunteer = require('../models/Volunteer');
const { validationResult } = require('express-validator');
const sequelize = require('../config/database');

const createVolunteer = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Creating volunteer with data:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Prepare volunteer data
    const volunteerData = {
      ...req.body,
      // Ensure areasOfInterest is properly formatted
      areasOfInterest: Array.isArray(req.body.areasOfInterest) ? req.body.areasOfInterest : null
    };

    // Create volunteer within transaction
    const volunteer = await Volunteer.create(volunteerData, { transaction });

    // Commit transaction
    await transaction.commit();

    console.log('Volunteer created successfully:', volunteer.volunteerId);

    res.status(201).json({
      status: 'success',
      message: 'Volunteer application submitted successfully',
      data: { 
        volunteer: {
          id: volunteer.id,
          volunteerId: volunteer.volunteerId,
          name: volunteer.name,
          email: volunteer.email,
          qualification: volunteer.qualification,
          occupation: volunteer.occupation,
          gender: volunteer.gender,
          bloodGroup: volunteer.bloodGroup,
          isBloodDonor: volunteer.isBloodDonor,
          dateOfBirth: volunteer.dateOfBirth,
          address: volunteer.address,
          phoneNumber: volunteer.phoneNumber,
          maritalStatus: volunteer.maritalStatus,
          areasOfInterest: volunteer.areasOfInterest,
          availability: volunteer.availability,
          feedback_suggestions: volunteer.feedback_suggestions,
          status: volunteer.status,
          createdAt: volunteer.createdAt,
          updatedAt: volunteer.updatedAt
        }
      }
    });
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    
    console.error('Create volunteer error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors ? error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      })) : null
    });
    
    // Handle specific Sequelize errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'error',
        message: 'Volunteer with this ID already exists. Please try again.',
        field: error.errors[0]?.path || 'volunteerId'
      });
    }

    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({
        status: 'error',
        message: 'Database error. Please check your input data.'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error. Please try again later.'
    });
  }
};

const getAllVolunteers = async (req, res) => {
  try {
    const { status, areasOfInterest, availability, page = 1, limit = 10, search } = req.query;
    
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const offset = (currentPage - 1) * itemsPerPage;

    const whereClause = {};
    
    // Filter by status
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      whereClause.status = status;
    }
    
    // Filter by availability
    if (availability && ['weekdays', 'weekends', 'flexible', 'specific_time'].includes(availability)) {
      whereClause.availability = availability;
    }
    
    // Search by name or email
    if (search) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.like]: `%${search}%` } },
        { email: { [sequelize.Op.like]: `%${search}%` } },
        { volunteerId: { [sequelize.Op.like]: `%${search}%` } }
      ];
    }

    // Filter by areas of interest (if provided as array)
    if (areasOfInterest) {
      const interests = Array.isArray(areasOfInterest) ? areasOfInterest : [areasOfInterest];
      whereClause.areasOfInterest = {
        [sequelize.Op.overlap]: interests
      };
    }

    const { count, rows: volunteers } = await Volunteer.findAndCountAll({
      where: whereClause,
      limit: itemsPerPage,
      offset: offset,
      order: [['createdAt', 'DESC']],
      attributes: { 
        exclude: ['updatedAt'] // Exclude updatedAt from response
      }
    });

    const totalPages = Math.ceil(count / itemsPerPage);

    res.json({
      status: 'success',
      data: {
        volunteers,
        pagination: {
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: count,
          itemsPerPage: itemsPerPage,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all volunteers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch volunteers'
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
      message: 'Failed to fetch volunteer details'
    });
  }
};

const updateVolunteer = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    // Prepare update data (exclude volunteerId from updates)
    const updateData = { ...req.body };
    delete updateData.volunteerId; // Prevent volunteerId from being updated

    await volunteer.update(updateData, { transaction });
    await transaction.commit();

    res.json({
      status: 'success',
      message: 'Volunteer information updated successfully',
      data: { volunteer }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update volunteer error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update volunteer information'
    });
  }
};

const deleteVolunteer = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    await volunteer.destroy({ transaction });
    await transaction.commit();

    res.json({
      status: 'success',
      message: 'Volunteer record deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete volunteer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete volunteer record'
    });
  }
};

const updateVolunteerStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Volunteer not found'
      });
    }

    await volunteer.update({ status }, { transaction });
    await transaction.commit();

    res.json({
      status: 'success',
      message: 'Volunteer status updated successfully',
      data: { volunteer }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update volunteer status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update volunteer status'
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