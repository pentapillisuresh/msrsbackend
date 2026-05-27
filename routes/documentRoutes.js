const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');

router.post('/', verifyToken, uploadSingle('document'), createDocument);
router.get('/', verifyToken, getAllDocuments);
router.get('/:id', verifyToken, getDocumentById);
router.put('/:id', verifyToken, uploadSingle('document'), updateDocument);
router.delete('/:id', verifyToken, isAdmin, deleteDocument);

module.exports = router;