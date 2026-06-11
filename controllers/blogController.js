const Blog = require('../models/Blog');

// @desc    Get all blogs (with pagination)
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: blogs } = await Blog.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by ID (does NOT increment views anymore)
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment view count for a blog (separate route)
// @route   POST /api/blogs/:id/views
const incrementBlogViews = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      message: 'View count updated',
      views: blog.views
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBlogViews = async (req, res) => {
    try {
      const { id } = req.params;
  
      const blog = await Blog.findByPk(id, {
        attributes: ['id', 'views']
      });
  
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        views: blog.views
      });
    } catch (error) {
      console.error('Get Blog Views Error:', error);
  
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch blog views',
        error: error.message
      });
    }
  };
// @desc    Create a new blog
const createBlog = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    const blog = await Blog.create({ title, content, author, tags, views: 0 });
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing blog
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    const { title, content, author, tags } = req.body;
    await blog.update({ title, content, author, tags });
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    await blog.destroy();
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogViews,
  incrementBlogViews,   // <-- export new function
};