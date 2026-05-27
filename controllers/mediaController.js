const { Media, Category } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create media entry
const createMedia = async (req, res) => {
  try {
    const mediaData = req.body;
    if (req.file) {
      mediaData.file = `/uploads/${mediaData.mediaType === 'image' ? 'images' : 'documents'}/${req.file.filename}`;
    }
    const media = await Media.create(mediaData);
    return successResponse(res, media, 'Media created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all media
const getAllMedia = async (req, res) => {
  try {
    const { status, mediaType, categoryId, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (mediaType) where.mediaType = mediaType;
    if (categoryId) where.categoryId = categoryId;
    
    const offset = (page - 1) * limit;
    const media = await Media.findAndCountAll({
      where,
      include: [{ model: Category }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: media.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: media.rows
    }, 'Media fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get media by ID
const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findByPk(id, {
      include: [{ model: Category }]
    });
    if (!media) {
      return errorResponse(res, 'Media not found', 404);
    }
    return successResponse(res, media, 'Media fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update media
const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const mediaData = req.body;
    
    const media = await Media.findByPk(id);
    if (!media) {
      return errorResponse(res, 'Media not found', 404);
    }
    
    if (req.file) {
      mediaData.file = `/uploads/${mediaData.mediaType === 'image' ? 'images' : 'documents'}/${req.file.filename}`;
    }
    
    await media.update(mediaData);
    return successResponse(res, media, 'Media updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete media
const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findByPk(id);
    if (!media) {
      return errorResponse(res, 'Media not found', 404);
    }
    
    await media.destroy();
    return successResponse(res, null, 'Media deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia
};