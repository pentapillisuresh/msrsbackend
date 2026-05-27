const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus
} = require('../controllers/projectController');

router.post('/', verifyToken, uploadSingle('projectImage'), createProject);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.put('/:id', verifyToken, uploadSingle('projectImage'), updateProject);
router.delete('/:id', verifyToken, isAdmin, deleteProject);
router.patch('/:id/status', verifyToken, isAdmin, updateProjectStatus);

module.exports = router;