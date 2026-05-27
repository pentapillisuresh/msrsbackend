const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  createMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia
} = require('../controllers/mediaController');

router.post('/', verifyToken, uploadSingle('file'), createMedia);
router.get('/', getAllMedia);
router.get('/:id', getMediaById);
router.put('/:id', verifyToken, uploadSingle('file'), updateMedia);
router.delete('/:id', verifyToken, isAdmin, deleteMedia);

module.exports = router;