const { BoardMember, Category } = require('../models');
const {
  successResponse,
  errorResponse
} = require('../utils/responseHelper');

// Create board member
const createBoardMember = async (req, res) => {
  try {
    const boardData = req.body;

    // Image upload - Fix: Check if req.file exists properly
    if (req.file && req.file.filename) {
      boardData.image = `/uploads/images/${req.file.filename}`;
    }

    // Validate required fields (add this check)
    if (!boardData.name || !boardData.role || !boardData.email) {
      return errorResponse(res, 'Name, role, and email are required fields', 400);
    }

    const boardMember = await BoardMember.create(boardData);

    // Fetch the created member with category
    const createdMember = await BoardMember.findByPk(boardMember.id, {
      include: [{ model: Category }]
    });

    return successResponse(
      res,
      createdMember,
      'Board member created successfully',
      201
    );

  } catch (error) {
    console.error('Create board member error:', error);
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(res, 'Email already exists', 400);
    }
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return errorResponse(res, messages.join(', '), 400);
    }
    
    return errorResponse(res, error.message, 500);
  }
};

// Get all board members
const getAllBoardMembers = async (req, res) => {
  try {
    const {
      status,
      role,
      categoryId,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (role) where.role = role;
    if (categoryId) where.categoryId = categoryId;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    const members = await BoardMember.findAndCountAll({
      where,
      include: [{ 
        model: Category,
        attributes: ['id', 'name'] // Only fetch needed fields
      }],
      limit: parsedLimit,
      offset: offset,
      order: [['createdAt', 'DESC']],
      distinct: true // Important for count with includes
    });

    return successResponse(
      res,
      {
        total: members.count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(members.count / parsedLimit),
        data: members.rows
      },
      'Board members fetched successfully'
    );

  } catch (error) {
    console.error('Get board members error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get board member by ID
const getBoardMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format (if using UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse(res, 'Invalid ID format', 400);
    }

    const boardMember = await BoardMember.findByPk(id, {
      include: [{ 
        model: Category,
        attributes: ['id', 'name']
      }]
    });

    if (!boardMember) {
      return errorResponse(res, 'Board member not found', 404);
    }

    return successResponse(
      res,
      boardMember,
      'Board member fetched successfully'
    );

  } catch (error) {
    console.error('Get board member by ID error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Update board member
const updateBoardMember = async (req, res) => {
  try {
    const { id } = req.params;
    const boardData = req.body;

    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse(res, 'Invalid ID format', 400);
    }

    const boardMember = await BoardMember.findByPk(id);

    if (!boardMember) {
      return errorResponse(res, 'Board member not found', 404);
    }

    // Image upload - Check if new image is uploaded
    if (req.file && req.file.filename) {
      boardData.image = `/uploads/images/${req.file.filename}`;
    }

    // Remove fields that shouldn't be updated
    delete boardData.id;
    delete boardData.createdAt;

    await boardMember.update(boardData);

    // Fetch updated member with category
    const updatedMember = await BoardMember.findByPk(id, {
      include: [{ model: Category }]
    });

    return successResponse(
      res,
      updatedMember,
      'Board member updated successfully'
    );

  } catch (error) {
    console.error('Update board member error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(res, 'Email already exists', 400);
    }
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return errorResponse(res, messages.join(', '), 400);
    }
    
    return errorResponse(res, error.message, 500);
  }
};

// Delete board member
const deleteBoardMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse(res, 'Invalid ID format', 400);
    }

    const boardMember = await BoardMember.findByPk(id);

    if (!boardMember) {
      return errorResponse(res, 'Board member not found', 404);
    }

    // Optional: Delete associated image file from server
    // if (boardMember.image) {
    //   const fs = require('fs');
    //   const path = require('path');
    //   const imagePath = path.join(__dirname, '..', boardMember.image);
    //   if (fs.existsSync(imagePath)) {
    //     fs.unlinkSync(imagePath);
    //   }
    // }

    await boardMember.destroy();

    return successResponse(
      res,
      null,
      'Board member deleted successfully'
    );

  } catch (error) {
    console.error('Delete board member error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createBoardMember,
  getAllBoardMembers,
  getBoardMemberById,
  updateBoardMember,
  deleteBoardMember
};