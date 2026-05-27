const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  createELibrary,
  getAllELibrary,
  getELibraryById,
  updateELibrary,
  deleteELibrary
} = require('../controllers/eLibraryController');

router.post('/', verifyToken, uploadSingle('file'), createELibrary);
router.get('/', getAllELibrary);
router.get('/:id', getELibraryById);
router.put('/:id', verifyToken, uploadSingle('file'), updateELibrary);
router.delete('/:id', verifyToken, isAdmin, deleteELibrary);

module.exports = router;