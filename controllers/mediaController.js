const { Media, Category } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const path = require('path');

// Create media entry
const createMedia = async (req, res) => {
  try {
    const mediaData = { ...req.body };

    if (req.file) {
      // Fix: Store relative path instead of absolute Windows path
      // Convert: D:/msrsbackend/uploads/videos/file.mp4 -> /uploads/videos/file.mp4
      let relativePath = req.file.path.replace(/\\/g, '/');
      
      // Extract everything after 'uploads/'
      const uploadsIndex = relativePath.indexOf('/uploads/');
      if (uploadsIndex !== -1) {
        relativePath = relativePath.substring(uploadsIndex);
      } else {
        // If no /uploads/ found, just use filename
        const filename = relativePath.split('/').pop();
        const folder = mediaData.mediaType === 'video' ? 'videos' : 
                      mediaData.mediaType === 'image' ? 'images' : 'documents';
        relativePath = `/uploads/${folder}/${filename}`;
      }
      
      mediaData.file = relativePath;
      console.log('Saved path:', mediaData.file); // For debugging
    }

    const media = await Media.create(mediaData);

    return successResponse(
      res,
      media,
      'Media created successfully',
      201
    );
  } catch (error) {
    console.error('Create media error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get all media
const getAllMedia = async (req, res) => {
  try {
    const {
      status,
      mediaType,
      categoryId,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (mediaType) where.mediaType = mediaType;
    if (categoryId) where.categoryId = categoryId;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const media = await Media.findAndCountAll({
      where,
      include: [{ model: Category }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    return successResponse(
      res,
      {
        total: media.count,
        page: parseInt(page),
        limit: parseInt(limit),
        data: media.rows
      },
      'Media fetched successfully'
    );
  } catch (error) {
    console.error('Get all media error:', error);
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

    return successResponse(
      res,
      media,
      'Media fetched successfully'
    );
  } catch (error) {
    console.error('Get media by ID error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Update media
const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findByPk(id);

    if (!media) {
      return errorResponse(res, 'Media not found', 404);
    }

    const mediaData = { ...req.body };

    if (req.file) {
      // Fix: Store relative path instead of absolute Windows path
      let relativePath = req.file.path.replace(/\\/g, '/');
      
      // Extract everything after 'uploads/'
      const uploadsIndex = relativePath.indexOf('/uploads/');
      if (uploadsIndex !== -1) {
        relativePath = relativePath.substring(uploadsIndex);
      } else {
        // If no /uploads/ found, just use filename
        const filename = relativePath.split('/').pop();
        const folder = mediaData.mediaType === 'video' ? 'videos' : 
                      mediaData.mediaType === 'image' ? 'images' : 'documents';
        relativePath = `/uploads/${folder}/${filename}`;
      }
      
      mediaData.file = relativePath;
      console.log('Updated path:', mediaData.file); // For debugging
    }

    await media.update(mediaData);

    return successResponse(
      res,
      media,
      'Media updated successfully'
    );
  } catch (error) {
    console.error('Update media error:', error);
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

    return successResponse(
      res,
      null,
      'Media deleted successfully'
    );
  } catch (error) {
    console.error('Delete media error:', error);
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