const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUser, deleteUser, approveUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('admin'), createUser);
router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.post('/:id/approve', protect, authorize('admin'), approveUser);

module.exports = router;