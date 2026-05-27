const { sequelize } = require('../models');
const { Volunteer, Project, Donation, Event, Meeting } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { Op } = require('sequelize');

// Generate audit report
const getAuditReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const volunteers = await Volunteer.count({ where: dateFilter });
    const projects = await Project.count({ where: dateFilter });
    const donations = await Donation.sum('donationAmount', { where: { ...dateFilter, status: 'completed' } });
    const events = await Event.count({ where: dateFilter });
    const meetings = await Meeting.count({ where: dateFilter });
    
    return successResponse(res, {
      period: { startDate, endDate },
      summary: {
        totalVolunteers: volunteers,
        totalProjects: projects,
        totalDonations: donations || 0,
        totalEvents: events,
        totalMeetings: meetings
      }
    }, 'Audit report generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Generate project report
const getProjectReport = async (req, res) => {
  try {
    const projectsByStatus = await Project.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('budgetRequired')), 'totalBudget']
      ],
      group: ['status']
    });
    
    const projectsByCategory = await Project.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [{ model: require('../models').Category, attributes: ['name'] }],
      group: ['Category.id']
    });
    
    return successResponse(res, {
      byStatus: projectsByStatus,
      byCategory: projectsByCategory
    }, 'Project report generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Generate donation report
const getDonationReport = async (req, res) => {
  try {
    const { year } = req.query;
    const yearFilter = year ? { 
      createdAt: {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`]
      }
    } : {};
    
    const monthlyDonations = await Donation.findAll({
      where: { ...yearFilter, status: 'completed' },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('SUM', sequelize.col('donationAmount')), 'total']
      ],
      group: [sequelize.fn('MONTH', sequelize.col('createdAt'))]
    });
    
    const donationTypes = await Donation.findAll({
      attributes: [
        'donationType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('donationAmount')), 'total']
      ],
      where: { status: 'completed' },
      group: ['donationType']
    });
    
    return successResponse(res, {
      monthlyData: monthlyDonations,
      byType: donationTypes
    }, 'Donation report generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Generate volunteer report
const getVolunteerReport = async (req, res) => {
  try {
    const volunteersByStatus = await Volunteer.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    const volunteersByGender = await Volunteer.findAll({
      attributes: [
        'gender',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['gender']
    });
    
    const volunteersByArea = await require('../models').VolunteerPreference.findAll({
      attributes: [
        'areaOfInterest',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['areaOfInterest']
    });
    
    return successResponse(res, {
      byStatus: volunteersByStatus,
      byGender: volunteersByGender,
      byAreaOfInterest: volunteersByArea
    }, 'Volunteer report generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAuditReport,
  getProjectReport,
  getDonationReport,
  getVolunteerReport
};