const { Temple } = require('../models');
const { validationResult } = require('express-validator');

const createTempleInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const templeInfo = await Temple.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Temple information created successfully',
      data: { templeInfo }
    });
  } catch (error) {
    console.error('Create temple info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const getAllTempleInfo = async (req, res) => {
  try {
    const { category, isActive = true } = req.query;
    
    const whereClause = { isActive };
    if (category) {
      whereClause.category = category;
    }

    const templeInfo = await Temple.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { templeInfo }
    });
  } catch (error) {
    console.error('Get all temple info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const getTempleInfoById = async (req, res) => {
  try {
    const { id } = req.params;

    const templeInfo = await Temple.findByPk(id);
    if (!templeInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Temple information not found'
      });
    }

    res.json({
      status: 'success',
      data: { templeInfo }
    });
  } catch (error) {
    console.error('Get temple info by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const updateTempleInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const templeInfo = await Temple.findByPk(id);
    if (!templeInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Temple information not found'
      });
    }

    await templeInfo.update(req.body);

    res.json({
      status: 'success',
      message: 'Temple information updated successfully',
      data: { templeInfo }
    });
  } catch (error) {
    console.error('Update temple info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const deleteTempleInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const templeInfo = await Temple.findByPk(id);
    if (!templeInfo) {
      return res.status(404).json({
        status: 'error',
        message: 'Temple information not found'
      });
    }

    await templeInfo.destroy();

    res.json({
      status: 'success',
      message: 'Temple information deleted successfully'
    });
  } catch (error) {
    console.error('Delete temple info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const getTempleInfoByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const templeInfo = await Temple.findAll({
      where: { 
        category,
        isActive: true 
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { templeInfo }
    });
  } catch (error) {
    console.error('Get temple info by category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createTempleInfo,
  getAllTempleInfo,
  getTempleInfoById,
  updateTempleInfo,
  deleteTempleInfo,
  getTempleInfoByCategory
};