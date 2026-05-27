const { BoardMember, Category } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create board member
const createBoardMember = async (req, res) => {
  try {
    const boardData = req.body;
    const boardMember = await BoardMember.create(boardData);
    return successResponse(res, boardMember, 'Board member created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all board members
const getAllBoardMembers = async (req, res) => {
  try {
    const { status, role, categoryId, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (role) where.role = role;
    if (categoryId) where.categoryId = categoryId;
    
    const offset = (page - 1) * limit;
    const members = await BoardMember.findAndCountAll({
      where,
      include: [{ model: Category }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: members.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: members.rows
    }, 'Board members fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get board member by ID
const getBoardMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const boardMember = await BoardMember.findByPk(id, {
      include: [{ model: Category }]
    });
    if (!boardMember) {
      return errorResponse(res, 'Board member not found', 404);
    }
    return successResponse(res, boardMember, 'Board member fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update board member
const updateBoardMember = async (req, res) => {
  try {
    const { id } = req.params;
    const boardData = req.body;
    
    const boardMember = await BoardMember.findByPk(id);
    if (!boardMember) {
      return errorResponse(res, 'Board member not found', 404);
    }
    
    await boardMember.update(boardData);
    return successResponse(res, boardMember, 'Board member updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete board member
const deleteBoardMember = async (req, res) => {
  try {
    const { id } = req.params;
    const boardMember = await BoardMember.findByPk(id);
    if (!boardMember) {
      return errorResponse(res, 'Board member not found', 404);
    }
    
    await boardMember.destroy();
    return successResponse(res, null, 'Board member deleted successfully');
  } catch (error) {
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