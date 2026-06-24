const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;