const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  replyToMessage,
  deleteMessage,
  permanentDeleteMessage,
  bulkDeleteMessages,
  bulkUpdateStatus,
  getMessagesByEmail,
  getUnreadCount,
  exportMessagesToCSV
} = require('../controllers/messageController');

// Public routes (no authentication required)
router.post('/create', createMessage);

// Protected routes (admin only)
router.get('/all', verifyToken, isAdmin, getAllMessages);
router.get('/unread-count', verifyToken, isAdmin, getUnreadCount);
router.get('/export', verifyToken, isAdmin, exportMessagesToCSV);
router.get('/by-email/:email', verifyToken, isAdmin, getMessagesByEmail);
router.get('/:id', verifyToken, isAdmin, getMessageById);
router.put('/:id/status', verifyToken, isAdmin, updateMessageStatus);
router.post('/:id/reply', verifyToken, isAdmin, replyToMessage);
router.delete('/:id', verifyToken, isAdmin, deleteMessage);
router.delete('/:id/permanent', verifyToken, isAdmin, permanentDeleteMessage);
router.post('/bulk/delete', verifyToken, isAdmin, bulkDeleteMessages);
router.post('/bulk/status', verifyToken, isAdmin, bulkUpdateStatus);

module.exports = router;