const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, uploadWithErrorHandling } = require('../middleware/upload');
const {
  uploadSinglePhoto,
  uploadMultiplePhotos,
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  getFileInfo
} = require('../controllers/uploadController');

const router = express.Router();

// Photo upload routes
router.post('/photo/single', 
  uploadWithErrorHandling(uploadSingle('photo')), 
  uploadSinglePhoto
);

router.post('/photo/multiple', 
  uploadWithErrorHandling(uploadMultiple('photos', 10)), 
  uploadMultiplePhotos
);

// File upload routes
router.post('/file/single', 
  uploadWithErrorHandling(uploadSingle('file')), 
  uploadSingleFile
);

router.post('/file/multiple', 
  uploadWithErrorHandling(uploadMultiple('files', 10)), 
  uploadMultipleFiles
);

// File management routes
router.get('/file/:id', authMiddleware, getFileInfo);
router.delete('/file/:id', deleteFile);

module.exports = router;