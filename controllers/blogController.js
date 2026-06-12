const { blog: Blog } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Create blog
const createBlog = async (req, res) => {
  try {
    const blogData = req.body;
    if (req.file) {
      blogData.image = `/uploads/images/${req.file.filename}`;
    }
    const blog = await Blog.create(blogData);
    return successResponse(res, blog, 'Blog created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    
    const offset = (page - 1) * limit;
    const blogs = await Blog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: blogs.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: blogs.rows
    }, 'Blogs fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return errorResponse(res, 'Blog not found', 404);
    }
    return successResponse(res, blog, 'Blog fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogData = req.body;
    
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return errorResponse(res, 'Blog not found', 404);
    }
    
    if (req.file) {
      blogData.image = `/uploads/images/${req.file.filename}`;
    }
    
    await blog.update(blogData);
    return successResponse(res, blog, 'Blog updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return errorResponse(res, 'Blog not found', 404);
    }
    
    await blog.destroy();
    return successResponse(res, null, 'Blog deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update blog status
const updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return errorResponse(res, 'Blog not found', 404);
    }
    
    await blog.update({ status });
    return successResponse(res, blog, 'Blog status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Increment blog views
const incrementBlogViews = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return errorResponse(res, 'Blog not found', 404);
    }
    
    blog.views += 1;
    await blog.save();
    
    return successResponse(res, { views: blog.views }, 'Blog views updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get blog views
const getBlogViews = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id, {
      attributes: ['id', 'views']
    });
    
    if (!blog) {
      return errorResponse(res, 'Blog not found', 404);
    }
    
    return successResponse(res, { views: blog.views }, 'Blog views fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get blogs count
const getBlogsCount = async (req, res) => {
  try {
    const count = await Blog.count();
    return successResponse(res, { count }, 'Blogs count fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
  incrementBlogViews,
  getBlogViews,
  getBlogsCount
};