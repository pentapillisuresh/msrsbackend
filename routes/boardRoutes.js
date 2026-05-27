const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  createBoardMember,
  getAllBoardMembers,
  getBoardMemberById,
  updateBoardMember,
  deleteBoardMember
} = require('../controllers/boardController');

router.post('/', verifyToken, isAdmin, createBoardMember);
router.get('/', getAllBoardMembers);
router.get('/:id', getBoardMemberById);
router.put('/:id', verifyToken, isAdmin, updateBoardMember);
router.delete('/:id', verifyToken, isAdmin, deleteBoardMember);

module.exports = router;