const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createAccessLog,
  getAllAccessLogs,
  getAccessLogById,
  updateAccessLog,
  deleteAccessLog
} = require('../controllers/accessLogController');

router.post('/', createAccessLog);
router.get('/', verifyToken, isAdmin, getAllAccessLogs);
router.get('/:id', verifyToken, isAdmin, getAccessLogById);
router.put('/:id', verifyToken,  updateAccessLog);
router.delete('/:id', verifyToken, isAdmin, deleteAccessLog);

module.exports = router;