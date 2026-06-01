const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } =
  require('../middleware/auth');

const { uploadSingle } =
  require('../middleware/upload');

const {
  createBoardMember,
  getAllBoardMembers,
  getBoardMemberById,
  updateBoardMember,
  deleteBoardMember
} = require('../controllers/boardController');

router.post(
  '/',
  verifyToken,
  isAdmin,
  uploadSingle('image'),
  createBoardMember
);

router.get('/', getAllBoardMembers);

router.get('/:id', getBoardMemberById);

router.put(
  '/:id',
  verifyToken,
  isAdmin,
  uploadSingle('image'),
  updateBoardMember
);

router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  deleteBoardMember
);

module.exports = router;