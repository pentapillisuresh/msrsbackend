const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus
} = require('../controllers/eventController');

router.post('/', verifyToken, uploadSingle('image'), createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.put('/:id', verifyToken, uploadSingle('image'), updateEvent);
router.delete('/:id', verifyToken, isAdmin, deleteEvent);
router.patch('/:id/status', verifyToken, isAdmin, updateEventStatus);

module.exports = router;