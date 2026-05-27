const { successResponse, errorResponse } = require('../utils/responseHelper');
const fs = require('fs-extra');
const path = require('path');

// Single image upload
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }
    return successResponse(res, {
      filename: req.file.filename,
      path: `/uploads/images/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size
    }, 'Image uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Multiple images upload
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No files uploaded', 400);
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/images/${file.filename}`,
      originalName: file.originalname,
      size: file.size
    }));
    
    return successResponse(res, files, 'Images uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Single document upload
const uploadSingleDocument = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }
    return successResponse(res, {
      filename: req.file.filename,
      path: `/uploads/documents/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size
    }, 'Document uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Multiple documents upload
const uploadMultipleDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No files uploaded', 400);
    }
    
    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/documents/${file.filename}`,
      originalName: file.originalname,
      size: file.size
    }));
    
    return successResponse(res, files, 'Documents uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Mixed files upload (images + documents)
const uploadMixedFiles = async (req, res) => {
  try {
    const uploadedFiles = {};
    
    if (req.files.images) {
      uploadedFiles.images = req.files.images.map(file => ({
        filename: file.filename,
        path: `/uploads/images/${file.filename}`,
        originalName: file.originalname,
        size: file.size
      }));
    }
    
    if (req.files.documents) {
      uploadedFiles.documents = req.files.documents.map(file => ({
        filename: file.filename,
        path: `/uploads/documents/${file.filename}`,
        originalName: file.originalname,
        size: file.size
      }));
    }
    
    return successResponse(res, uploadedFiles, 'Files uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { filePath } = req.body;
    const fullPath = path.join(__dirname, '../../', filePath);
    
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
      return successResponse(res, null, 'File deleted successfully');
    } else {
      return errorResponse(res, 'File not found', 404);
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleDocument,
  uploadMultipleDocuments,
  uploadMixedFiles,
  deleteFile
};