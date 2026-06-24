const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/chat', protect, chat);

module.exports = router;