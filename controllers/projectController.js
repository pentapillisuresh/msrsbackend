const { Project, Category } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create project
const createProject = async (req, res) => {
  try {
    const projectData = req.body;
    if (req.file) {
      projectData.projectImage = `/uploads/images/${req.file.filename}`;
    }
    const project = await Project.create(projectData);
    return successResponse(res, project, 'Project created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const { status, categoryId, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    
    const offset = (page - 1) * limit;
    const projects = await Project.findAndCountAll({
      where,
      include: [{ model: Category }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: projects.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: projects.rows
    }, 'Projects fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Category }]
    });
    
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }
    return successResponse(res, project, 'Project fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = req.body;
    
    const project = await Project.findByPk(id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }
    
    if (req.file) {
      projectData.projectImage = `/uploads/images/${req.file.filename}`;
    }
    
    await project.update(projectData);
    return successResponse(res, project, 'Project updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }
    
    await project.destroy();
    return successResponse(res, null, 'Project deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update project status
const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const project = await Project.findByPk(id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }
    
    await project.update({ status });
    return successResponse(res, project, 'Project status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus
};