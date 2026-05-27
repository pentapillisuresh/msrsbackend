const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, uploadFields } = require('../middleware/upload');
const {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleDocument,
  uploadMultipleDocuments,
  uploadMixedFiles,
  deleteFile
} = require('../controllers/uploadController');

// Single image upload
router.post('/image/single', verifyToken, uploadSingle('image'), uploadSingleImage);

// Multiple images upload
router.post('/image/multiple', verifyToken, uploadMultiple('images', 10), uploadMultipleImages);

// Single document upload
router.post('/document/single', verifyToken, uploadSingle('document'), uploadSingleDocument);

// Multiple documents upload
router.post('/document/multiple', verifyToken, uploadMultiple('documents', 10), uploadMultipleDocuments);

// Mixed files upload
router.post('/mixed', verifyToken, uploadFields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 10 }
]), uploadMixedFiles);

// Delete file
router.delete('/file', verifyToken, isAdmin, deleteFile);

module.exports = router;