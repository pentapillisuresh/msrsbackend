const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createVolunteer,
  getAllVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
  updateVolunteerStatus
} = require('../controllers/volunteerController');

router.post('/', createVolunteer);
router.get('/', verifyToken, getAllVolunteers);
router.get('/:id', verifyToken, getVolunteerById);
router.put('/:id', verifyToken, updateVolunteer);
router.delete('/:id', verifyToken, isAdmin, deleteVolunteer);
router.patch('/:id/status', verifyToken, isAdmin, updateVolunteerStatus);

module.exports = router;