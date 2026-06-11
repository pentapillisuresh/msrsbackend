const { Document } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getFilePath = (file) => {
  if (file.mimetype.startsWith('image/')) {
    return `/uploads/images/${file.filename}`;
  }

  if (file.mimetype.startsWith('video/')) {
    return `/uploads/videos/${file.filename}`;
  }

  return `/uploads/documents/${file.filename}`;
};

// Create document
const createDocument = async (req, res) => {
  try {
    const documentData = req.body;

    if (req.file) {
      documentData.documentPath = getFilePath(req.file);
    }

    const document = await Document.create(documentData);
    return successResponse(res, document, 'Document created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const { documentType, status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const documents = await Document.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, {
      total: documents.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: documents.rows
    }, 'Documents fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }
    return successResponse(res, document, 'Document fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const documentData = req.body;

    const document = await Document.findByPk(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    if (req.file) {
      documentData.documentPath = `/uploads/documents/${req.file.filename}`;
    }

    await document.update(documentData);
    return successResponse(res, document, 'Document updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    await document.destroy();
    return successResponse(res, null, 'Document deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
};