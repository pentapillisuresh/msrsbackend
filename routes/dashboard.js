
const express = require('express');
const { Media, Project, Invitation } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all media
router.get('/website/active', async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: {
        status: 'active',
        isActive: true
      },
      limit:5,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });
    const invitations = await Invitation.findAll({
      where: whereClause,
      order: [['eventDate', 'ASC']]
    });

    res.json({
      status: 'success',
      projects,
      invitations
    });
  } catch (error) {
    console.error('Get active projects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

router.get('/admin/active', async (req, res) => {
  try {
    const projectsPendings = await Project.count({ where: { status: 'planning'}});
    const projectsCompleteds = await Project.count({ where: { status: 'completed'}});
    const projectsActives = await Project.count({ where: { status: 'active'}});
    const eventPendings = await Invitation.count({ where: { status: 'planning'}});
    const eventCompleteds = await Invitation.count({ where: { status: 'completed'}});
    const eventActives = await Invitation.count({ where: { status: 'active'}});

    res.json({
      status: 'success',
      projects,
      invitations
    });
  } catch (error) {
    console.error('Get active projects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;