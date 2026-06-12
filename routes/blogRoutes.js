const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../middleware/auth');

const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementBlogViews,
  getBlogViews,
  getBlogsCount, // Add this controller if needed
} = require('../controllers/blogController');

// Public routes
router.post('/', createBlog);
router.post('/:id/views', incrementBlogViews);
router.get('/:id/views', getBlogViews);

// Protected routes
router.get('/', verifyToken, isAdmin, getAllBlogs);
router.get('/count', verifyToken, isAdmin, getBlogsCount);
router.get('/:id', verifyToken, isAdmin, getBlogById);
router.put('/:id', verifyToken, updateBlog);
router.delete('/:id', verifyToken, isAdmin, deleteBlog);

module.exports = router;