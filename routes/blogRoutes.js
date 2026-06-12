const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
  incrementBlogViews,
  getBlogViews,
  getBlogsCount
} = require('../controllers/blogController');

// Public routes (no authentication required)
router.post('/', uploadSingle('image'), createBlog);
router.get('/:id/views', getBlogViews);
router.post('/:id/views', incrementBlogViews);

// Admin only routes
router.get('/',  getAllBlogs);
router.get('/count', verifyToken, isAdmin, getBlogsCount);
router.get('/:id',  getBlogById);
router.put('/:id', verifyToken, uploadSingle('image'), updateBlog);
router.delete('/:id', verifyToken, isAdmin, deleteBlog);
router.patch('/:id/status', verifyToken, isAdmin, updateBlogStatus);

module.exports = router;