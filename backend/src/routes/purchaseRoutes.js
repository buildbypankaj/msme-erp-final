const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getPurchases,
  getPurchaseById,
} = require('../controllers/purchaseController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('admin', 'staff'), createPurchase);
router.get('/', protect, getPurchases);
router.get('/:id', protect, getPurchaseById);

module.exports = router;