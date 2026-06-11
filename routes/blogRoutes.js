const express = require('express');
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementBlogViews,
  getBlogViews,   // <-- import new controller
} = require('../controllers/blogController');

router.route('/')
  .get(getAllBlogs)
  .post(createBlog);

router.route('/:id')
  .get(getBlogById)
  .put(updateBlog)
  .delete(deleteBlog);

// Separate route for view count update
router.post('/:id/views', incrementBlogViews);
router.get('/:id/views', getBlogViews);

module.exports = router;