const { sequelize, User, Volunteer, Project, Event, Donation, Meeting, Document, ELibrary, Category, Transaction, Message } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { Op } = require('sequelize');

// Main Dashboard API
const getDashboardData = async (req, res) => {
  try {
    const { timeRange = 'all' } = req.query; // all, today, week, month, year
    
    // Calculate date filters based on timeRange
    let dateFilter = {};
    const now = new Date();
    
    switch(timeRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            [Op.gte]: new Date(now.setHours(0, 0, 0, 0))
          }
        };
        break;
      case 'week':
        dateFilter = {
          createdAt: {
            [Op.gte]: new Date(now.setDate(now.getDate() - 7))
          }
        };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            [Op.gte]: new Date(now.setMonth(now.getMonth() - 1))
          }
        };
        break;
      case 'year':
        dateFilter = {
          createdAt: {
            [Op.gte]: new Date(now.setFullYear(now.getFullYear() - 1))
          }
        };
        break;
      default:
        dateFilter = {};
    }
    
    // Execute all queries in parallel for better performance
    const [
      totalVolunteers,
      totalProjects,
      totalEvents,
      totalDonationsAmount,
      totalDonationsCount,
      totalMeetingRequests,
      totalDocuments,
      totalELibrary,
      totalMessages,
      recentEvents,
      recentProjects,
      recentMeetingRequests,
      recentMessages,
      donationStats,
      projectStats,
      volunteerStats,
      eventStats
    ] = await Promise.all([
      // Total Volunteers (approved and active)
      Volunteer.count({ 
        where: { 
          status: { [Op.in]: ['approved', 'active'] }
        } 
      }),
      
      // Total Projects
      Project.count(),
      
      // Total Events
      Event.count(),
      
      // Total Donations Amount (completed)
      Donation.sum('donationAmount', { 
        where: { status: 'completed' }
      }),
      
      // Total Donations Count (completed)
      Donation.count({ 
        where: { status: 'completed' }
      }),
      
      // Total Meeting Requests
      Meeting.count(),
      
      // Total Documents
      Document.count({ where: { status: 'active' } }),
      
      // Total E-Library entries
      ELibrary.count({ where: { status: 'active' } }),
      
      // Total Messages (not deleted)
      Message.count({ where: { isDeleted: false } }),
      
      // Recent Events (last 5)
      Event.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: Category, attributes: ['name'] }],
        attributes: ['id', 'eventName', 'description', 'date', 'time', 'location', 'image', 'status', 'createdAt']
      }),
      
      // Recent Projects (last 5)
      Project.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: Category, attributes: ['name'] }],
        attributes: ['id', 'name', 'objective', 'budgetRequired', 'status', 'state', 'district', 'createdAt']
      }),
      
      // Recent Meeting Requests (last 5)
      Meeting.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'companyName', 'applicantName', 'email', 'mobileNumber', 'preferredMeetingMode', 'preferredDate', 'purposeOfMeeting', 'status', 'createdAt']
      }),
      
      // Recent Messages (last 5)
      Message.findAll({
        limit: 5,
        where: { isDeleted: false },
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'subject', 'message', 'status', 'priority', 'createdAt']
      }),
      
      // Donation Stats (monthly for chart)
      Donation.findAll({
        where: { status: 'completed' },
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
          [sequelize.fn('SUM', sequelize.col('donationAmount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'DESC']],
        limit: 6
      }),
      
      // Project Stats by Status
      Project.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      }),
      
      // Volunteer Stats by Status
      Volunteer.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      }),
      
      // Event Stats by Status
      Event.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      })
    ]);
    
    // Prepare response data
    const dashboardData = {
      summary: {
        totalVolunteers: totalVolunteers || 0,
        totalProjects: totalProjects || 0,
        totalEvents: totalEvents || 0,
        totalDonationsAmount: totalDonationsAmount || 0,
        totalDonationsCount: totalDonationsCount || 0,
        totalMeetingRequests: totalMeetingRequests || 0,
        totalDocuments: totalDocuments || 0,
        totalELibrary: totalELibrary || 0,
        totalMessages: totalMessages || 0
      },
      recentActivities: {
        events: recentEvents,
        projects: recentProjects,
        meetingRequests: recentMeetingRequests,
        messages: recentMessages
      },
      charts: {
        donationStats: donationStats,
        projectStats: projectStats,
        volunteerStats: volunteerStats,
        eventStats: eventStats
      },
      filters: {
        timeRange: timeRange
      },
      lastUpdated: new Date()
    };
    
    return successResponse(res, dashboardData, 'Dashboard data fetched successfully');
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get Quick Stats (minimal data for dashboard widgets)
const getQuickStats = async (req, res) => {
  try {
    const [
      totalVolunteers,
      totalProjects,
      totalEvents,
      totalDonationsAmount,
      totalDonationsCount,
      totalMeetingRequests,
      pendingVolunteers,
      pendingProjects,
      pendingMeetings,
      urgentMessages
    ] = await Promise.all([
      Volunteer.count({ where: { status: { [Op.in]: ['approved', 'active'] } } }),
      Project.count(),
      Event.count(),
      Donation.sum('donationAmount', { where: { status: 'completed' } }),
      Donation.count({ where: { status: 'completed' } }),
      Meeting.count(),
      Volunteer.count({ where: { status: 'pending' } }),
      Project.count({ where: { status: 'pending' } }),
      Meeting.count({ where: { status: 'pending' } }),
      Message.count({ where: { priority: 'urgent', status: { [Op.in]: ['unread', 'read'] }, isDeleted: false } })
    ]);
    
    const quickStats = {
      volunteers: {
        total: totalVolunteers || 0,
        pending: pendingVolunteers || 0
      },
      projects: {
        total: totalProjects || 0,
        pending: pendingProjects || 0
      },
      events: {
        total: totalEvents || 0
      },
      donations: {
        totalAmount: totalDonationsAmount || 0,
        totalCount: totalDonationsCount || 0
      },
      meetings: {
        total: totalMeetingRequests || 0,
        pending: pendingMeetings || 0
      },
      messages: {
        urgent: urgentMessages || 0
      }
    };
    
    return successResponse(res, quickStats, 'Quick stats fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get Dashboard Stats with Growth Percentage
const getDashboardStatsWithGrowth = async (req, res) => {
  try {
    const currentPeriod = new Date();
    const previousPeriod = new Date();
    previousPeriod.setMonth(previousPeriod.getMonth() - 1);
    
    // Current period stats
    const [
      currentVolunteers,
      currentProjects,
      currentEvents,
      currentDonations,
      currentMeetings
    ] = await Promise.all([
      Volunteer.count({ 
        where: { 
          createdAt: { [Op.gte]: currentPeriod.setDate(1) },
          status: { [Op.in]: ['approved', 'active'] }
        }
      }),
      Project.count({ 
        where: { 
          createdAt: { [Op.gte]: currentPeriod.setDate(1) }
        }
      }),
      Event.count({ 
        where: { 
          createdAt: { [Op.gte]: currentPeriod.setDate(1) }
        }
      }),
      Donation.sum('donationAmount', { 
        where: { 
          status: 'completed',
          createdAt: { [Op.gte]: currentPeriod.setDate(1) }
        }
      }),
      Meeting.count({ 
        where: { 
          createdAt: { [Op.gte]: currentPeriod.setDate(1) }
        }
      })
    ]);
    
    // Previous period stats
    const [
      previousVolunteers,
      previousProjects,
      previousEvents,
      previousDonations,
      previousMeetings
    ] = await Promise.all([
      Volunteer.count({ 
        where: { 
          createdAt: { 
            [Op.between]: [previousPeriod.setDate(1), currentPeriod]
          },
          status: { [Op.in]: ['approved', 'active'] }
        }
      }),
      Project.count({ 
        where: { 
          createdAt: { 
            [Op.between]: [previousPeriod.setDate(1), currentPeriod]
          }
        }
      }),
      Event.count({ 
        where: { 
          createdAt: { 
            [Op.between]: [previousPeriod.setDate(1), currentPeriod]
          }
        }
      }),
      Donation.sum('donationAmount', { 
        where: { 
          status: 'completed',
          createdAt: { 
            [Op.between]: [previousPeriod.setDate(1), currentPeriod]
          }
        }
      }),
      Meeting.count({ 
        where: { 
          createdAt: { 
            [Op.between]: [previousPeriod.setDate(1), currentPeriod]
          }
        }
      })
    ]);
    
    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    const stats = {
      volunteers: {
        current: currentVolunteers || 0,
        previous: previousVolunteers || 0,
        growth: calculateGrowth(currentVolunteers, previousVolunteers)
      },
      projects: {
        current: currentProjects || 0,
        previous: previousProjects || 0,
        growth: calculateGrowth(currentProjects, previousProjects)
      },
      events: {
        current: currentEvents || 0,
        previous: previousEvents || 0,
        growth: calculateGrowth(currentEvents, previousEvents)
      },
      donations: {
        current: currentDonations || 0,
        previous: previousDonations || 0,
        growth: calculateGrowth(currentDonations, previousDonations)
      },
      meetings: {
        current: currentMeetings || 0,
        previous: previousMeetings || 0,
        growth: calculateGrowth(currentMeetings, previousMeetings)
      }
    };
    
    return successResponse(res, stats, 'Stats with growth fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get Recent Activities (All types combined)
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const [events, projects, meetings, messages, volunteers] = await Promise.all([
      Event.findAll({
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'eventName', 'description', 'date', 'status', 'createdAt'],
        raw: true
      }),
      Project.findAll({
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'objective', 'budgetRequired', 'status', 'createdAt'],
        raw: true
      }),
      Meeting.findAll({
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'companyName', 'applicantName', 'status', 'createdAt'],
        raw: true
      }),
      Message.findAll({
        limit: parseInt(limit),
        where: { isDeleted: false },
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'subject', 'status', 'createdAt'],
        raw: true
      }),
      Volunteer.findAll({
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'status', 'createdAt'],
        raw: true
      })
    ]);
    
    // Combine and format activities
    const activities = [];
    
    events.forEach(event => {
      activities.push({
        id: event.id,
        type: 'event',
        title: event.eventName,
        description: event.description,
        status: event.status,
        createdAt: event.createdAt,
        icon: '🎉',
        color: '#10B981'
      });
    });
    
    projects.forEach(project => {
      activities.push({
        id: project.id,
        type: 'project',
        title: project.name,
        description: project.objective,
        status: project.status,
        createdAt: project.createdAt,
        icon: '📊',
        color: '#3B82F6'
      });
    });
    
    meetings.forEach(meeting => {
      activities.push({
        id: meeting.id,
        type: 'meeting',
        title: meeting.companyName,
        description: `Meeting request by ${meeting.applicantName}`,
        status: meeting.status,
        createdAt: meeting.createdAt,
        icon: '📅',
        color: '#8B5CF6'
      });
    });
    
    messages.forEach(message => {
      activities.push({
        id: message.id,
        type: 'message',
        title: message.subject,
        description: `From: ${message.name}`,
        status: message.status,
        createdAt: message.createdAt,
        icon: '💬',
        color: '#EF4444'
      });
    });
    
    volunteers.forEach(volunteer => {
      activities.push({
        id: volunteer.id,
        type: 'volunteer',
        title: volunteer.name,
        description: `New volunteer registration`,
        status: volunteer.status,
        createdAt: volunteer.createdAt,
        icon: '🤝',
        color: '#F59E0B'
      });
    });
    
    // Sort by createdAt and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivities = activities.slice(0, parseInt(limit));
    
    return successResponse(res, recentActivities, 'Recent activities fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get Yearly Overview Report
const getYearlyOverview = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const monthlyData = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const month = i + 1;
        const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
        const monthEnd = `${year}-${String(month).padStart(2, '0')}-31`;
        
        const [
          volunteers,
          projects,
          events,
          donations,
          meetings
        ] = await Promise.all([
          Volunteer.count({
            where: {
              createdAt: { [Op.between]: [monthStart, monthEnd] },
              status: { [Op.in]: ['approved', 'active'] }
            }
          }),
          Project.count({
            where: { createdAt: { [Op.between]: [monthStart, monthEnd] } }
          }),
          Event.count({
            where: { createdAt: { [Op.between]: [monthStart, monthEnd] } }
          }),
          Donation.sum('donationAmount', {
            where: {
              status: 'completed',
              createdAt: { [Op.between]: [monthStart, monthEnd] }
            }
          }),
          Meeting.count({
            where: { createdAt: { [Op.between]: [monthStart, monthEnd] } }
          })
        ]);
        
        return {
          month: month,
          monthName: new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' }),
          volunteers: volunteers || 0,
          projects: projects || 0,
          events: events || 0,
          donations: donations || 0,
          meetings: meetings || 0
        };
      })
    );
    
    // Calculate yearly totals
    const yearlyTotals = {
      volunteers: monthlyData.reduce((sum, m) => sum + m.volunteers, 0),
      projects: monthlyData.reduce((sum, m) => sum + m.projects, 0),
      events: monthlyData.reduce((sum, m) => sum + m.events, 0),
      donations: monthlyData.reduce((sum, m) => sum + m.donations, 0),
      meetings: monthlyData.reduce((sum, m) => sum + m.meetings, 0)
    };
    
    return successResponse(res, {
      year: parseInt(year),
      monthlyData,
      yearlyTotals
    }, 'Yearly overview fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get Dashboard Cards Data
const getDashboardCards = async (req, res) => {
  try {
    const [
      totalVolunteers,
      totalProjects,
      totalEvents,
      totalDonations,
      pendingVolunteers,
      pendingProjects,
      upcomingEvents,
      totalMessages
    ] = await Promise.all([
      Volunteer.count({ where: { status: { [Op.in]: ['approved', 'active'] } } }),
      Project.count(),
      Event.count(),
      Donation.sum('donationAmount', { where: { status: 'completed' } }),
      Volunteer.count({ where: { status: 'pending' } }),
      Project.count({ where: { status: 'pending' } }),
      Event.count({ where: { status: 'upcoming', date: { [Op.gte]: new Date() } } }),
      Message.count({ where: { status: 'unread', isDeleted: false } })
    ]);
    
    const cards = [
      {
        title: 'Total Volunteers',
        value: totalVolunteers || 0,
        icon: 'users',
        color: 'blue',
        trend: pendingVolunteers > 0 ? `${pendingVolunteers} pending` : 'active',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600'
      },
      {
        title: 'Total Projects',
        value: totalProjects || 0,
        icon: 'folder',
        color: 'green',
        trend: pendingProjects > 0 ? `${pendingProjects} pending` : 'active',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600'
      },
      {
        title: 'Total Events',
        value: totalEvents || 0,
        icon: 'calendar',
        color: 'purple',
        trend: upcomingEvents > 0 ? `${upcomingEvents} upcoming` : 'no upcoming',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600'
      },
      {
        title: 'Total Donations',
        value: `₹${(totalDonations || 0).toLocaleString('en-IN')}`,
        icon: 'heart',
        color: 'red',
        trend: 'lifetime',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600'
      }
    ];
    
    return successResponse(res, {
      cards,
      unreadMessages: totalMessages || 0
    }, 'Dashboard cards fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get Donation Trend Chart Data
const getDonationTrend = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    const donationData = await Donation.findAll({
      where: { status: 'completed' },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('donationAmount')), 'amount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
      limit: parseInt(months)
    });
    
    const labels = donationData.map(d => d.dataValues.month);
    const amounts = donationData.map(d => parseFloat(d.dataValues.amount) || 0);
    const counts = donationData.map(d => parseInt(d.dataValues.count) || 0);
    
    return successResponse(res, {
      labels,
      datasets: {
        amounts,
        counts
      }
    }, 'Donation trend fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getDashboardData,
  getQuickStats,
  getDashboardStatsWithGrowth,
  getRecentActivities,
  getYearlyOverview,
  getDashboardCards,
  getDonationTrend
};