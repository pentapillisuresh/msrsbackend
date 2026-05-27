const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  updateMeetingStatus
} = require('../controllers/meetingController');

router.post('/', createMeeting);
router.get('/', verifyToken, getAllMeetings);
router.get('/:id', verifyToken, getMeetingById);
router.put('/:id', verifyToken, updateMeeting);
router.delete('/:id', verifyToken, isAdmin, deleteMeeting);
router.patch('/:id/status', verifyToken, isAdmin, updateMeetingStatus);

module.exports = router;