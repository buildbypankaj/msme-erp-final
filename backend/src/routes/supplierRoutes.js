const express = require('express');
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('admin', 'staff'), createSupplier);
router.get('/', protect, getSuppliers);
router.get('/:id', protect, getSupplierById);
router.put('/:id', protect, authorize('admin', 'staff'), updateSupplier);
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

module.exports = router;