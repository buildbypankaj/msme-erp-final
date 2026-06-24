const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('admin', 'staff'), createCategory);
router.get('/', protect, getCategories);
router.put('/:id', protect, authorize('admin', 'staff'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;