const express = require('express');
const { Media } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// POST - Create new media
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      fileName,
      filePath,
      fileSize,
      mimeType,
      category,
      tags,
      metadata,
      isActive,
      sortOrder
    } = req.body;

    // Validate required fields
    if (!title || !type || !fileName || !filePath) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, type, fileName, and filePath are required fields'
      });
    }

    // Validate type enum
    const validTypes = ['image', 'video', 'audio', 'document'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Type must be one of: image, video, audio, document'
      });
    }

    const newMedia = await Media.create({
      title,
      description,
      type,
      fileName,
      filePath,
      fileSize,
      mimeType,
      category,
      tags,
      metadata,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0
    });

    const mediaWithUrl = {
      ...newMedia.toJSON(),
      url: `/uploads/${path.relative('uploads', newMedia.filePath).replace(/\\/g, '/')}`
    };

    res.status(201).json({
      status: 'success',
      message: 'Media created successfully',
      data: { media: mediaWithUrl }
    });
  } catch (error) {
    console.error('Create media error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get all media
router.get('/', async (req, res) => {
  try {
    const { type, category, isActive = true } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const whereClause = { isActive };
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;

    const media = await Media.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    // Add URL to each media item
    const mediaWithUrls = media.rows.map(item => ({
      ...item.toJSON(),
      url: `/uploads/${path.relative('uploads', item.filePath).replace(/\\/g, '/')}`
    }));

    res.json({
      status: 'success',
      data: {
        media: mediaWithUrls,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(media.count / limit),
          totalItems: media.count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get media by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findByPk(id);
    if (!media) {
      return res.status(404).json({
        status: 'error',
        message: 'Media not found'
      });
    }

    const mediaWithUrl = {
      ...media.toJSON(),
      url: `/uploads/${path.relative('uploads', media.filePath).replace(/\\/g, '/')}`
    };

    res.json({
      status: 'success',
      data: { media: mediaWithUrl }
    });
  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update media information
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, isActive, sortOrder } = req.body;

    const media = await Media.findByPk(id);
    if (!media) {
      return res.status(404).json({
        status: 'error',
        message: 'Media not found'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    await media.update(updateData);

    const updatedMediaWithUrl = {
      ...media.toJSON(),
      url: `/uploads/${path.relative('uploads', media.filePath).replace(/\\/g, '/')}`
    };

    res.json({
      status: 'success',
      message: 'Media updated successfully',
      data: { media: updatedMediaWithUrl }
    });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get gallery by category
router.get('/gallery/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const media = await Media.findAll({
      where: {
        category,
        isActive: true,
        type: 'image'
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    const mediaWithUrls = media.map(item => ({
      ...item.toJSON(),
      url: `/uploads/${path.relative('uploads', item.filePath).replace(/\\/g, '/')}`
    }));

    res.json({
      status: 'success',
      data: { media: mediaWithUrls }
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Debug route to test if routes are working
router.get('/debug/test', (req, res) => {
  res.json({ 
    message: 'Media routes are working!',
    timestamp: new Date().toISOString(),
    routes: ['POST /', 'GET /', 'GET /:id', 'PUT /:id', 'GET /gallery/:category']
  });
});

module.exports = router;