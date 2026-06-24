const express = require('express');
const router = express.Router();
const { createExpense, getExpenses, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('admin', 'accountant'), createExpense);
router.get('/', protect, getExpenses);
router.put('/:id', protect, authorize('admin', 'accountant'), updateExpense);
router.delete('/:id', protect, authorize('admin'), deleteExpense);

module.exports = router;